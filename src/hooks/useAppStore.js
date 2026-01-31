import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getDefaultDate = () => new Date().toISOString().split('T')[0]
const getDefaultTime = () => new Date().toTimeString().slice(0, 5)

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
      version: 2, // Incrementar versión para forzar migración
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migrar de versión vieja a nueva
          return {
            ...persistedState,
            maintenanceData: getDefaultMaintenanceData()
          }
        }
        return persistedState
      }
    }
  )
)
