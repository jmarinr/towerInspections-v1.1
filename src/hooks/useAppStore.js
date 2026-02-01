import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getDefaultDate = () => new Date().toISOString().split('T')[0]
const getDefaultTime = () => new Date().toTimeString().slice(0, 5)

// Datos por defecto para mantenimiento v1.1.7
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
    fechaInicio: getDefaultDate(),
    fechaTermino: getDefaultDate(),
    horaEntrada: getDefaultTime(),
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
    fechaInicio: getDefaultDate(),
    fechaTermino: getDefaultDate(),
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


      // ============ AUTH ============
      auth: { isAuthenticated: false, user: '' },
      login: (username, password) => {
        const ok = String(username) === '101010' && String(password) === '101010'
        if (ok) set({ auth: { isAuthenticated: true, user: String(username) } })
        return ok
      },
      logout: () => set({ auth: { isAuthenticated: false, user: '' } }),
      // ============ AUTOSAVE ============
      showAutosave: false,
      triggerAutosave: () => {
        set({ showAutosave: true })
        setTimeout(() => set({ showAutosave: false }), 1500)
      },

      // ============ INSPECTION DATA (Original) ============
      inspectionData: {
        siteInfo: { proveedor: '', idSitio: '', nombreSitio: '', tipoSitio: '', coordenadas: '', direccion: '', fecha: getDefaultDate(), hora: getDefaultTime(), tipoTorre: '', alturaTorre: '' },
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
        get().triggerAutosave()
      },

      updateItemObservation: (itemId, observation) => set((state) => ({
        inspectionData: { ...state.inspectionData, items: { ...state.inspectionData.items, [itemId]: { ...state.inspectionData.items[itemId], observation } } }
      })),

      updateItemPhoto: (itemId, photoType, photoData) => {
        set((state) => ({
          inspectionData: { ...state.inspectionData, photos: { ...state.inspectionData.photos, [`${itemId}-${photoType}`]: photoData } }
        }))
        get().triggerAutosave()
      },

      // ============ MAINTENANCE DATA v1.1.4 ============
      maintenanceData: getDefaultMaintenanceData(),

      // ============ EQUIPMENT INVENTORY (Formulario 3) ============
      equipmentInventoryData: getDefaultEquipmentInventoryData(),

      // ============ GROUNDING SYSTEM TEST (Nuevo formulario) ============
      groundingSystemData: {},


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
        get().triggerAutosave()
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
        get().triggerAutosave()
      },

      removeTowerItem: (index) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const items = (current.torre?.items || []).slice()
          items.splice(index, 1)
          return { equipmentInventoryData: { ...current, torre: { ...(current.torre || {}), items: items.length ? items : [{ alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', dimensionesMts: '', areaM2: '', carrier: '' }] } } }
        })
        get().triggerAutosave()
      },

      updateTowerItemField: (index, field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const items = (current.torre?.items || []).map((it, i) => (i === index ? { ...it, [field]: value } : it))
          return { equipmentInventoryData: { ...current, torre: { ...(current.torre || {}), items } } }
        })
        get().triggerAutosave()
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
        get().triggerAutosave()
      },

      removeFloorClient: (index) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).slice()
          clientes.splice(index, 1)
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes: clientes.length ? clientes : [{ tipoCliente: 'ancla', nombreCliente: '', areaArrendada: '', areaEnUso: '', placaEquipos: '', gabinetes: [{ gabinete: '', largo: '', ancho: '', alto: '', fotoRef: '' }] }] } } }
        })
        get().triggerAutosave()
      },

      updateFloorClientField: (index, field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const clientes = (current.piso?.clientes || []).map((c, i) => (i === index ? { ...c, [field]: value } : c))
          return { equipmentInventoryData: { ...current, piso: { ...(current.piso || {}), clientes } } }
        })
        get().triggerAutosave()
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
        get().triggerAutosave()
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
        get().triggerAutosave()
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
        get().triggerAutosave()
      },

      // --- DISTRIBUCIÓN / CROQUIS / PLANO ---
      setDistribucionTorre: (scene, pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, distribucionTorre: { ...(current.distribucionTorre || {}), scene, pngDataUrl } } }
        })
        get().triggerAutosave()
      },

      setDistribucionFotoTorre: (fotoTorreDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, distribucionTorre: { ...(current.distribucionTorre || {}), fotoTorreDataUrl } } }
        })
        get().triggerAutosave()
      },

      setCroquisEsquematico: (drawing, pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, croquisEsquematico: { ...(current.croquisEsquematico || {}), drawing, pngDataUrl } } }
        })
        get().triggerAutosave()
      },

      setCroquisNiveles: (field, value) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          const niveles = current.croquisEsquematico?.niveles || { nivel1: '', nivel2: '', nivel3: '', banqueta: '' }
          return { equipmentInventoryData: { ...current, croquisEsquematico: { ...(current.croquisEsquematico || {}), niveles: { ...niveles, [field]: value } } } }
        })
        get().triggerAutosave()
      },

      setPlanoPlanta: (drawing, pngDataUrl) => {
        set((state) => {
          const current = state.equipmentInventoryData || getDefaultEquipmentInventoryData()
          return { equipmentInventoryData: { ...current, planoPlanta: { ...(current.planoPlanta || {}), drawing, pngDataUrl } } }
        })
        get().triggerAutosave()
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
        get().triggerAutosave()
      },
      resetGroundingSystemData: () => {
        set({ groundingSystemData: {} })
        get().triggerAutosave()
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
  get().triggerAutosave()
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
        get().triggerAutosave()
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
        get().triggerAutosave()
      },

      // Actualizar foto de checklist
      updateChecklistPhoto: (itemId, photoType, photoData) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            maintenanceData: {
              ...currentData,
              photos: { ...(currentData.photos || {}), [`${itemId}-${photoType}`]: photoData }
            }
          }
        })
        get().triggerAutosave()
      },

      // Navegar a step
      setMaintenanceStep: (step) => {
        set((state) => {
          const currentData = state.maintenanceData || getDefaultMaintenanceData()
          return {
            maintenanceData: { ...currentData, currentStep: step }
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
      version: 4, // Incrementar versión para forzar migración
      migrate: (persistedState, version) => {
        // Migraciones simples para mantener compatibilidad
        let state = { ...persistedState }
        state = { ...state, auth: state.auth || { isAuthenticated: false, user: '' } }
        if (version < 2) {
          state = { ...state, maintenanceData: getDefaultMaintenanceData() }
        }
        if (version < 3) {
          state = { ...state, equipmentInventoryData: getDefaultEquipmentInventoryData() }
        } else {
          // Asegurar que exista aunque venga de localStorage incompleto
          state = { ...state, equipmentInventoryData: state.equipmentInventoryData || getDefaultEquipmentInventoryData() }
        }
        return state
      }
    }
  )
)
