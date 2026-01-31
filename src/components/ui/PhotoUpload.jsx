import { Camera, X } from 'lucide-react'

export default function PhotoUpload({ type, photo, onCapture, onRemove }) {
  const isBefore = type === 'before'
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      onCapture(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const inputId = `photo-${type}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="relative">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {photo ? (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-success">
          <img src={photo} alt={type} className="w-full h-full object-cover" />
          <span
            className={`
              absolute top-2 left-2 
              px-2 py-1 rounded-md 
              text-[9px] font-bold uppercase text-white
              ${isBefore ? 'bg-info' : 'bg-success'}
            `}
          >
            {isBefore ? 'Antes' : 'Después'}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-danger rounded-full flex items-center justify-center text-white active:scale-95"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="
            aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300
            flex flex-col items-center justify-center gap-2 cursor-pointer
            bg-white hover:border-primary hover:bg-gray-50
            transition-all active:scale-98
          "
        >
          <span
            className={`
              px-2 py-1 rounded-md 
              text-[9px] font-bold uppercase text-white
              ${isBefore ? 'bg-info' : 'bg-success'}
            `}
          >
            {isBefore ? 'Antes' : 'Después'}
          </span>
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            <Camera size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-600">Tomar foto</span>
        </label>
      )}
    </div>
  )
}
