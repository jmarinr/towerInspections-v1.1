import { create } from 'zustand'
import { queueSubmissionSync, queueAssetUpload, flushSupabaseQueues, clearSupabaseLocalForForm } from '../lib/supabaseSync'
import { getDeviceId } from '../lib/deviceId'
import { persist } from 'zustand/middleware'

const getDefaultDate = () => new Date().toISOString().split('T')[0]
const getDefaultTime = () => new Date().toTimeString().slice(0, 5)

// Versión mostrada en UI y enviada como metadata a Supabase
const APP_VERSION_DISPLAY = '1.8'

const isDataUrlString = (value) =>
  typeof value === 'string' && value.startsWith('data:')

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
      // ============ TOAST ============
      toast: { show: false, message: '', type: 'info' },
      showToast: (message, type = 'info') => {
        set({ toast: { show: true, message, type } })
        setTimeout(() => set({ toast: { show: false, message: '', type: 'info' } }), 2500)
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
          'inspeccion': { code: 'inspection-general', reset: 'resetInspectionData' },
          'mantenimiento': { code: 'preventive-maintenance', reset: 'resetMaintenanceData' },
          'inventario': { code: 'equipment', reset: 'resetEquipmentInventoryData' },
          'mantenimiento-ejecutado': { code: 'executed-maintenance', reset: 'resetPMExecutedData' },
          'puesta-tierra': { code: 'grounding-system-test', reset: 'resetGroundingSystemData' },
          'safety-system': { code: 'safety-system', reset: 'resetSafetyClimbingData' },
        }
        const cfg = map[formKey]
        if (!cfg) return
        try { clearSupabaseLocalForForm(cfg.code) } catch (e) {}
        get().clearFormMeta(formKey)
        const fn = get()[cfg.reset]
        if (typeof fn === 'function') fn()

        set((state) => {
          const aq = Array.isArray(state.assetUploadQueue) ? state.assetUploadQueue : []
          return { assetUploadQueue: aq.filter(a => a.formCode !== cfg.code) }
        })
      },

      finalizeForm: async (formKey) => {
        const map = {
          'inspeccion': { code: 'inspection-general' },
          'mantenimiento': { code: 'preventive-maintenance' },
          'inventario': { code: 'equipment' },
          'mantenimiento-ejecutado': { code: 'executed-maintenance' },
          'puesta-tierra': { code: 'grounding-system-test' },
          'safety-system': { code: 'safety-system' },
        }
        const cfg = map[formKey]
        if (!cfg) throw new Error('unknown form')
        const payload = get().getSupabasePayloadForForm(cfg.code)
        if (payload) queueSubmissionSync(cfg.code, payload, APP_VERSION_DISPLAY)
        await flushSupabaseQueues({ formCode: cfg.code })
        try { clearSupabaseLocalForForm(cfg.code) } catch (e) {}
        get().resetFormDraft(formKey)
      },

  // Build the full Supabase payload for a given autosave bucket (one submission per form)
  // Note: we intentionally send **all** captured data for the form (not a minimal subset).
  getSupabasePayloadForForm: (formCode) => {
    const state = get()

    // Map internal autosave buckets to a canonical PTI form_code (used in DB uniqueness)
    const toFormCode = (code) => {
      if (!code) return 'unknown'
      if (code.startsWith('inspection') || code === 'safety-system') return 'inspeccion'
      if (code === 'preventive-maintenance') return 'mantenimiento'
      if (code === 'executed-maintenance' || code === 'pm-executed') return 'mantenimiento-ejecutado'
      if (code === 'equipment-inventory' || code === 'equipment') return 'inventario'
      if (code === 'grounding-system-test') return 'puesta-tierra'
      return code
    }

    const canonicalFormCode = toFormCode(formCode)

    // Form meta is stored using the public form ids (inspeccion, mantenimiento, etc.)
    const metaKey =
      canonicalFormCode === 'inspeccion' ? 'inspeccion'
      : canonicalFormCode === 'mantenimiento' ? 'mantenimiento'
      : canonicalFormCode === 'mantenimiento-ejecutado' ? 'mantenimiento-ejecutado'
      : canonicalFormCode === 'inventario' ? 'inventario'
      : canonicalFormCode === 'puesta-tierra' ? 'puesta-tierra'
      : canonicalFormCode

    const meta = (state.formMeta && state.formMeta[metaKey]) ? state.formMeta[metaKey] : null

    // Pick the full form snapshot from the store
    const snapshot =
      canonicalFormCode === 'inspeccion' ? state.inspectionData
      : canonicalFormCode === 'mantenimiento' ? state.maintenanceData
      : canonicalFormCode === 'mantenimiento-ejecutado' ? state.pmExecutedData
      : canonicalFormCode === 'inventario' ? state.equipmentInventoryData
      : canonicalFormCode === 'puesta-tierra' ? state.groundingSystemData
      : null

    // Collect any queued assets that belong to this form (photos uploaded to Storage)
    const queuedAssets = Array.isArray(state.assetUploadQueue)
      ? state.assetUploadQueue.filter(a => a && a.formCode === formCode)
      : []

    return {
      org_code: 'PTI',
      device_id: getDeviceId(),
      form_code: canonicalFormCode,
      app_version: APP_VERSION_DISPLAY,
      form_version: '1',
      payload: {
        meta,
        // raw autosave bucket (helps debugging)
        autosave_bucket: formCode,
        // full snapshot of the form state
        data: snapshot,
        // include current validation status if present
        validation: state.validationState || null,
        // include any other global state you want to preserve
        profile: state.profile || null
      },
      assets: queuedAssets.map(a => ({
        key: a.storageKey,
        type: a.assetType || 'photo',
        bucket: a.bucket || 'pti-inspect',
        // optional metadata
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
        set((state) => {
          const currentData = state.pmExecutedData || getDefaultPMExecutedData()
          return {
            pmExecutedData: {
              ...currentData,
              checklistPhotos: {
                ...(currentData.checklistPhotos || {}),
                [`${activityId}-${photoType}`]: photoData
              }
            }
          }
        })

        // Upload photo in background (best effort)
        try {
          queueAssetUpload('executed-maintenance', `executed:${activityId}:${photoType}`, photoData)
          flushSupabaseQueues({ formCode: 'executed-maintenance' })
        } catch (e) {}

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
        set({ groundingSystemData: {} })
        get().triggerAutosave('grounding-system-test')
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
resetSafetyClimbingData: () => set({ safetyClimbingData: getDefaultSafetyClimbingData() }),


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
        get().triggerAutosave('inspection-general')
      },

      // Actualizar foto de checklist
      updateChecklistPhoto: (itemId, photoType, photoData) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            maintenanceData: {
              ...currentData,
              checklistPhotos: {
                ...(currentData.checklistPhotos || {}),
                [`${itemId}-${photoType}`]: photoData
              }
            }
          }
        })

        // Upload photo in background (best effort)
        try {
          queueAssetUpload('preventive-maintenance', `maintenance:${itemId}:${photoType}`, photoData)
          flushSupabaseQueues({ formCode: 'preventive-maintenance' })
        } catch (e) {}

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
          if (!completed.includes(stepId)) {
            return {
              maintenanceData: {
                ...currentData,
                completedSteps: [...completed, stepId]
              }
            }
          }
  
        // v4: asegurar nuevos estados
        state = { ...state, formMeta: state.formMeta || {} }
        state = { ...state, pmExecutedData: state.pmExecutedData || getDefaultPMExecutedData() }
        state = { ...state, groundingSystemData: state.groundingSystemData || {} }
        state = { ...state, safetyClimbingData: state.safetyClimbingData || {} }
        return state
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
      version: 5, // v1.1.9+: normalizar tipos (steps numéricos)
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
        state = { ...state, safetyClimbingData: state.safetyClimbingData || {} }

        // Normalizar maintenanceData.currentStep a número (algunas versiones antiguas lo guardaban como string)
        const md = state.maintenanceData || getDefaultMaintenanceData()
        const stepNum = Number(md.currentStep)
        state = { ...state, maintenanceData: { ...md, currentStep: Number.isFinite(stepNum) && stepNum > 0 ? stepNum : 1 } }
        return state
      }
    }
  )
)