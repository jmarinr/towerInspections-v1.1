const statusConfig = {
  bueno: {
    icon: '✓',
    label: 'Bueno',
    selectedClass: 'border-success bg-success-light',
    iconClass: 'bg-success border-success text-white',
    labelClass: 'text-success',
  },
  regular: {
    icon: '!',
    label: 'Regular',
    selectedClass: 'border-warning bg-warning-light',
    iconClass: 'bg-warning border-warning text-white',
    labelClass: 'text-amber-700',
  },
  malo: {
    icon: '✕',
    label: 'Malo',
    selectedClass: 'border-danger bg-danger-light',
    iconClass: 'bg-danger border-danger text-white',
    labelClass: 'text-danger',
  },
  na: {
    icon: '—',
    label: 'N/A',
    selectedClass: 'border-gray-400 bg-gray-100',
    iconClass: 'bg-gray-400 border-gray-400 text-white',
    labelClass: 'text-gray-600',
  },
}

export default function StatusButton({ status, selected, onClick }) {
  const config = statusConfig[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1
        p-3 rounded-xl border-2 bg-white
        transition-all duration-150 active:scale-95
        min-h-[72px]
        ${selected ? config.selectedClass : 'border-gray-200'}
      `}
    >
      <div
        className={`
          w-7 h-7 rounded-full border-2 
          flex items-center justify-center
          text-sm font-bold
          transition-all duration-150
          ${selected ? config.iconClass : 'border-gray-300 text-gray-400'}
        `}
      >
        {config.icon}
      </div>
      <div
        className={`
          text-[11px] font-semibold
          ${selected ? config.labelClass : 'text-gray-600'}
        `}
      >
        {config.label}
      </div>
    </button>
  )
}
