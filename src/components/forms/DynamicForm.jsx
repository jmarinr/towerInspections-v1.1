import { useMemo, useState } from 'react'
import { MapPin, Camera, X } from 'lucide-react'

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const validateCoords = (coords) => {
  if (isBlank(coords)) return { valid: false, message: 'Campo requerido' }
  const parts = String(coords).split(',').map(s => s.trim())
  if (parts.length !== 2) return { valid: false, message: 'Formato: latitud, longitud' }
  const lat = Number(parts[0])
  const lng = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { valid: false, message: 'Coordenadas inválidas' }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { valid: false, message: 'Coordenadas fuera de rango' }
  return { valid: true }
}

const validateField = (field, value) => {
  // If not required and blank => neutral/valid
  if (!field?.required && isBlank(value)) return { valid: true }

  // Required check
  if (field?.required && isBlank(value)) return { valid: false, message: 'Campo requerido' }

  // Type checks
  switch (field.type) {
    case 'number': {
      const n = Number(String(value))
      if (!Number.isFinite(n)) return { valid: false, message: 'Número inválido' }
      return { valid: true }
    }
    case 'date': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return { valid: false, message: 'Fecha inválida' }
      return { valid: true }
    }
    case 'time': {
      if (!/^\d{2}:\d{2}$/.test(String(value))) return { valid: false, message: 'Hora inválida' }
      return { valid: true }
    }
    case 'select': {
      if (isBlank(value)) return { valid: false, message: 'Seleccione una opción' }
      return { valid: true }
    }
    case 'toggle':
    case 'status': {
      if (isBlank(value)) return { valid: false, message: 'Seleccione una opción' }
      return { valid: true }
    }
    case 'gps':
      return validateCoords(value)
    case 'photo':
      if (isBlank(value)) return { valid: false, message: 'Foto requerida' }
      return { valid: true }
    default:
      return { valid: true }
  }
}

/**
 * DynamicForm supports two calling conventions used across the app:
 *  1) <DynamicForm step={{ title, description, fields }} formData={...} onFieldChange={...} />
 *  2) <DynamicForm fields={[...]} data={...} onChange={...} title="..." description="..." />
 */
export default function DynamicForm(props) {
  const step = props.step ?? (props.fields ? { title: props.title, description: props.description, fields: props.fields } : null)
  const formData = props.formData ?? props.data ?? props.sectionData ?? {}
  const onFieldChange = props.onFieldChange ?? props.onChange ?? (() => {})

  const [touched, setTouched] = useState({})

  // Guard against undefined step or fields
  if (!step || !Array.isArray(step.fields) || step.fields.length === 0) {
    return <div className="text-gray-500 text-center py-4">No hay campos para mostrar</div>
  }

  const { fields } = step

  const shouldShowField = (field) => {
    if (!field.showIf) return true
    const { field: condField, value, values } = field.showIf
    const currentValue = formData[condField]
    if (values) return values.includes(currentValue)
    return currentValue === value
  }

  const markTouched = (fieldId) => setTouched((prev) => (prev[fieldId] ? prev : { ...prev, [fieldId]: true }))

  const handleGPSCapture = (fieldId) => {
    markTouched(fieldId)
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
        onFieldChange(fieldId, coords)
      },
      (err) => alert('Error GPS: ' + err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handlePhotoCapture = (fieldId) => (e) => {
    markTouched(fieldId)
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => onFieldChange(fieldId, ev.target.result)
    reader.readAsDataURL(file)
  }

  const fieldStatus = useMemo(() => {
    const map = {}
    fields.forEach((field) => {
      if (!shouldShowField(field)) return
      const value = formData[field.id] || ''
      const v = validateField(field, value)
      map[field.id] = v
    })
    return map
  }, [fields, formData])

  const baseInputClass = (status) => {
    const base = "w-full px-4 py-3 text-[15px] border-2 rounded-xl outline-none transition-all"
    const focusNeutral = "focus:border-primary focus:ring-4 focus:ring-primary/10"
    if (status === 'valid') return `${base} border-emerald-500 bg-emerald-50/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`
    if (status === 'invalid') return `${base} border-red-500 bg-red-50/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10`
    return `${base} border-gray-200 bg-white ${focusNeutral}`
  }

  const renderField = (field) => {
    if (!shouldShowField(field)) return null

    const value = formData[field.id] || ''
    const isTouched = !!touched[field.id]
    const validity = fieldStatus[field.id]
    const status = !isTouched ? 'neutral' : (validity?.valid ? 'valid' : 'invalid')

    const onChangeWrap = (next) => {
      markTouched(field.id)
      onFieldChange(field.id, next)
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChangeWrap(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass(status)}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChangeWrap(e.target.value)}
            className={baseInputClass(status)}
          />
        )

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => onChangeWrap(e.target.value)}
            className={baseInputClass(status)}
          />
        )

      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChangeWrap(e.target.value)}
              className={`${baseInputClass(status)} appearance-none pr-10`}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        )

      case 'toggle':
        return (
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeWrap(opt.value)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                  value === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'status': {
        const statusOptions = [
          { value: 'bueno', label: 'Bueno', color: 'bg-green-500' },
          { value: 'regular', label: 'Regular', color: 'bg-amber-500' },
          { value: 'malo', label: 'Malo', color: 'bg-red-500' },
          { value: 'na', label: 'N/A', color: 'bg-gray-500' },
        ]
        return (
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeWrap(opt.value)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                  value === opt.value
                    ? `${opt.color} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )
      }

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChangeWrap(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseInputClass(status)} resize-none`}
          />
        )

      case 'gps':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={value}
              readOnly
              placeholder="Latitud, Longitud"
              className={`${baseInputClass(status)} flex-1 bg-gray-50`}
            />
            <button
              type="button"
              onClick={() => handleGPSCapture(field.id)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 hover:bg-gray-50 transition-all"
            >
              <MapPin size={18} />
              <span>Capturar</span>
            </button>
          </div>
        )

      case 'photo':
        return (
          <div>
            <input
              id={`photo-${field.id}`}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture(field.id)}
              className="hidden"
            />
            {value ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-emerald-500">
                <img src={value} alt="Captura" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { markTouched(field.id); onFieldChange(field.id, '') }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`photo-${field.id}`}
                className={`w-full aspect-video rounded-xl border-2 border-dashed ${
                  status === 'invalid' ? 'border-red-400 bg-red-50/40' : 'border-gray-300 bg-gray-50'
                } flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all`}
              >
                <Camera size={32} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Tomar foto</span>
              </label>
            )}
          </div>
        )

      case 'calculated':
        return (
          <input
            type="text"
            value={value || 'Auto-calculado'}
            readOnly
            className={`${baseInputClass('neutral')} bg-gray-100 text-gray-500`}
          />
        )

      case 'signature':
        return (
          <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
            <span className="text-sm text-gray-400">Firma digital (próximamente)</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (!shouldShowField(field)) return null

        const isTouched = !!touched[field.id]
        const v = fieldStatus[field.id]
        const status = !isTouched ? 'neutral' : (v?.valid ? 'valid' : 'invalid')

        return (
          <div key={field.id} className="space-y-1.5">
            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 font-extrabold">*</span>}
            </label>

            {renderField(field)}

            {status === 'valid' && (
              <p className="text-xs text-emerald-600 font-semibold">✓ Dato validado</p>
            )}
            {status === 'invalid' && (
              <p className="text-xs text-red-600 font-semibold">⚠ {v?.message || 'Valor inválido'}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}