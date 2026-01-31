import { useEffect } from 'react'

export default function Toast({ message, type = 'info', show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  const bgColor = {
    info: 'bg-gray-900',
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning text-gray-900',
  }[type] || 'bg-gray-900'

  return (
    <div
      className={`
        fixed bottom-[180px] left-4 right-4 z-[300]
        ${bgColor} text-white
        px-5 py-4 rounded-xl
        font-semibold text-sm
        flex items-center gap-3
        shadow-lg
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}
      `}
    >
      {message}
    </div>
  )
}
