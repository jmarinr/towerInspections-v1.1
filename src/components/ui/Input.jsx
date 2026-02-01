import { useEffect, useState } from 'react'

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const defaultTypeValidate = (type, value) => {
  if (isBlank(value)) return { valid: true }
  const v = String(value)
  switch (type) {
    case 'number': {
      const n = Number(v)
      if (!Number.isFinite(n)) return { valid: false, message: 'Número inválido' }
      return { valid: true }
    }
    case 'date': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return { valid: false, message: 'Fecha inválida' }
      return { valid: true }
    }
    case 'time': {
      if (!/^\d{2}:\d{2}$/.test(v)) return { valid: false, message: 'Hora inválida' }
      return { valid: true }
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { valid: false, message: 'Email inválido' }
      return { valid: true }
    }
    default:
      return { valid: true }
  }
}

export default function Input({
  label,
  description,
  required = false,
  className = '',
  validator, // (value) => boolean | { valid, message }
  touchedExternally = false,
  successText = 'Dato registrado correctamente',
  requiredText = 'Campo requerido',
  ...props
}) {
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touchedExternally && !touched) setTouched(true)
  }, [touchedExternally, touched])

  const value = props.value ?? ''
  const type = props.type || 'text'

  const runValidator = () => {
    if (!touched) return { status: 'neutral' }

    if (required && isBlank(value)) {
      return { status: 'invalid', message: requiredText }
    }

    if (!required && isBlank(value)) return { status: 'neutral' }

    if (typeof validator === 'function') {
      const res = validator(value)
      if (typeof res === 'boolean') {
        return res ? { status: 'valid' } : { status: 'invalid', message: 'Valor inválido' }
      }
      if (res && typeof res === 'object') {
        return res.valid ? { status: 'valid' } : { status: 'invalid', message: res.message || 'Valor inválido' }
      }
    }

    const t = defaultTypeValidate(type, value)
    if (!t.valid) return { status: 'invalid', message: t.message || 'Valor inválido' }

    return { status: 'valid' }
  }

  const { status, message } = runValidator()

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

      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 text-[15px] border-2 rounded-xl transition-all placeholder:text-gray-400 focus:outline-none ${borderClass} ${focusClass}`}
      />

      {status === 'valid' && (
        <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ {successText}</p>
      )}
      {status === 'invalid' && (
        <p className="mt-2 text-xs text-red-600 font-semibold">⚠ {message || 'Valor inválido'}</p>
      )}
    </div>
  )
}