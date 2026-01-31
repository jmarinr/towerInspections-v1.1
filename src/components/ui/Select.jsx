import { ChevronDown } from 'lucide-react'

export default function Select({ label, description, required, options = [], ...props }) {
  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {label}
            {required && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded">Requerido</span>}
          </span>
          {description && <span className="text-xs text-gray-500 block mt-1">{description}</span>}
        </label>
      )}
      <div className="relative">
        <select className="w-full px-4 py-3.5 pr-10 text-[15px] border-2 border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" {...props}>
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
