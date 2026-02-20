import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { queueSubmissionSync, queueAssetUpload, flushSupabaseQueues, clearSupabaseLocalForForm } from '../lib/supabaseSync'
import { getDeviceId } from '../lib/deviceId'

const getDefaultDate = () => new Date().toISOString().split('T')[0]
const getDefaultTime = () => new Date().toTimeString().slice(0, 5)

// Versión mostrada en UI y enviada como metadata a Supabase
const APP_VERSION_DISPLAY = '2.0.8'

const isDataUrlString = (value) =>
  typeof value === 'string' && value.startsWith('data:')

// ---- Helpers to strip large data URLs before persisting to localStorage ----
// Photos are already synced to Supabase Storage, so we only keep a small marker
// in localStorage to remember that a photo exists (without the heavy base64 payload).
const PHOTO_PLACEHOLDER = '__photo__'

function stripSingle(val) {
  if (typeof val === 'string' && val.startsWith('data:')) return PHOTO_PLACEHOLDER
  return val
}

function stripDataUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k] = stripSingle(v)
  }
  return out
}

function stripDataUrlFields(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k] = (typeof v === 'string' && v.startsWith('data:')) ? PHOTO_PLACEHOLDER : v
  }
  return out
}

/** Returns true if the value is a renderable image source (data URL, blob URL, or http URL) */
export function isDisplayablePhoto(val) {
  if (!val || typeof val !== 'string') return false
  if (val === PHOTO_PLACEHOLDER) return false
  return val.startsWith('data:') || val.startsWith('blob:') || val.startsWith('http')
}

/**
 * Recover a photo data URL from the pending assets queue in localStorage.
 * Used after reload when the store only has '__photo__' placeholder.
 * @param {string} formCode - e.g. 'inspection-general'
 * @param {string} assetType - e.g. 'inspection:item1:before'
 * @returns {string|null} data URL or null
 */
export function recoverPhotoFromQueue(formCode, assetType) {
  try {
    const raw = localStorage.getItem('pti_pending_assets_v1')
    if (!raw) return null
    const map = JSON.parse(raw)
    const list = Array.isArray(map?.[formCode]) ? map[formCode] : []
    const asset = list.find(a => a.assetType === assetType && a.action === 'upload' && a.dataUrl)
    return asset?.dataUrl || null
  } catch (_) {
    return null
  }
}

/**
 * Deep-strip data URLs from any object/nested structure before sending to Supabase.
 * Replaces data:image/... strings with '__photo_uploaded__' marker.
 * This prevents Supabase JSONB column overflow (data URLs can be 1-3MB each).
 */
function stripPayloadPhotos(obj) {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') {
    if (obj.startsWith('data:')) return '__photo_uploaded__'
    if (obj.startsWith('blob:')) return '__photo_uploaded__'
    return obj
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj
  if (Array.isArray(obj)) return obj.map(stripPayloadPhotos)
  if (typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = stripPayloadPhotos(v)
    }
    return out
  }
  return obj
}

// Datos por defecto para mantenimiento v1.1.4
const getDefaultMaintenanceData = () => ({
  currentStep: 1,
  completedSteps: [],
  formData: {
    proveedor: '',
    tipoVisita: '',
    nombreSitio: '',
    idSitio: '',
    coordenadas: '',
    tipoSitio: '',
    fechaInicio: '',
    horaEntrada: '',
    horaSalida: '',
    tipoTorre: '',
    alturaTorre: '',
    alturaEdificio: '',
    condicionTorre: '',
    numSecciones: '',
    tipoSeccion: '',
    tipoPierna: '',
    tieneCamuflaje: '',
    tipoCamuflaje: '',
    fotoTorre: '',
    calle: '',
    numero: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: '',
    descripcionSitio: '',
    restriccionHorario: '',
    descripcionAcceso: '',
    propietarioLocalizable: '',
    tipoLlave: '',
    claveCombinacion: '',
    memorandumRequerido: '',
    problemasAcceso: '',
    fotoCandado: '',
    ubicacionMedidores: '',
    tipoConexion: '',
    capacidadTransformador: '',
    numMedidores: '',
    medidorSeparadoLuces: '',
    fibraOptica: '',
    vandalismo: '',
    descripcionVandalismo: '',
    equiposFaltantes: '',
    defectosOperacion: '',
    observacionesGenerales: '',
  },
  checklistData: {},
  photos: {},
})

// Datos por defecto para Inventario de Equipos (Formulario 3)
const getDefaultEquipmentInventoryData = () => ({
  siteInfo: {
    proveedor: '',
    tipoVisita: '', // RoofTop | RawLand
    idSitio: '',
    nombreSitio: '',
    fechaInicio: '',
    direccion: '',
    alturaMts: '',
    tipoSitio: '',
    tipoEstructura: '',
    latitud: '',
    longitud: '',
  },
  torre: {
    items: [
      { alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', dimensionesMts: '', areaM2: '', carrier: '' },
    ],
  },
  piso: {
    clientes: [
      {
        tipoCliente: 'ancla', // ancla | colo
        nombreCliente: '',
        areaArrendada: '',
        areaEnUso: '',
        placaEquipos: '',
        gabinetes: [
          { gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' },
        ],
      },
    ],
  },
  distribucionTorre: {
    // JSON editable + evidencia PNG
    scene: { objects: [] },
    pngDataUrl: '',
    fotoTorreDataUrl: '',
  },
  croquisEsquematico: {
    drawing: null,
    pngDataUrl: '',
    niveles: { nivel1: '', nivel2: '', nivel3: '', banqueta: '' },
  },
  planoPlanta: {
    drawing: null,
    pngDataUrl: '',
  },
})

// Datos por defecto para Formulario 6: Reporte de Trabajos Ejecutados (Mantenimiento Preventivo)
const getDefaultPMExecutedData = () => ({
  siteInfo: {
    proveedor: '',
    idSitio: '',
    tipoVisita: '',
    nombreSitio: '',
    tipoSitio: '', // rooftop | rawland
    fecha: '',
    hora: '',
    coordenadas: '',
    direccion: '',
  },
  photos: {}, // `${activityId}-before` / `${activityId}-after`
})

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ============ SESSION / AUTH ============
      session: null, // { username, name, role, roleLabel }
      setSession: (user) => set({ session: user }),
      logout: () => set({ session: null, activeVisit: null }),

      // ============ ACTIVE VISIT (ORDER) ============
      activeVisit: null, // site_visits row from Supabase
      completedForms: [], // form IDs completed in current visit (e.g. ['inspeccion', 'mantenimiento'])
      // Continue existing order — never reset form data
      setActiveVisit: (visit) => {
        set({ activeVisit: visit, completedForms: [] })
      },
      // Create new order — reset all form data to start clean
      setNewActiveVisit: (visit) => {
        get().resetAllForms()
        set({ activeVisit: visit, completedForms: [] })
      },
      clearActiveVisit: () => {
        get().resetAllForms()
        set({ activeVisit: null, completedForms: [] })
      },
      // Navigate to order screen without resetting form data
      navigateToOrderScreen: () => {
        set({ activeVisit: null, completedForms: [] })
      },
      resetAllForms: () => {
        // Reset all 6 form data stores
        const allFormKeys = [
          'inspeccion',
          'mantenimiento',
          'inventario',
          'mantenimiento-ejecutado',
          'puesta-tierra',
          'safety-system',
        ]
        for (const key of allFormKeys) {
          try { get().resetFormDraft(key) } catch (_) {}
        }
        // Also clear formMeta (start timestamps)
        set({ formMeta: {} })
      },
      markFormCompleted: (formId) => set((state) => {
        const list = state.completedForms || []
        if (list.includes(formId)) return state
        return { completedForms: [...list, formId] }
      }),
      isFormCompleted: (formId) => (get().completedForms || []).includes(formId),

      // ============ CONNECTIVITY ============
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'offline'
      pendingSyncCount: 0,
      setOnline: (online) => set({ isOnline: online, syncStatus: online ? 'idle' : 'offline' }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setPendingSyncCount: (count) => set({ pendingSyncCount: count }),

      // ============ TOAST ============
      toast: { show: false, message: '', type: 'info' },
      _toastTimer: null,
      showToast: (message, type = 'info') => {
        // Clear any existing timer to prevent race conditions
        const prev = get()._toastTimer
        if (prev) clearTimeout(prev)

        set({ toast: { show: true, message, type } })
        const timer = setTimeout(() => {
          try {
            set({ toast: { show: false, message: '', type: 'info' }, _toastTimer: null })
          } catch (_) {
            // If set() fails (e.g. persist/localStorage error), force-hide via DOM
          }
        }, 3000)
        // Store timer id (best effort, don't let this fail)
        try { set({ _toastTimer: timer }) } catch (_) {}
      },
      hideToast: () => set({ toast: { show: false, message: '', type: 'info' } }),

      // ============ AUTOSAVE ============
      showAutosave: false,
      triggerAutosave: (formCode) => {
        set({ showAutosave: true })
        setTimeout(() => set({ showAutosave: false }), 1500)

        // Option C: also queue a background upsert to Supabase on each local autosave.
        try {
          if (formCode) {
            const payload = get().getSupabasePayloadForForm(formCode)
            if (payload) {
              queueSubmissionSync(formCode, payload, APP_VERSION_DISPLAY)
              flushSupabaseQueues({ formCode })
            }
          }
        } catch (e) {
          console.warn('[Supabase] autosave queue failed', e?.message || e)
        }
      },

            // ============ FORM META (Inicio automático) ============
      formMeta: {},
      setFormMeta: (formId, meta) => set((state) => ({ formMeta: { ...(state.formMeta || {}), [formId]: meta } })),
      clearFormMeta: (formId) => set((state) => {
        const fm = { ...(state.formMeta || {}) }
        delete fm[formId]
        return { formMeta: fm }
      }),


      // ============ RESET / FINALIZE ============
      resetFormDraft: (formKey) => {
        const map = {
          'inspeccion': { code: 'inspection-general', reset: 'resetInspectionData', metaKey: 'inspeccion' },
          'mantenimiento': { code: 'preventive-maintenance', reset: 'resetMaintenanceData', metaKey: 'mantenimiento' },
          'inventario': { code: 'equipment', reset: 'resetEquipmentInventoryData', metaKey: 'equipment' },
          'mantenimiento-ejecutado': { code: 'executed-maintenance', reset: 'resetPMExecutedData', metaKey: 'mantenimiento-ejecutado' },
          'puesta-tierra': { code: 'grounding-system-test', reset: 'resetGroundingSystemData', metaKey: 'grounding-system-test' },
          'safety-system': { code: 'safety-system', reset: 'resetSafetyClimbingData', metaKey: 'sistema-ascenso' },
        }
        const cfg = map[formKey]
        if (!cfg) return
        try { clearSupabaseLocalForForm(cfg.code) } catch (e) {}
        get().clearFormMeta(cfg.metaKey)
        const fn = get()[cfg.reset]
        if (typeof fn === 'function') fn()

        set((state) => {
          const aq = Array.isArray(state.assetUploadQueue) ? state.assetUploadQueue : []
          return { assetUploadQueue: aq.filter(a => a.formCode !== cfg.code) }
        })
      },

      finalizeForm: async (formKey) => {
        const map = {
          'inspeccion': { code: 'inspection-general', formId: 'inspeccion' },
          'mantenimiento': { code: 'preventive-maintenance', formId: 'mantenimiento' },
          'inventario': { code: 'equipment', formId: 'equipment' },
          'mantenimiento-ejecutado': { code: 'executed-maintenance', formId: 'mantenimiento-ejecutado' },
          'puesta-tierra': { code: 'grounding-system-test', formId: 'grounding-system-test' },
          'safety-system': { code: 'safety-system', formId: 'sistema-ascenso' },
        }
        const cfg = map[formKey]
        if (!cfg) throw new Error('unknown form: ' + formKey)

        // Build payload (photos are stripped automatically)
        const payload = get().getSupabasePayloadForForm(cfg.code)
        if (payload) {
          // Mark as finalized (distinguishes from autosave)
          payload.payload.finalized = true
          payload.payload.meta.finishedAt = new Date().toISOString()
          queueSubmissionSync(cfg.code, payload, APP_VERSION_DISPLAY)
        }

        // Try to flush to Supabase — if it fails, data stays in queue for retry
        let flushSuccess = false
        try {
          await flushSupabaseQueues({ formCode: cfg.code })
          flushSuccess = true
        } catch (e) {
          console.warn('[finalizeForm] flush failed (will retry in background):', e?.message || e)
        }

        // Always clean up local state and reset form
        try { clearSupabaseLocalForForm(cfg.code) } catch (e) {}
        get().resetFormDraft(formKey)

        // Track form as completed in current visit
        get().markFormCompleted(cfg.formId)

        return { synced: flushSuccess }
      },

  // Build the full Supabase payload for a given autosave bucket (one submission per form)
  // Note: we intentionally send **all** captured data for the form (not a minimal subset).
  getSupabasePayloadForForm: (formCode) => {
    const state = get()

    const toFormCode = (code) => {
      if (!code) return 'unknown'
      if (code.startsWith('inspection')) return 'inspeccion'
      if (code === 'preventive-maintenance') return 'mantenimiento'
      if (code === 'executed-maintenance' || code === 'pm-executed') return 'mantenimiento-ejecutado'
      if (code === 'equipment-inventory' || code === 'equipment') return 'inventario'
      if (code === 'grounding-system-test') return 'puesta-tierra'
      if (code === 'safety-system') return 'sistema-ascenso'
      return code
    }

    const canonicalFormCode = toFormCode(formCode)

    // FormMeta keys match the formId from FormIntro
    const metaKeyMap = {
      'inspeccion': 'inspeccion',
      'mantenimiento': 'mantenimiento',
      'mantenimiento-ejecutado': 'mantenimiento-ejecutado',
      'inventario': 'equipment',
      'puesta-tierra': 'grounding-system-test',
      'sistema-ascenso': 'sistema-ascenso',
    }
    const metaKey = metaKeyMap[canonicalFormCode] || canonicalFormCode
    const meta = (state.formMeta && state.formMeta[metaKey]) ? state.formMeta[metaKey] : null

    // Pick the full form snapshot from the store
    const rawSnapshot =
      canonicalFormCode === 'inspeccion' ? state.inspectionData
      : canonicalFormCode === 'mantenimiento' ? state.maintenanceData
      : canonicalFormCode === 'mantenimiento-ejecutado' ? state.pmExecutedData
      : canonicalFormCode === 'inventario' ? state.equipmentInventoryData
      : canonicalFormCode === 'puesta-tierra' ? state.groundingSystemData
      : canonicalFormCode === 'sistema-ascenso' ? state.safetyClimbingData
      : null

    // CRITICAL: Strip all data URLs from payload to avoid Supabase JSONB overflow
    // Photos are already uploaded separately via queueAssetUpload → submission_assets
    const snapshot = stripPayloadPhotos(rawSnapshot)

    // Collect any queued assets that belong to this form
    const queuedAssets = Array.isArray(state.assetUploadQueue)
      ? state.assetUploadQueue.filter(a => a && a.formCode === formCode)
      : []

    return {
      org_code: 'PTI',
      device_id: getDeviceId(),
      form_code: canonicalFormCode,
      app_version: APP_VERSION_DISPLAY,
      form_version: '1',
      site_visit_id: (state.activeVisit?.id && !String(state.activeVisit.id).startsWith('local-'))
        ? state.activeVisit.id
        : null,
      payload: {
        meta: meta ? {
          ...meta,
        } : {
          startedAt: null,
        },
        autosave_bucket: formCode,
        finalized: false,
        data: snapshot,
        submitted_by: state.session ? {
          username: state.session.username,
          name: state.session.name,
          role: state.session.role,
        } : null,
        submitted_at: new Date().toISOString(),
      },
      assets: queuedAssets.map(a => ({
        key: a.storageKey,
        type: a.assetType || 'photo',
        bucket: a.bucket || 'pti-inspect',
        meta: {
          field: a.field || null,
          capturedAt: a.capturedAt || null
        }
      }))
    }
  },


// ============ INSPECTION DATA (Original) ============
      inspectionData: {
        siteInfo: { proveedor: '', idSitio: '', nombreSitio: '', tipoSitio: '', coordenadas: '', direccion: '', fecha: '', hora: '', tipoTorre: '', alturaTorre: '' },
        items: {},
        photos: {},
      },
      
      updateSiteInfo: (field, value) => set((state) => ({
        inspectionData: { ...state.inspectionData, siteInfo: { ...state.inspectionData.siteInfo, [field]: value } }
      })),

      updateItemStatus: (itemId, status) => {
        set((state) => ({
          inspectionData: { ...state.inspectionData, items: { ...state.inspectionData.items, [itemId]: { ...state.inspectionData.items[itemId], status } } }
        }))
        get().triggerAutosave('inspection-general')
      },

      updateItemObservation: (itemId, observation) => set((state) => ({
        inspectionData: { ...state.inspectionData, items: { ...state.inspectionData.items, [itemId]: { ...state.inspectionData.items[itemId], observation } } }
      })),

      updateItemPhoto: (itemId, photoType, photoData) => {
        // Evita encolar uploads con datos inválidos (algunos navegadores pueden entregar null/ArrayBuffer)
        if (photoData != null && !isDataUrlString(photoData)) {
          console.warn('[Photo] Captura inválida (no es Data URL).', {
            itemId,
            photoType,
            receivedType: typeof photoData,
          })
          return
        }

        set((state) => ({
          inspectionData: {
            ...state.inspectionData,
            photos: {
              ...state.inspectionData.photos,
              [`${itemId}-${photoType}`]: photoData,
            },
          },
        }))

        // Upload photo in background (best effort)
        if (photoData) {
          try {
            queueAssetUpload('inspection-general', `inspection:${itemId}:${photoType}`, photoData)
            flushSupabaseQueues({ formCode: 'inspection-general' })
          } catch (e) {
            // best-effort
          }
        }

        get().triggerAutosave('inspection-general')
      },

      

      resetInspectionData: () => set({
        inspectionData: {
          siteInfo: { proveedor: '', idSitio: '', nombreSitio: '', tipoSitio: '', coordenadas: '', direccion: '', fecha: '', hora: '', tipoTorre: '', alturaTorre: '' },
          items: {},
          photos: {},
        }
      }),

// ============ MAINTENANCE DATA v1.1.4 ============
      maintenanceData: getDefaultMaintenanceData(),

            // ============ EQUIPMENT INVENTORY (Formulario 3) ============
      equipmentInventoryData: getDefaultEquipmentInventoryData(),

      // ============ PM EXECUTED (Formulario 6) ============
      pmExecutedData: getDefaultPMExecutedData(),

      resetPMExecutedData: () => set({ pmExecutedData: getDefaultPMExecutedData() }),

      updatePMExecutedField: (field, value) => {
        set((state) => ({
          pmExecutedData: {
            ...(state.pmExecutedData || getDefaultPMExecutedData()),
            siteInfo: {
              ...((state.pmExecutedData || getDefaultPMExecutedData()).siteInfo || {}),
              [field]: value,
            },
          },
        }))
        get().triggerAutosave('inspection-general')
      },

      updatePMExecutedPhoto: (activityId, photoType, photoData) => {
        // Normalize empty string to null (some callers use '' to delete)
        const normalizedData = (photoData === '' || photoData == null) ? null : photoData

        // Guard against invalid photo data
        if (normalizedData != null && !isDataUrlString(normalizedData)) {
          console.warn('[Photo] Captura inválida en PM ejecutado (no es Data URL).', {
            activityId,
            photoType,
            receivedType: typeof normalizedData,
          })
          return
        }

        set((state) => {
          const currentData = state.pmExecutedData || getDefaultPMExecutedData()
          return {
            pmExecutedData: {
              ...currentData,
              photos: {
                ...(currentData.photos || {}),
                [`${activityId}-${photoType}`]: normalizedData
              }
            }
          }
        })

        // Upload photo in background (best effort)
        if (normalizedData) {
          try {
            queueAssetUpload('executed-maintenance', `executed:${activityId}:${photoType}`, normalizedData)
            flushSupabaseQueues({ formCode: 'executed-maintenance' })
          } catch (e) {}
        }

        get().triggerAutosave('executed-maintenance')
      },

      // ============ GROUNDING SYSTEM TEST (Nuevo formulario) ============
      groundingSystemData: {},



      // ============ SAFETY CLIMBING DEVICE (Nuevo formulario) ============
      safetyClimbingData: {},

      updateEquipmentSiteField: (field, value) => {
        set((state) => ({
          equipmentInventoryData: {
            ...(state.equipmentInventoryData || getDefaultEquipmentInventoryData()),
            siteInfo: {
              ...((state.equipmentInventoryData || getDefaultEquipmentInventoryData()).siteInfo || {}),
              [field]: value,
            },
          },
        }))
        get().triggerAutosave('executed-maintenance')
      },

      // --- TORRE: tabla repetible ---
      addTowerItem: () => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const items = current.torre?.items || []
          return {
            equipmentInventoryData: {
              ...current,
              torre: {
                ...(current.torre || {}),
                items: [...items, { alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', dimensionesMts: '', areaM2: '', carrier: '' }],
              },
            },
          }
        })
        get().triggerAutosave('executed-maintenance')
      },

      removeTowerItem: (index) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const items = (current.torre?.items || []).slice()
          items.splice(index, 1)
          return { equipmentInventoryData: { ...current, torre: { ...(current.torre || {}), items: items.length ? items : [{ alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', dimensionesMts: '', areaM2: '', carrier: '' }] } } }
        })
        get().triggerAutosave('equipment')
      },

      updateTowerItemField: (index, field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const items = (current.torre?.items || []).map((it, i) => (i === index ? { ...it, [field]: value } : it))
          return { equipmentInventoryData: { ...current, torre: { ...(current.torre || {}), items } } }
        })
        get().triggerAutosave('inspection-general')
      },

      // --- PISO: clientes + gabinetes ---
      addFloorClient: (tipoCliente = 'colo') => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = current.piso?.clientes || []
          return {
            equipmentInventoryData: {
              ...current,
              piso: {
                ...(current.piso || {}),
                clientes: [
                  ...clientes,
                  { tipoCliente, nombreCliente: '', areaArrendada: '', areaEnUso: '', placaEquipos: '', gabinetes: [{ gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' }] },
                ],
              },
            },
          }
        })
        get().triggerAutosave('inspection-general')
      },

      removeFloorClient: (index) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).slice()
          clientes.splice(index, 1)
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes: clientes.length ? clientes : [{ tipoCliente: 'ancla', nombreCliente: '', areaArrendada: '', areaEnUso: '', placaEquipos: '', gabinetes: [{ gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' }] }] } } }
        })
        get().triggerAutosave('inspection-general')
      },

      updateFloorClientField: (index, field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).map((c, i) => (i === index ? { ...c, [field]: value } : c))
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes } } }
        })
        get().triggerAutosave('inspection-general')
      },

      addCabinet: (clientIndex) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).map((c, i) => {
            if (i !== clientIndex) return c
            const gabinetes = c.gabinetes || []
            return { ...c, gabinetes: [...gabinetes, { gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' }] }
          })
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes } } }
        })
        get().triggerAutosave('inspection-general')
      },

      removeCabinet: (clientIndex, cabinetIndex) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).map((c, i) => {
            if (i !== clientIndex) return c
            const gabinetes = (c.gabinetes || []).slice()
            gabinetes.splice(cabinetIndex, 1)
            return { ...c, gabinetes: gabinetes.length ? gabinetes : [{ gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' }] }
          })
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes } } }
        })
        get().triggerAutosave('inspection-general')
      },

      updateCabinetField: (clientIndex, cabinetIndex, field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).map((c, i) => {
            if (i !== clientIndex) return c
            const gabinetes = (c.gabinetes || []).map((g, j) => (j === cabinetIndex ? { ...g, [field]: value } : g))
            return { ...c, gabinetes }
          })
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes } } }
        })
        get().triggerAutosave('inspection-general')
      },

      // --- DISTRIBUCIÓN / CROQUIS / PLANO ---
      setDistribucionTorre: (scene, pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, distribucionTorre: { ...(current.distribucionTorre || {}), scene, pngDataUrl } } }
        })
        get().triggerAutosave('inspection-general')
      },

      setDistribucionFotoTorre: (fotoTorreDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, fotoTorreDataUrl } }
        })

        // Upload photo in background (best effort)
        try {
          queueAssetUpload('equipment', 'equipment:fotoTorre', fotoTorreDataUrl)
          flushSupabaseQueues({ formCode: 'equipment' })
        } catch (e) {}

        get().triggerAutosave('equipment')
      },

      setCroquisEsquematico: (pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return {
            equipmentInventoryData: { ...current, croquisEsquematico: { ...(current.croquisEsquematico || {}), pngDataUrl } }
          }
        })

        // Upload photo in background (best effort)
        try {
          queueAssetUpload('equipment', 'equipment:croquisEsquematico', pngDataUrl)
          flushSupabaseQueues({ formCode: 'equipment' })
        } catch (e) {}

        get().triggerAutosave('equipment')
      },

      setCroquisNiveles: (field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const niveles = current.croquisEsquematico?.niveles || { nivel1: '', nivel2: '', nivel3: '', banqueta: '' }
          return { equipmentInventoryData: { ...current, croquisEsquematico: { ...(current.croquisEsquematico || {}), niveles: { ...niveles, [field]: value } } } }
        })
        get().triggerAutosave('inspection-general')
      },

      setPlanoPlanta: (pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return {
            equipmentInventoryData: { ...current, planoPlanta: { ...(current.planoPlanta || {}), pngDataUrl } }
          }
        })

        // Upload photo in background (best effort)
        try {
          queueAssetUpload('equipment', 'equipment:planoPlanta', pngDataUrl)
          flushSupabaseQueues({ formCode: 'equipment' })
        } catch (e) {}

        get().triggerAutosave('equipment')
      },

      resetEquipmentInventoryData: () => set({ equipmentInventoryData: getDefaultEquipmentInventoryData() }),

      // Prueba de puesta a tierra
      setGroundingField: (sectionId, fieldId, value) => {
        set((state) => ({
          groundingSystemData: {
            ...(state.groundingSystemData || {}),
            [sectionId]: {
              ...((state.groundingSystemData && state.groundingSystemData[sectionId]) || {}),
              [fieldId]: value,
            },
          },
        }))
        get().triggerAutosave('grounding-system-test')
      },
      resetGroundingSystemData: () => {
        set({ groundingSystemData: {}, groundingStep: 1 })
      },


      // Sistema de ascenso
setSafetyField: (sectionId, fieldId, value) => {
  set(state => ({
    safetyClimbingData: {
      ...state.safetyClimbingData,
      [sectionId]: {
        ...(state.safetyClimbingData?.[sectionId] || {}),
        [fieldId]: value,
      },
    },
  }))
  get().triggerAutosave('safety-system')
},
resetSafetyClimbingData: () => set({ safetyClimbingData: {}, safetyClimbingStep: 1 }),


      // Actualizar campo de formulario
      updateMaintenanceField: (field, value) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            maintenanceData: {
              ...currentData,
              formData: { ...(currentData.formData || {}), [field]: value }
            }
          }
        })
        get().triggerAutosave('preventive-maintenance')
      },

      // Actualizar item de checklist
      updateChecklistItem: (itemId, field, value) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          const currentChecklist = currentData.checklistData || {}
          return {
            maintenanceData: {
              ...currentData,
              checklistData: {
                ...currentChecklist,
                [itemId]: { ...(currentChecklist[itemId] || {}), [field]: value }
              }
            }
          }
        })
        get().triggerAutosave('preventive-maintenance')
      },

      // Actualizar foto de checklist
      updateChecklistPhoto: (itemId, photoType, photoData) => {
        // Normalize empty string to null (some callers use '' to delete)
        const normalizedData = (photoData === '' || photoData == null) ? null : photoData

        // Guard against invalid photo data
        if (normalizedData != null && !isDataUrlString(normalizedData)) {
          console.warn('[Photo] Captura inválida en checklist (no es Data URL).', {
            itemId,
            photoType,
            receivedType: typeof normalizedData,
          })
          return
        }

        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            maintenanceData: {
              ...currentData,
              photos: {
                ...(currentData.photos || {}),
                [`${itemId}-${photoType}`]: normalizedData
              }
            }
          }
        })

        // Upload photo in background (best effort)
        if (normalizedData) {
          try {
            queueAssetUpload('preventive-maintenance', `maintenance:${itemId}:${photoType}`, normalizedData)
            flushSupabaseQueues({ formCode: 'preventive-maintenance' })
          } catch (e) {}
        }

        get().triggerAutosave('preventive-maintenance')
      },

      // Navegar a step
      setMaintenanceStep: (step) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            // Guard: asegurar número para evitar concatenación ("1" + 1 => "11")
            maintenanceData: { ...currentData, currentStep: Number(step) || 1 }
          }
        })
      },

      // Marcar step como completado
      completeMaintenanceStep: (stepId) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          const completed = currentData.completedSteps || []
          if (completed.includes(stepId)) {
            // Already completed – no-op
            return {}
          }
          return {
            maintenanceData: {
              ...currentData,
              completedSteps: [...completed, stepId]
            }
          }
        })
      },

      // Reset maintenance data
      resetMaintenanceData: () => {
        set({ maintenanceData: getDefaultMaintenanceData() })
      },

      // ============ LEGACY: Para compatibilidad ============
      updateMaintenanceSiteInfo: (field, value) => {
        get().updateMaintenanceField(field, value)
      },

      updateActivityStatus: (actId, status) => {
        get().updateChecklistItem(actId, 'status', status)
      },

      updateActivityPhoto: (actId, photoType, photoData) => {
        get().updateChecklistPhoto(actId, photoType, photoData)
      },
    }),
    { 
      name: 'pti-inspect-storage',
      version: 6, // v2.0: add activeVisit, completedForms, connectivity
      // Safe localStorage wrapper: silently ignores QuotaExceededError so set() never throws
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try { return localStorage.getItem(name) } catch (_) { return null }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch (e) {
            console.warn('[Persist] localStorage.setItem failed (quota?)', e?.name)
          }
        },
        removeItem: (name) => {
          try { localStorage.removeItem(name) } catch (_) {}
        },
      })),
      // Exclude large binary data (photos as data URLs) from localStorage.
      // Photos are uploaded to Supabase Storage via queueAssetUpload and don't
      // need to survive a page reload from localStorage.
      partialize: (state) => {
        // Strip data URL photos from inspectionData
        const inspectionData = state.inspectionData ? {
          ...state.inspectionData,
          photos: stripDataUrls(state.inspectionData.photos),
        } : state.inspectionData

        // Strip data URL photos from maintenanceData
        const maintenanceData = state.maintenanceData ? {
          ...state.maintenanceData,
          photos: stripDataUrls(state.maintenanceData.photos),
          formData: state.maintenanceData.formData ? stripDataUrlFields(state.maintenanceData.formData) : state.maintenanceData.formData,
        } : state.maintenanceData

        // Strip data URL photos from pmExecutedData
        const pmExecutedData = state.pmExecutedData ? {
          ...state.pmExecutedData,
          photos: stripDataUrls(state.pmExecutedData.photos),
        } : state.pmExecutedData

        // Strip large binary data from equipmentInventoryData
        const equipmentInventoryData = state.equipmentInventoryData ? {
          ...state.equipmentInventoryData,
          distribucionTorre: state.equipmentInventoryData.distribucionTorre ? {
            ...state.equipmentInventoryData.distribucionTorre,
            pngDataUrl: stripSingle(state.equipmentInventoryData.distribucionTorre.pngDataUrl),
            fotoTorreDataUrl: stripSingle(state.equipmentInventoryData.distribucionTorre.fotoTorreDataUrl),
          } : state.equipmentInventoryData.distribucionTorre,
          croquisEsquematico: state.equipmentInventoryData.croquisEsquematico ? {
            ...state.equipmentInventoryData.croquisEsquematico,
            pngDataUrl: stripSingle(state.equipmentInventoryData.croquisEsquematico.pngDataUrl),
          } : state.equipmentInventoryData.croquisEsquematico,
          planoPlanta: state.equipmentInventoryData.planoPlanta ? {
            ...state.equipmentInventoryData.planoPlanta,
            pngDataUrl: stripSingle(state.equipmentInventoryData.planoPlanta.pngDataUrl),
          } : state.equipmentInventoryData.planoPlanta,
        } : state.equipmentInventoryData

        // Strip data URL photos from safetyClimbingData (nested sections)
        const safetyClimbingData = state.safetyClimbingData
          ? Object.fromEntries(
              Object.entries(state.safetyClimbingData).map(([section, fields]) => [
                section,
                fields && typeof fields === 'object'
                  ? Object.fromEntries(
                      Object.entries(fields).map(([k, v]) => [k, stripSingle(v)])
                    )
                  : fields,
              ])
            )
          : state.safetyClimbingData

        // Strip data URL photos from groundingSystemData (nested sections)
        const groundingSystemData = state.groundingSystemData
          ? Object.fromEntries(
              Object.entries(state.groundingSystemData).map(([section, fields]) => [
                section,
                fields && typeof fields === 'object'
                  ? Object.fromEntries(
                      Object.entries(fields).map(([k, v]) => [k, stripSingle(v)])
                    )
                  : fields,
              ])
            )
          : state.groundingSystemData

        return {
          ...state,
          inspectionData,
          maintenanceData,
          pmExecutedData,
          equipmentInventoryData,
          safetyClimbingData,
          groundingSystemData,
          // Never persist transient UI state
          toast: undefined,
          _toastTimer: undefined,
          showAutosave: undefined,
          // Never persist transient connectivity state
          isOnline: undefined,
          syncStatus: undefined,
          pendingSyncCount: undefined,
        }
      },
      migrate: (persistedState, version) => {
        // Migraciones simples para mantener compatibilidad
        let state = { ...persistedState }
        if (version < 2) {
          state = { ...state, maintenanceData: getDefaultMaintenanceData() }
        }
        if (version < 3) {
          state = { ...state, equipmentInventoryData: getDefaultEquipmentInventoryData() }
        } else {
          // Asegurar que exista aunque venga de localStorage incompleto
          state = { ...state, equipmentInventoryData: state.equipmentInventoryData || getDefaultEquipmentInventoryData() }
        }

        // v4: asegurar nuevos estados
        state = { ...state, formMeta: state.formMeta || {} }
        state = { ...state, pmExecutedData: state.pmExecutedData || getDefaultPMExecutedData() }
        state = { ...state, groundingSystemData: state.groundingSystemData || {} }
        state = { ...state, groundingStep: state.groundingStep || 1 }
        state = { ...state, safetyClimbingData: state.safetyClimbingData || {} }
        state = { ...state, safetyClimbingStep: state.safetyClimbingStep || 1 }

        // Normalizar maintenanceData.currentStep a número (algunas versiones antiguas lo guardaban como string)
        const md = state.maintenanceData || getDefaultMaintenanceData()
        const stepNum = Number(md.currentStep)
        state = { ...state, maintenanceData: { ...md, currentStep: Number.isFinite(stepNum) && stepNum > 0 ? stepNum : 1 } }

        // v6: add activeVisit and completedForms
        state = { ...state, activeVisit: state.activeVisit || null }
        state = { ...state, completedForms: state.completedForms || [] }

        return state
      }
    }
  )
)