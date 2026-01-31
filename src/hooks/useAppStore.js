import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      toast: { show: false, message: '', type: 'info' },
      showToast: (message, type = 'info') => {
        set({ toast: { show: true, message, type } })
        setTimeout(() => set({ toast: { show: false, message: '', type: 'info' } }), 2500)
      },
      hideToast: () => set({ toast: { show: false, message: '', type: 'info' } }),

      showAutosave: false,
      triggerAutosave: () => {
        set({ showAutosave: true })
        setTimeout(() => set({ showAutosave: false }), 1500)
      },

      inspectionData: {
        siteInfo: { proveedor: '', idSitio: '', nombreSitio: '', tipoSitio: '', coordenadas: '', direccion: '', fecha: new Date().toISOString().split('T')[0], hora: new Date().toTimeString().slice(0, 5), tipoTorre: '', alturaTorre: '' },
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

      maintenanceData: {
        siteInfo: { proveedor: '', idSitio: '', nombreSitio: '', coordenadas: '', direccion: '', fecha: new Date().toISOString().split('T')[0], hora: new Date().toTimeString().slice(0, 5), tipoSitio: 'rawland' },
        activities: {},
      },

      updateMaintenanceSiteInfo: (field, value) => set((state) => ({
        maintenanceData: { ...state.maintenanceData, siteInfo: { ...state.maintenanceData.siteInfo, [field]: value } }
      })),

      updateActivityStatus: (actId, status) => {
        set((state) => ({
          maintenanceData: { ...state.maintenanceData, activities: { ...state.maintenanceData.activities, [actId]: { status } } }
        }))
        get().triggerAutosave()
      },
    }),
    { name: 'pti-inspect-storage' }
  )
)
