import { MapPin, Camera, X } from 'lucide-react'
import { useState } from 'react'
import { queueAssetUpload } from '../../lib/supabaseSync'

/**
 * DynamicForm supports two calling conventions used across the app:
 *  1) <DynamicForm step={{ title, description, fields }} formData={...} onFieldChange={...} />
 *  2) <DynamicForm fields={[...]} data={...} onChange={...} title="..." description="..." />
 *
 * This keeps forms backward/forward compatible and prevents pages from
 * rendering "No hay campos para mostrar" due to a prop-shape mismatch.
 */
export default function DynamicForm(props) {
  const step = props.step ?? (props.fields ? { title: props.title, description: props.description, fields: props.fields } : null)
  const formData = props.formData ?? props.data ?? props.sectionData ?? {}
  const onFieldChange = props.onFieldChange ?? props.onChange ?? (() => {})
  const formCode = props.formCode ?? props.form_code ?? props.formId ?? step?.formCode ?? null

  // Guard against undefined step or fields
  if (!step || !Array.isArray(step.fields) || step.fields.length === 0) {
    return <div className="text-gray-500 text-center py-4">No hay campos para mostrar</div>
  }

  const { fields } = step

  const [touched, setTouched] = useState({})

  const markTouched = (id) => setTouched((prev) => (prev[id] ? prev : { ...prev, [id]: true }))

  const validateByType = (field, value) => {
    const v = value ?? ''
    const isEmpty = String(v).trim().length === 0
    if (!field.required && isEmpty) return null
    if (field.required && isEmpty) return false

    switch (field.type) {
      case 'number':
        return Number.isFinite(Number(v))
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(String(v))
      case 'time':
        return /^\d{2}:\d{2}$/.test(String(v))
      case 'gps': {
        const parts = String(v).split(',').map(s => s.trim())
        if (parts.length !== 2) return false
        const lat = Number(parts[0])
        const lng = Number(parts[1])
        return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      }
      case 'photo':
        // We accept local DataURLs, blob URLs, or remote URLs/keys.
        return String(v).startsWith('data:image') || String(v).startsWith('blob:') || String(v).startsWith('http') || String(v).startsWith('/')
      case 'select':
        return String(v).trim().length > 0
      default:
        return true
    }
  }

  const shouldShowField = (field) => {
    if (!field.showIf) return true
    const { field: condField, value, values } = field.showIf
    const currentValue = formData[condField]
    if (values) return values.includes(currentValue)
    return currentValue === value
  }

  const handleGPSCapture = (fieldId) => {
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
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      onFieldChange(fieldId, dataUrl)
      // Background upload to Supabase Storage (if configured). This should NOT
      // block navigation or local autosave.
      if (formCode) {
        try {
          queueAssetUpload(formCode, fieldId, dataUrl)
        } catch (err) {
          // Silent: offline / storage not configured yet.
          console.warn('[Supabase] queueAssetUpload failed', err)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const renderField = (field) => {
    if (!shouldShowField(field)) return null

    const value = formData[field.id] || ''
    const validity = validateByType(field, value)
    const isTouched = !!touched[field.id] || (field.type === 'gps' && String(value).trim().length > 0)
    const showError = isTouched && validity === false
    const showSuccess = isTouched && validity === true

    const borderClass = showError ? 'border-red-500' : showSuccess ? 'border-emerald-500' : 'border-gray-200'
    const baseInputClass = `w-full px-4 py-3 text-[15px] border-2 ${borderClass} rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all`

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => {
              markTouched(field.id)
              onFieldChange(field.id, e.target.value)
            }}
            onBlur={() => markTouched(field.id)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => {
              markTouched(field.id)
              onFieldChange(field.id, e.target.value)
            }}
            onBlur={() => markTouched(field.id)}
            className={baseInputClass}
          />
        )

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => {
              markTouched(field.id)
              onFieldChange(field.id, e.target.value)
            }}
            onBlur={() => markTouched(field.id)}
            className={baseInputClass}
          />
        )

      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => {
                markTouched(field.id)
                onFieldChange(field.id, e.target.value)
              }}
              onBlur={() => markTouched(field.id)}
              className={`${baseInputClass} appearance-none pr-10`}
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
                onClick={() => {
                  markTouched(field.id)
                  onFieldChange(field.id, opt.value)
                }}
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

      case 'status':
        // Botones estilo inspección: Bueno/Regular/Malo/N/A
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
                onClick={() => {
                  markTouched(field.id)
                  onFieldChange(field.id, opt.value)
                }}
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

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => {
              markTouched(field.id)
              onFieldChange(field.id, e.target.value)
            }}
            onBlur={() => markTouched(field.id)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseInputClass} resize-none`}
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
              className={`${baseInputClass} flex-1 bg-gray-50`}
            />
            <button
              type="button"
              onClick={() => handleGPSCapture(field.id)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 hover:bg-gray-50 transition-all"
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
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-green-500">
                <img src={value} alt="Captura" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onFieldChange(field.id, '')}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`photo-${field.id}`}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Camera size={32} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Tomar foto</span>
              </label>
            )}
          </div>
        )

      case 'calculated':
        // Campo calculado - solo lectura
        return (
          <input
            type="text"
            value={value || 'Auto-calculado'}
            readOnly
            className={`${baseInputClass} bg-gray-100 text-gray-500`}
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

        const value = formData[field.id] || ''
        const validity = validateByType(field, value)
        const isTouched = !!touched[field.id] || (field.type === 'gps' && String(value).trim().length > 0)
        const showError = isTouched && validity === false
        const showSuccess = isTouched && validity === true
        
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
            {showError && <p className="text-xs font-medium text-red-500">⚠ {field.errorText || 'Dato requerido o inválido'}</p>}
            {showSuccess && <p className="text-xs font-semibold text-emerald-600">✓ {field.successText || 'Dato registrado correctamente'}</p>}
          </div>
        )
      })}
    </div>
  )
}
