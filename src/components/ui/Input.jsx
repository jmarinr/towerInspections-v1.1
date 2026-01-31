export default function Input({
  label,
  description,
  required,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {label}
            {required && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-danger-light text-danger rounded">
                Requerido
              </span>
            )}
          </span>
          {description && (
            <span className="text-xs text-gray-500 block mt-1">{description}</span>
          )}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3.5 
          text-[15px] font-medium
          border-2 rounded-xl 
          bg-white
          transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
          ${error ? 'border-danger bg-danger-light' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-xs text-danger font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
