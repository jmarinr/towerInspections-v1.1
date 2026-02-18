import { useState } from 'react'
import { Camera, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useAppStore, isDisplayablePhoto, recoverPhotoFromQueue } from '../../hooks/useAppStore'

export default function MaintenanceActivity({ activity, index }) {
  const { maintenanceData, updateActivityStatus, updateActivityPhoto } = useAppStore()
  const [showPhotos, setShowPhotos] = useState(false)
  
  const state = maintenanceData.activities[activity.id] || {}
  const isComplete = state.status === 'complete'

  const beforeRaw = maintenanceData.photos?.[`${activity.id}-before`]
  const afterRaw = maintenanceData.photos?.[`${activity.id}-after`]
  const beforePhoto = isDisplayablePhoto(beforeRaw) ? beforeRaw
    : (beforeRaw ? recoverPhotoFromQueue('preventive-maintenance', `maintenance:${activity.id}:before`) : null)
  const afterPhoto = isDisplayablePhoto(afterRaw) ? afterRaw
    : (afterRaw ? recoverPhotoFromQueue('preventive-maintenance', `maintenance:${activity.id}:after`) : null)
  const hasPhotos = beforePhoto || afterPhoto
  const hasBothPhotos = beforePhoto && afterPhoto
  const isNA = state.status === 'na'
  const hasStatus = isComplete || isNA
  
  // Determinar si está completo (estado + fotos si es completado)
  const isFullyComplete = isComplete && hasBothPhotos
  const needsPhotos = isComplete && !hasBothPhotos

  const handlePhotoCapture = (type) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => updateActivityPhoto(activity.id, type, ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = (type) => () => {
    updateActivityPhoto(activity.id, type, null)
  }

  // Determinar color del borde
  const getBorderColor = () => {
    if (isFullyComplete) return 'border-green-500'
    if (isNA) return 'border-gray-300'
    if (needsPhotos) return 'border-amber-400' // Indica que falta algo
    return 'border-gray-200'
  }

  // Determinar color del badge numérico
  const getBadgeStyle = () => {
    if (isFullyComplete) return 'bg-green-500 text-white'
    if (isNA) return 'bg-gray-300 text-white'
    if (needsPhotos) return 'bg-amber-400 text-white'
    return 'bg-gray-100 text-gray-500'
  }

  const getBadgeContent = () => {
    if (isFullyComplete) return '✓'
    if (isNA) return '—'
    return index + 1
  }

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${getBorderColor()}`}>
      {/* Header de la actividad */}
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${getBadgeStyle()}`}>
            {getBadgeContent()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-tight ${isNA ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {activity.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{activity.location}</p>
          </div>
          {/* Indicador de fotos faltantes */}
          {needsPhotos && (
            <div className="flex items-center">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                📷 Falta evidencia
              </span>
            </div>
          )}
        </div>

        {/* Botones de estado */}
        <div className="flex gap-2">
          <button 
            onClick={() => updateActivityStatus(activity.id, 'complete')} 
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              isComplete 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✓ Completado
          </button>
          <button 
            onClick={() => updateActivityStatus(activity.id, 'na')} 
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              isNA 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            — N/A
          </button>
        </div>
      </div>

      {/* Sección de fotos - Solo visible si NO es N/A */}
      {!isNA && (
        <div className="border-t border-gray-100">
          {/* Botón para expandir/colapsar fotos */}
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-all ${
              showPhotos ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Camera size={16} className={hasPhotos ? 'text-green-500' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${hasPhotos ? 'text-gray-700' : 'text-gray-500'}`}>
                {hasPhotos 
                  ? `Evidencia (${[beforePhoto, afterPhoto].filter(Boolean).length}/2)` 
                  : 'Agregar evidencia fotográfica'
                }
              </span>
              {/* Indicadores de fotos existentes */}
              {hasPhotos && (
                <div className="flex gap-1 ml-2">
                  {beforePhoto && (
                    <span className="w-5 h-5 rounded bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">A</span>
                  )}
                  {afterPhoto && (
                    <span className="w-5 h-5 rounded bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">D</span>
                  )}
                </div>
              )}
            </div>
            {showPhotos ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {/* Panel expandible de fotos */}
          {showPhotos && (
            <div className="px-4 pb-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                {/* Foto ANTES */}
                <div>
                  <input
                    id={`photo-before-${activity.id}`}
                    type="file"
                    accept="image/*"
                    
                    onChange={handlePhotoCapture('before')}
                    className="hidden"
                  />
                  {beforePhoto ? (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-blue-500">
                      <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white bg-blue-500">
                        Antes
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto('before')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-95"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`photo-before-${activity.id}`}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-all"
                    >
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white bg-blue-500">
                        Antes
                      </span>
                      <Camera size={20} className="text-blue-400" />
                      <span className="text-[10px] font-semibold text-blue-500">Tomar foto</span>
                    </label>
                  )}
                </div>

                {/* Foto DESPUÉS */}
                <div>
                  <input
                    id={`photo-after-${activity.id}`}
                    type="file"
                    accept="image/*"
                    
                    onChange={handlePhotoCapture('after')}
                    className="hidden"
                  />
                  {afterPhoto ? (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-green-500">
                      <img src={afterPhoto} alt="Después" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white bg-green-500">
                        Después
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto('after')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-95"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`photo-after-${activity.id}`}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-green-300 bg-green-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-green-400 hover:bg-green-100 transition-all"
                    >
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white bg-green-500">
                        Después
                      </span>
                      <Camera size={20} className="text-green-400" />
                      <span className="text-[10px] font-semibold text-green-500">Tomar foto</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Mensaje de ayuda */}
              {!hasBothPhotos && (
                <p className="text-[11px] text-gray-500 mt-3 text-center">
                  📸 Capture fotos antes y después de realizar la actividad
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
