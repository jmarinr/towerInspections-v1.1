import { useState, useMemo } from 'react'
import AppHeader from '../components/layout/AppHeader'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import SiteInfoForm from '../components/forms/SiteInfoForm'
import MaintenanceActivity from '../components/forms/MaintenanceActivity'
import { useAppStore } from '../hooks/useAppStore'
import { getActivitiesBySiteType } from '../data/maintenanceActivities'

export default function MantenimientoPreventivo() {
  const { maintenanceData, updateMaintenanceSiteInfo, showToast } = useAppStore()
  const [currentStep, setCurrentStep] = useState('info')
  const siteType = maintenanceData.siteInfo.tipoSitio || 'rawland'
  const activities = getActivitiesBySiteType(siteType)

  // Calcular progreso considerando: estado + fotos para completados
  const { progress, stats } = useMemo(() => {
    let fullyComplete = 0
    let naCount = 0
    let pendingPhotos = 0
    
    activities.forEach(act => {
      const state = maintenanceData.activities[act.id]
      if (!state?.status) return
      
      if (state.status === 'na') {
        naCount++
        fullyComplete++ // N/A cuenta como completo
      } else if (state.status === 'complete') {
        const hasBeforePhoto = maintenanceData.photos?.[`${act.id}-before`]
        const hasAfterPhoto = maintenanceData.photos?.[`${act.id}-after`]
        if (hasBeforePhoto && hasAfterPhoto) {
          fullyComplete++
        } else {
          pendingPhotos++
        }
      }
    })
    
    const progressValue = Math.round((fullyComplete / activities.length) * 100)
    return { 
      progress: progressValue, 
      stats: { fullyComplete, naCount, pendingPhotos, total: activities.length }
    }
  }, [maintenanceData.activities, maintenanceData.photos, activities])

  const handleFinish = () => {
    if (stats.pendingPhotos > 0) {
      showToast(`Faltan fotos en ${stats.pendingPhotos} actividad(es)`, 'warning')
      return
    }
    showToast('¡Mantenimiento completado!', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />
      <AppHeader 
        title="Mantenimiento Preventivo" 
        subtitle={maintenanceData.siteInfo.idSitio || 'Nuevo'} 
        badge="En progreso" 
        progress={progress} 
        onMenuClick={() => showToast('Menú de opciones')} 
      />
      
      <div className="bg-primary px-4 pb-4">
        <div className="flex gap-2">
          {['rawland', 'rooftop'].map((type) => (
            <button 
              key={type} 
              onClick={() => updateMaintenanceSiteInfo('tipoSitio', type)} 
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                siteType === type 
                  ? 'bg-white text-primary' 
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {type === 'rawland' ? '🏗️ Rawland' : '🏢 Rooftop'}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-44 pt-4 overflow-x-hidden">
        {currentStep === 'info' ? (
          <>
            <div className="mb-4">
              <div className="text-3xl mb-2">📋</div>
              <h2 className="text-xl font-extrabold text-gray-900">Información del Sitio</h2>
              <p className="text-sm text-gray-500">Datos generales</p>
            </div>
            <SiteInfoForm type="maintenance" />
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-2">🔧</div>
                  <h2 className="text-xl font-extrabold text-gray-900">Actividades</h2>
                  <p className="text-sm text-gray-500">{activities.length} actividades</p>
                </div>
                {/* Mini resumen de estado */}
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-primary">{stats.fullyComplete}/{stats.total}</div>
                  <div className="text-[10px] text-gray-500">completadas</div>
                  {stats.pendingPhotos > 0 && (
                    <div className="text-[10px] text-amber-600 font-semibold mt-1">
                      ⚠️ {stats.pendingPhotos} sin fotos
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {activities.map((act, idx) => (
                <MaintenanceActivity 
                  key={act.id} 
                  activity={act} 
                  index={idx} 
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav 
        onPrev={() => setCurrentStep('info')} 
        onNext={() => currentStep === 'info' ? setCurrentStep('activities') : handleFinish()} 
        showPrev={currentStep !== 'info'} 
        nextLabel={currentStep === 'info' ? 'Continuar' : 'Finalizar'} 
      />
    </div>
  )
}
