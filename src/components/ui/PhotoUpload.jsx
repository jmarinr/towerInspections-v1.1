import { useState, useMemo } from 'react'
import { Camera, X, Loader2, AlertCircle } from 'lucide-react'
import { isDisplayablePhoto, recoverPhotoFromQueue } from '../../hooks/useAppStore'
import { processImageFile } from '../../lib/photoUtils'

export default function PhotoUpload({ type, photo, value, onCapture, onRemove, formCode, assetType }) {
  const isBefore = type === 'before'
  const rawPhoto = photo || value || null

  // Try to recover photo from pending queue if we only have placeholder
  const recoveredPhoto = useMemo(() => {
    if (isDisplayablePhoto(rawPhoto)) return rawPhoto
    if (rawPhoto && formCode && assetType) {
      return recoverPhotoFromQueue(formCode, assetType)
    }
    return null
  }, [rawPhoto, formCode, assetType])

  const displayablePhoto = recoveredPhoto || (isDisplayablePhoto(rawPhoto) ? rawPhoto : null)
  const hasUploadedPhoto = !!rawPhoto && !displayablePhoto

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const result = await processImageFile(file)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      setTimeout(() => setError(null), 6000)
      return
    }

    onCapture(result.dataUrl)
    setLoading(false)
    e.target.value = ''
  }

  const id = `photo-${type}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="relative">
      <input id={id} type="file" accept="image/*" onChange={handleChange} className="hidden" />

      {error && (
        <div className="mb-2 flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs font-semibold text-blue-600">Procesando foto...</span>
        </div>
      ) : displayablePhoto ? (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-green-500">
          <img src={displayablePhoto} alt={type} className="w-full h-full object-cover" />
          <span className={`absolute top-2 left-2 px-2 py-1 rounded text-[9px] font-bold uppercase text-white ${isBefore ? 'bg-blue-500' : 'bg-green-500'}`}>
            {isBefore ? 'Antes' : 'Después'}
          </span>
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
            <X size={14} />
          </button>
        </div>
      ) : hasUploadedPhoto ? (
        <label htmlFor={id} className={`aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${isBefore ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase text-white ${isBefore ? 'bg-blue-500' : 'bg-green-500'}`}>
            {isBefore ? 'Antes' : 'Después'}
          </span>
          <span className="text-[10px] font-semibold text-gray-600">📷 Subida</span>
          <span className="text-[9px] text-gray-400">Toque para reemplazar</span>
        </label>
      ) : (
        <label htmlFor={id} className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:border-primary transition-all">
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase text-white ${isBefore ? 'bg-blue-500' : 'bg-green-500'}`}>
            {isBefore ? 'Antes' : 'Después'}
          </span>
          <Camera size={24} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Tomar foto</span>
        </label>
      )}
    </div>
  )
}
