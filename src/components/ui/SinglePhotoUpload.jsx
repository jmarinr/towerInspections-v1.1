import { Camera, X } from 'lucide-react'

export default function SinglePhotoUpload({
  id,
  label = 'Foto',
  value,
  onChange,
  required = false,
  helpText = '',
}) {
  const hasPhoto = !!value

  const handleCapture = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => onChange?.(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemove = () => onChange?.('')

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
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {hasPhoto ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white">
          <img src={value} alt={label} className="w-full h-48 object-cover" />
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
