import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getDefaultDate = () => new Date().toISOString().split('T')[0]
const getDefaultTime = () => new Date().toTimeString().slice(0, 5)

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
      maintenanceData: {
        currentStep: 1,
        completedSteps: [],
        formData: {
          // Paso 1: Info General
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
          // Paso 2: Info Torre
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
          // Paso 3: Dirección
          calle: '',
          numero: '',
          colonia: '',
          ciudad: '',
          estado: '',
          codigoPostal: '',
          pais: '',
          // Paso 4: Acceso
          descripcionSitio: '',
          restriccionHorario: '',
          descripcionAcceso: '',
          propietarioLocalizable: '',
          tipoLlave: '',
          claveCombinacion: '',
          memorandumRequerido: '',
          problemasAcceso: '',
          fotoCandado: '',
          // Paso 5: Eléctrico
          ubicacionMedidores: '',
          tipoConexion: '',
          capacidadTransformador: '',
          numMedidores: '',
          medidorSeparadoLuces: '',
          fibraOptica: '',
          // Paso 17: Cierre
          vandalismo: '',
          descripcionVandalismo: '',
          equiposFaltantes: '',
          defectosOperacion: '',
          observacionesGenerales: '',
        },
        checklistData: {},  // { '1.1': { status: 'bueno', observation: '', value: '' }, ... }
        photos: {},         // { '1.1-before': 'base64...', '1.1-after': 'base64...', ... }
      },

      // Actualizar campo de formulario
      updateMaintenanceField: (field, value) => {
        set((state) => ({
          maintenanceData: {
            ...state.maintenanceData,
            formData: { ...state.maintenanceData.formData, [field]: value }
          }
        }))
        get().triggerAutosave()
      },

      // Actualizar item de checklist
      updateChecklistItem: (itemId, field, value) => {
        set((state) => ({
          maintenanceData: {
            ...state.maintenanceData,
            checklistData: {
              ...state.maintenanceData.checklistData,
              [itemId]: { ...state.maintenanceData.checklistData[itemId], [field]: value }
            }
          }
        }))
        get().triggerAutosave()
      },

      // Actualizar foto de checklist
      updateChecklistPhoto: (itemId, photoType, photoData) => {
        set((state) => ({
          maintenanceData: {
            ...state.maintenanceData,
            photos: { ...state.maintenanceData.photos, [`${itemId}-${photoType}`]: photoData }
          }
        }))
        get().triggerAutosave()
      },

      // Navegar a step
      setMaintenanceStep: (step) => {
        set((state) => ({
          maintenanceData: { ...state.maintenanceData, currentStep: step }
        }))
      },

      // Marcar step como completado
      completeMaintenanceStep: (stepId) => {
        set((state) => {
          const completed = state.maintenanceData.completedSteps
          if (!completed.includes(stepId)) {
            return {
              maintenanceData: {
                ...state.maintenanceData,
                completedSteps: [...completed, stepId]
              }
            }
          }
          return state
        })
      },

      // Reset maintenance data
      resetMaintenanceData: () => {
        set((state) => ({
          maintenanceData: {
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
          }
        }))
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
    { name: 'pti-inspect-storage' }
  )
)
