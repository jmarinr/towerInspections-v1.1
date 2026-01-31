import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Toast
      toast: { show: false, message: '', type: 'info' },
      showToast: (message, type = 'info') => {
        set({ toast: { show: true, message, type } })
        setTimeout(() => set({ toast: { show: false, message: '', type: 'info' } }), 2500)
      },
      hideToast: () => set({ toast: { show: false, message: '', type: 'info' } }),

      // Autosave indicator
      showAutosave: false,
      triggerAutosave: () => {
        set({ showAutosave: true })
        setTimeout(() => set({ showAutosave: false }), 1500)
      },

      // Current inspection data
      currentInspection: null,
      setCurrentInspection: (data) => set({ currentInspection: data }),

      // Inspection form state
      inspectionData: {
        siteInfo: {
          proveedor: '',
          idSitio: '',
          nombreSitio: '',
          tipoSitio: '',
          coordenadas: '',
          direccion: '',
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().slice(0, 5),
          tipoTorre: '',
          alturaTorre: '',
        },
        items: {},
        photos: {},
      },
      
      updateSiteInfo: (field, value) => set((state) => ({
        inspectionData: {
          ...state.inspectionData,
          siteInfo: { ...state.inspectionData.siteInfo, [field]: value }
        }
      })),

      updateItemStatus: (itemId, status) => {
        set((state) => ({
          inspectionData: {
            ...state.inspectionData,
            items: {
              ...state.inspectionData.items,
              [itemId]: { ...state.inspectionData.items[itemId], status }
            }
          }
        }))
        get().triggerAutosave()
      },

      updateItemObservation: (itemId, observation) => {
        set((state) => ({
          inspectionData: {
            ...state.inspectionData,
            items: {
              ...state.inspectionData.items,
              [itemId]: { ...state.inspectionData.items[itemId], observation }
            }
          }
        }))
      },

      updateItemPhoto: (itemId, photoType, photoData) => {
        set((state) => ({
          inspectionData: {
            ...state.inspectionData,
            photos: {
              ...state.inspectionData.photos,
              [`${itemId}-${photoType}`]: photoData
            }
          }
        }))
        get().triggerAutosave()
      },

      // Maintenance form state
      maintenanceData: {
        siteInfo: {
          proveedor: '',
          idSitio: '',
          nombreSitio: '',
          tipoVisita: 'Mantenimiento Preventivo',
          coordenadas: '',
          direccion: '',
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().slice(0, 5),
          tipoSitio: 'rawland',
        },
        activities: {},
        photos: {},
      },

      updateMaintenanceSiteInfo: (field, value) => set((state) => ({
        maintenanceData: {
          ...state.maintenanceData,
          siteInfo: { ...state.maintenanceData.siteInfo, [field]: value }
        }
      })),

      updateActivityStatus: (actId, status) => {
        set((state) => ({
          maintenanceData: {
            ...state.maintenanceData,
            activities: {
              ...state.maintenanceData.activities,
              [actId]: { ...state.maintenanceData.activities[actId], status }
            }
          }
        }))
        get().triggerAutosave()
      },

      // Reset functions
      resetInspection: () => set({
        inspectionData: {
          siteInfo: {
            proveedor: '',
            idSitio: '',
            nombreSitio: '',
            tipoSitio: '',
            coordenadas: '',
            direccion: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toTimeString().slice(0, 5),
            tipoTorre: '',
            alturaTorre: '',
          },
          items: {},
          photos: {},
        }
      }),

      resetMaintenance: () => set({
        maintenanceData: {
          siteInfo: {
            proveedor: '',
            idSitio: '',
            nombreSitio: '',
            tipoVisita: 'Mantenimiento Preventivo',
            coordenadas: '',
            direccion: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toTimeString().slice(0, 5),
            tipoSitio: 'rawland',
          },
          activities: {},
          photos: {},
        }
      }),
    }),
    {
      name: 'pti-inspect-storage',
      partialize: (state) => ({
        inspectionData: state.inspectionData,
        maintenanceData: state.maintenanceData,
      }),
    }
  )
)
