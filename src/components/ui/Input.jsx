export default function Input({ label, description, required, error, className = '', ...props }) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {label}
            {required && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded">Requerido</span>}
          </span>
          {description && <span className="text-xs text-gray-500 block mt-1">{description}</span>}
        </label>
      )}
      <input className={`w-full px-4 py-3.5 text-[15px] border-2 rounded-xl bg-white transition-all placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-red-500' : 'border-gray-200'}`} {...props} />
      {error && <p className="mt-2 text-xs text-red-500 font-medium">⚠ {error}</p>}
    </div>
  )
}
