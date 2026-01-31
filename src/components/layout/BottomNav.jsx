import { ChevronLeft, ChevronRight, Home, FileText, Clock, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav({ 
  onPrev, 
  onNext, 
  prevLabel = 'Anterior', 
  nextLabel = 'Siguiente',
  showPrev = true,
  showNext = true,
  disableNext = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio', path: '/' },
    { id: 'forms', icon: FileText, label: 'Formularios', path: '/forms' },
    { id: 'history', icon: Clock, label: 'Historial', path: '/history' },
    { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
  ]

  const currentTab = tabs.find(t => location.pathname === t.path)?.id || 'forms'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      {/* Action Buttons */}
      <div className="flex gap-3 p-4">
        {showPrev && (
          <button
            onClick={onPrev}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-[15px] active:scale-98 transition-all"
          >
            <ChevronLeft size={18} />
            {prevLabel}
          </button>
        )}
        {showNext && (
          <button
            onClick={onNext}
            disabled={disableNext}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-[15px] active:scale-98 transition-all
              ${disableNext 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white'
              }
            `}
          >
            {nextLabel}
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex border-t border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2
                transition-all active:scale-95
                ${isActive ? 'text-primary' : 'text-gray-400'}
              `}
            >
              <div className={`
                w-7 h-7 flex items-center justify-center rounded-lg
                ${isActive ? 'bg-accent-light text-accent' : ''}
              `}>
                <Icon size={22} />
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
