import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

export default function Select({
  label,
  description,
  required = false,
  options = [],
  className = '',
  validator,
  touchedExternally = false,
  successText = 'Dato registrado correctamente',
  requiredText = 'Campo requerido',
  ...props
}) {
  const [touched, setTouched] = useState(false)
  const value = props.value ?? ''

  useEffect(() => {
    if (touchedExternally && !touched) setTouched(true)
  }, [touchedExternally, touched])

  const validate = () => {
    if (!touched) return { status: 'neutral' }

    if (required && isBlank(value)) return { status: 'invalid', message: requiredText }
    if (!required && isBlank(value)) return { status: 'neutral' }

    if (typeof validator === 'function') {
      const res = validator(value)
      if (typeof res === 'boolean') return res ? { status: 'valid' } : { status: 'invalid', message: 'Valor inválido' }
      if (res && typeof res === 'object') return res.valid ? { status: 'valid' } : { status: 'invalid', message: res.message || 'Valor inválido' }
    }

    return { status: 'valid' }
  }

  const { status, message } = validate()

  const borderClass =
    status === 'valid'
      ? 'border-emerald-500 bg-emerald-50/40'
      : status === 'invalid'
      ? 'border-red-500 bg-red-50/40'
      : 'border-gray-200 bg-white'

  const focusClass =
    status === 'valid'
      ? 'focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
      : status === 'invalid'
      ? 'focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
      : 'focus:border-primary focus:ring-4 focus:ring-primary/10'

  const handleChange = (e) => {
    if (!touched) setTouched(true)
    props.onChange?.(e)
  }

  const handleBlur = (e) => {
    if (!touched) setTouched(true)
    props.onBlur?.(e)
  }

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex flex-wrap items-center gap-1">
            {label}
            {required && <span className="text-red-500 font-extrabold">*</span>}
          </span>
          {description && <span className="text-xs text-gray-500 block mt-1">{description}</span>}
        </label>
      )}

      <div className="relative">
        <select
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 pr-10 text-[15px] border-2 rounded-xl appearance-none transition-all focus:outline-none ${borderClass} ${focusClass}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {status === 'valid' && (
        <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ {successText}</p>
      )}
      {status === 'invalid' && (
        <p className="mt-2 text-xs text-red-600 font-semibold">⚠ {message || 'Valor inválido'}</p>
      )}
    </div>
  )
}