import { supabase } from './supabaseClient';
import { getDeviceId } from './deviceId';
import { dataUrlToBlob } from './dataUrl';


// Converts multiple image representations into a Blob:
// - DataURL string: "data:image/...;base64,..."
// - Blob/File objects
// - Object URLs: "blob:..."
async function toBlobAny(input) {
  if (!input) throw new Error("Invalid image input (empty)");

  // Blob or File
  if (typeof Blob !== "undefined" && input instanceof Blob) return input;

  // Data URL string
  if (typeof input === "string") {
    if (input.startsWith("data:")) return dataUrlToBlob(input);
    if (input.startsWith("blob:")) {
      const resp = await fetch(input);
      if (!resp.ok) throw new Error("Failed to fetch blob URL");
      return await resp.blob();
    }
  }

  throw new Error("Invalid image input (expected DataURL string or Blob/File)");
}

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



export function clearSupabaseLocalForForm(formCode) {
  if (!formCode) return;
  try {
    const syncMap = loadMap(PENDING_SYNC_KEY);
    if (syncMap && typeof syncMap === 'object') {
      delete syncMap[formCode];
      saveMap(PENDING_SYNC_KEY, syncMap);
    }
  } catch (e) {}

  try {
    const assetsMap = loadMap(PENDING_ASSETS_KEY);
    if (assetsMap && typeof assetsMap === 'object') {
      delete assetsMap[formCode];
      saveMap(PENDING_ASSETS_KEY, assetsMap);
    }
  } catch (e) {}

  try {
    const idsMap = loadMap(SUBMISSION_IDS_KEY);
    if (idsMap && typeof idsMap === 'object') {
      delete idsMap[formCode];
      saveMap(SUBMISSION_IDS_KEY, idsMap);
    }
  } catch (e) {}
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
  if (!formCode || !assetType) return

  const map = loadMap(PENDING_ASSETS_KEY)
  const list = Array.isArray(map[formCode]) ? map[formCode] : []
  const now = Date.now()

  const isBlob = typeof Blob !== 'undefined' && dataUrl instanceof Blob
  const isDataUrlString =
    typeof dataUrl === 'string' &&
    dataUrl.trim().length > 0 &&
    dataUrl.trimStart().startsWith('data:')

  // Si recibimos un string que no es Data URL, lo ignoramos (evita errores de build/runtime)
  if (typeof dataUrl === 'string' && dataUrl.trim().length > 0 && !isDataUrlString) {
    console.warn('[Supabase] Ignorando asset inválido (string no es Data URL).', {
      formCode,
      assetType,
      preview: dataUrl.slice(0, 30),
    })
    return
  }

  const action = (isBlob || isDataUrlString) ? 'upload' : 'delete'

  const item = action === 'upload'
    ? { assetType, action, dataUrl, ts: now }
    : { assetType, action, ts: now }

  const idx = list.findIndex(a => a.assetType === assetType)
  if (idx >= 0) list[idx] = item
  else list.push(item)

  map[formCode] = list
  saveMap(PENDING_ASSETS_KEY, map)
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
  const assetsMap = loadMap(PENDING_ASSETS_KEY)
  for (const [formCode, pendingAssetsRaw] of Object.entries(assetsMap)) {
    const pendingAssets = Array.isArray(pendingAssetsRaw) ? pendingAssetsRaw : []
    if (!pendingAssets.length) continue

    // Ensure we have a submission_id for this form so we can attach assets (or delete DB rows)
    const submissionId = await ensureSubmissionId(formCode)

    // Process items one-by-one so we can persist progress and retry cleanly
    for (const asset of pendingAssets) {
      const action = asset?.action || 'upload'

      // DELETE: remove the DB record for this asset slot, keep Storage object (Option A)
      if (action === 'delete' || !asset?.dataUrl) {
        const { error: delErr } = await supabase
          .from('submission_assets')
          .delete()
          .eq('submission_id', submissionId)
          .eq('asset_type', asset.assetType)

        if (delErr) {
          console.warn('[Supabase] asset delete failed', formCode, asset?.assetType, delErr?.message || delErr)
          break
        }

        // remove from queue
        assetsMap[formCode] = (assetsMap[formCode] || []).filter(a => a.assetType !== asset.assetType)
        saveMap(PENDING_ASSETS_KEY, assetsMap)
        continue
      }

      // UPLOAD
      try {
        const blob = await toBlobAny(asset.dataUrl)

        const extFromMime = (blob.type || '').split('/')[1] || 'jpg'
        const ext = String(extFromMime).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        const safeType = String(asset.assetType).replace(/[^a-zA-Z0-9\-_.:]/g, '_')

        const objectPath = `${ORG_CODE}/${getDeviceId()}/${formCode}/${submissionId}/${safeType}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('pti-inspect')
          .upload(objectPath, blob, { upsert: true, contentType: blob.type || 'image/jpeg' })

        if (upErr) throw upErr

        const { data: pub } = supabase.storage.from('pti-inspect').getPublicUrl(objectPath)
        const publicUrl = pub?.publicUrl || null

        const row = {
          submission_id: submissionId,
          asset_key: objectPath,
          asset_type: asset.assetType,
          bucket: 'pti-inspect',
          path: objectPath,
          public_url: publicUrl,
          mime: blob.type || null,
          size_bytes: typeof blob.size === 'number' ? blob.size : null
        }

        // Prefer UPDATE by slot first (works even if unique constraint is not on asset_key)
        const { data: updRows, error: updErr } = await supabase
          .from('submission_assets')
          .update(row)
          .eq('submission_id', submissionId)
          .eq('asset_type', asset.assetType)
          .select('id')

        if (updErr) throw updErr

        if (!updRows || updRows.length === 0) {
          const { error: insErr } = await supabase
            .from('submission_assets')
            .insert([row])

          if (insErr) {
            // If a unique constraint fires (asset_key or otherwise), fall back to UPDATE by asset_key
            const { error: upd2Err } = await supabase
              .from('submission_assets')
              .update(row)
              .eq('asset_key', objectPath)

            if (upd2Err) throw insErr
          }
        }

        // remove from queue on success
        assetsMap[formCode] = (assetsMap[formCode] || []).filter(a => a.assetType !== asset.assetType)
        saveMap(PENDING_ASSETS_KEY, assetsMap)
      } catch (e) {
        console.warn('[Supabase] asset upload failed', formCode, asset?.assetType, e?.message || e)
        break
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
