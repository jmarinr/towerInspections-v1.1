import { Camera, X } from 'lucide-react'

export default function PhotoUpload({ type, photo, onCapture, onRemove }) {
  const isBefore = type === 'before'
  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onCapture(ev.target.result)
    reader.readAsDataURL(file)
  }
  const id = `photo-${type}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="relative">
      <input id={id} type="file" accept="image/*" capture="environment" onChange={handleChange} className="hidden" />
      {photo ? (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-green-500">
          <img src={photo} alt={type} className="w-full h-full object-cover" />
          <span className={`absolute top-2 left-2 px-2 py-1 rounded text-[9px] font-bold uppercase text-white ${isBefore ? 'bg-blue-500' : 'bg-green-500'}`}>{isBefore ? 'Antes' : 'Después'}</span>
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white"><X size={14} /></button>
        </div>
      ) : (
        <label htmlFor={id} className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:border-primary transition-all">
          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase text-white ${isBefore ? 'bg-blue-500' : 'bg-green-500'}`}>{isBefore ? 'Antes' : 'Después'}</span>
          <Camera size={24} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Tomar foto</span>
        </label>
      )}
    </div>
  )
}
