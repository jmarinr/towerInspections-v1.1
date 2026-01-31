import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import SiteInfoForm from '../components/forms/SiteInfoForm'
import { useAppStore } from '../hooks/useAppStore'
import { getActivitiesBySiteType } from '../data/maintenanceActivities'

export default function MantenimientoPreventivo() {
  const navigate = useNavigate()
  const { maintenanceData, updateMaintenanceSiteInfo, showToast } = useAppStore()
  const [currentStep, setCurrentStep] = useState('info')

  const siteType = maintenanceData.siteInfo.tipoSitio || 'rawland'
  const activities = getActivitiesBySiteType(siteType)

  // Calculate progress
  const progress = useMemo(() => {
    const total = activities.length
    const completed = Object.values(maintenanceData.activities).filter(a => a?.status).length
    return Math.round((completed / total) * 100)
  }, [maintenanceData.activities, activities])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />

      <AppHeader
        title="Mantenimiento Preventivo"
        subtitle={maintenanceData.siteInfo.idSitio || 'Nuevo'}
        badge="En progreso"
        progress={progress}
        onMenuClick={() => showToast('Opciones: Guardar, Exportar, Ayuda')}
      />

      {/* Site Type Toggle */}
      <div className="bg-primary px-4 pb-4">
        <div className="flex gap-2">
          {['rawland', 'rooftop'].map((type) => (
            <button
              key={type}
              onClick={() => updateMaintenanceSiteInfo('tipoSitio', type)}
              className={`
                flex-1 py-3 rounded-xl font-semibold text-sm
                transition-all active:scale-95
                ${siteType === type 
                  ? 'bg-white text-primary' 
                  : 'bg-white/10 text-white/70'
                }
              `}
            >
              {type === 'rawland' ? '🏗️ Rawland' : '🏢 Rooftop'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-44 pt-4">
        {currentStep === 'info' ? (
          <>
            <div className="mb-4">
              <div className="text-3xl mb-2">📋</div>
              <h2 className="text-xl font-extrabold text-gray-900">Información del Sitio</h2>
              <p className="text-sm text-gray-500">Datos generales del mantenimiento</p>
            </div>
            <SiteInfoForm type="maintenance" />
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-3xl mb-2">🔧</div>
              <h2 className="text-xl font-extrabold text-gray-900">Actividades</h2>
              <p className="text-sm text-gray-500">{activities.length} actividades de mantenimiento</p>
            </div>
            
            {/* Activity List */}
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav
        onPrev={() => setCurrentStep('info')}
        onNext={() => {
          if (currentStep === 'info') {
            setCurrentStep('activities')
          } else {
            showToast('¡Mantenimiento completado!', 'success')
          }
        }}
        showPrev={currentStep !== 'info'}
        nextLabel={currentStep === 'info' ? 'Continuar' : 'Finalizar'}
      />
    </div>
  )
}

// Activity Item Component
function ActivityItem({ activity, index }) {
  const { maintenanceData, updateActivityStatus } = useAppStore()
  const state = maintenanceData.activities[activity.id] || {}
  const isComplete = state.status === 'complete'
  const isNA = state.status === 'na'

  return (
    <div className={`
      bg-white rounded-2xl p-4 border-2 transition-all
      ${isComplete ? 'border-success' : isNA ? 'border-gray-300' : 'border-gray-200'}
    `}>
      <div className="flex gap-3 mb-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${isComplete ? 'bg-success text-white' : isNA ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-500'}
        `}>
          {isComplete ? '✓' : isNA ? '—' : index + 1}
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${isNA ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {activity.name}
          </p>
          <p className="text-xs text-gray-500">{activity.location}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => updateActivityStatus(activity.id, 'complete')}
          className={`
            flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
            transition-all active:scale-95
            ${isComplete 
              ? 'bg-success text-white' 
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          ✓ Completado
        </button>
        <button
          onClick={() => updateActivityStatus(activity.id, 'na')}
          className={`
            flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
            transition-all active:scale-95
            ${isNA 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          — No Aplica
        </button>
      </div>
    </div>
  )
}
