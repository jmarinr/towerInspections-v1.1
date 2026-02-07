import { supabase } from './supabaseClient';
import { getDeviceId } from './deviceId';
import { dataUrlToBlob } from './dataUrl';

const ORG_CODE = 'PTI';
const BUCKET = 'pti-inspect';
const SUBMISSION_IDS_KEY = 'pti_submission_ids_v1';
const PENDING_SYNC_KEY = 'pti_pending_sync_v1';
const PENDING_ASSETS_KEY = 'pti_pending_assets_v1';

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function getAppVersion() {
  // Vite injects this at build time if you define it; fallback to package.json string shown in UI.
  return import.meta.env.VITE_APP_VERSION || '1.2.1';
}

function loadMap(key) {
  return safeJsonParse(localStorage.getItem(key), {}) || {};
}

function saveMap(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

export async function ensureSubmissionId(formCode, formVersion = '1.2.1') {
  const deviceId = getDeviceId();
  const map = loadMap(SUBMISSION_IDS_KEY);
  if (map[formCode]) return map[formCode];

  // Create minimal row (payload can be null initially)
  const row = {
    org_code: ORG_CODE,
    device_id: deviceId,
    form_code: formCode,
    form_version: formVersion,
    app_version: getAppVersion(),
    payload: {},
    // `last_saved_at` column is not guaranteed to exist in every demo DB.
    // We keep the timestamp inside the JSON payload instead of relying on a
    // dedicated column (avoids PostgREST 400 errors when the column is missing).
  };

  const { data, error } = await supabase
    .from('submissions')
    .upsert(row, { onConflict: 'org_code,device_id,form_code' })
    .select('id')
    .single();

  if (error) throw error;
  map[formCode] = data.id;
  saveMap(SUBMISSION_IDS_KEY, map);
  return data.id;
}

export function queueSubmissionSync(formCode, payload, formVersion = '1.2.1') {
  const map = loadMap(PENDING_SYNC_KEY);
  map[formCode] = {
    formCode,
    formVersion,
    payload,
    ts: Date.now(),
  };
  saveMap(PENDING_SYNC_KEY, map);
}

export function queueAssetUpload(formCode, assetType, dataUrl) {
  const map = loadMap(PENDING_ASSETS_KEY);
  const list = map[formCode] || [];
  // Replace if same assetType already pending (keeps latest)
  const idx = list.findIndex((x) => x.assetType === assetType);
  const item = { assetType, dataUrl, ts: Date.now() };
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  map[formCode] = list;
  saveMap(PENDING_ASSETS_KEY, map);
}

function extFromMime(mime) {
  if (!mime) return 'bin';
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'bin';
}

async function uploadToStorage(path, blob) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export async function flushSupabaseQueues({ formCode } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  // 1) submissions
  const pending = loadMap(PENDING_SYNC_KEY);
  const codes = formCode ? [formCode] : Object.keys(pending);

  for (const code of codes) {
    const item = pending[code];
    if (!item) continue;

    try {
      await ensureSubmissionId(code, item.formVersion);

      const deviceId = getDeviceId();
      const row = {
        org_code: ORG_CODE,
        device_id: deviceId,
        form_code: code,
        form_version: item.formVersion,
        app_version: getAppVersion(),
        // We store the save timestamp inside the JSON payload to avoid
        // requiring an additional SQL column in the demo DB.
        payload: {
          ...item.payload,
          _meta: {
            ...(item.payload?._meta || {}),
            last_saved_at: new Date().toISOString(),
          },
        },
      };

      const { error } = await supabase
        .from('submissions')
        .upsert(row, { onConflict: 'org_code,device_id,form_code' });

      if (error) throw error;

      // remove from queue only if success
      const fresh = loadMap(PENDING_SYNC_KEY);
      delete fresh[code];
      saveMap(PENDING_SYNC_KEY, fresh);
    } catch (e) {
      // keep queued
      // eslint-disable-next-line no-console
      console.warn('[Supabase] submission sync failed', code, e?.message || e);
    }
  }

  // 2) assets
  const assetsMap = loadMap(PENDING_ASSETS_KEY);
  const assetCodes = formCode ? [formCode] : Object.keys(assetsMap);

  for (const code of assetCodes) {
    const list = assetsMap[code] || [];
    if (!list.length) continue;

    for (const asset of list) {
      try {
        const submissionId = await ensureSubmissionId(code);
        const blob = dataUrlToBlob(asset.dataUrl);
        const ext = extFromMime(blob.type);
        const safeType = (asset.assetType || 'asset').replace(/[^a-zA-Z0-9-_./]/g, '_');
        const objectPath = `${ORG_CODE}/${getDeviceId()}/${code}/${submissionId}/${safeType}.${ext}`;
        const publicUrl = await uploadToStorage(objectPath, blob);

        // Register in DB
        // NOTE: submission_assets.path is NOT NULL in DB, so we must send it.
        const row = {
          submission_id: submissionId,
          asset_key: objectPath,
          asset_type: asset.assetType,
          bucket: BUCKET, // optional (has default) but OK to send
          path: objectPath,
          public_url: publicUrl,
          // created_at has default now() in DB; avoid sending to prevent schema mismatch
        };
        const { error: assetErr } = await supabase.from('submission_assets').insert([row]);
        if (assetErr) throw assetErr;

        // remove item on success
        const freshMap = loadMap(PENDING_ASSETS_KEY);
        const freshList = freshMap[code] || [];
        freshMap[code] = freshList.filter((x) => x.assetType !== asset.assetType);
        saveMap(PENDING_ASSETS_KEY, freshMap);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Supabase] asset upload failed', code, asset?.assetType, e?.message || e);
      }
    }
  }
}

export function startSupabaseBackgroundSync() {
  // flush on load
  setTimeout(() => flushSupabaseQueues(), 1500);

  // flush on going online
  window.addEventListener('online', () => flushSupabaseQueues());

  // periodic flush
  setInterval(() => flushSupabaseQueues(), 15000);
}
