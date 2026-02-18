import { useState, useMemo } from 'react'
import { Camera, X, Loader2, AlertCircle } from 'lucide-react'
import { isDisplayablePhoto, recoverPhotoFromQueue } from '../../hooks/useAppStore'
import { processImageFile } from '../../lib/photoUtils'

export default function SinglePhotoUpload({
  id,
  label = 'Foto',
  value,
  onChange,
  required = false,
  helpText = '',
  formCode,
  assetType,
}) {
  const rawValue = value || null

  // Try to recover photo from pending queue if we only have placeholder
  const recoveredPhoto = useMemo(() => {
    if (isDisplayablePhoto(rawValue)) return rawValue
    if (rawValue && formCode && assetType) {
      return recoverPhotoFromQueue(formCode, assetType)
    }
    return null
  }, [rawValue, formCode, assetType])

  const displayablePhoto = recoveredPhoto || (isDisplayablePhoto(rawValue) ? rawValue : null)
  const hasUploadedPhoto = !!rawValue && !displayablePhoto

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCapture = async (e) => {
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

    onChange?.(result.dataUrl)
    setLoading(false)
    e.target.value = ''
  }

  const handleRemove = () => {
    setError(null)
    onChange?.(null)
  }

  return (
    <div className="mb-4">
      <label className="block mb-2">
        <span className="text-sm font-semibold text-gray-700 flex flex-wrap items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {helpText && <span className="text-xs text-gray-500 block mt-1">{helpText}</span>}
      </label>

      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={handleCapture}
        className="hidden"
      />

      {/* Error banner */}
      {error && (
        <div className="mb-2 flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="w-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-2 py-8">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <p className="text-sm font-semibold text-blue-600">Procesando foto...</p>
          <p className="text-xs text-blue-400">Comprimiendo imagen</p>
        </div>
      ) : displayablePhoto ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white">
          <img src={displayablePhoto} alt={label} className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-95"
            aria-label="Eliminar foto"
          >
            <X size={14} />
          </button>
          <div className="px-4 py-3 bg-white">
            <p className="text-xs font-semibold text-emerald-600">✓ Foto cargada</p>
          </div>
        </div>
      ) : hasUploadedPhoto ? (
        <label
          htmlFor={id}
          className="w-full rounded-2xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center gap-2 py-8 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Camera size={22} className="text-emerald-500" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-emerald-700">📷 Foto subida</p>
            <p className="text-xs text-emerald-500 mt-1">Toque para reemplazar</p>
          </div>
        </label>
      ) : (
        <label
          htmlFor={id}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Camera size={22} className="text-gray-500" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-gray-700">Tomar / subir foto</p>
            <p className="text-xs text-gray-500 mt-1">Toque para abrir la cámara</p>
          </div>
        </label>
      )}
    </div>
  )
}
