import { ChevronLeft, ChevronRight, Home, FileText, Clock, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BottomNav({ onPrev, onNext, prevLabel = 'Anterior', nextLabel = 'Siguiente', showPrev = true, showNext = true }) {
  const navigate = useNavigate()
  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio', path: '/' },
    { id: 'forms', icon: FileText, label: 'Forms', active: true },
    { id: 'history', icon: Clock, label: 'Historial' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex gap-2 sm:gap-3 p-3 sm:p-4">
        {showPrev && <button onClick={onPrev} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm sm:text-[15px] active:scale-95 transition-all"><ChevronLeft size={18} /><span className="truncate">{prevLabel}</span></button>}
        {showNext && <button onClick={onNext} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-3 rounded-xl bg-primary text-white font-bold text-sm sm:text-[15px] active:scale-95 transition-all"><span className="truncate">{nextLabel}</span><ChevronRight size={18} /></button>}
      </div>
      <div className="flex border-t border-gray-100 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => tab.path && navigate(tab.path)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-all min-w-0 ${tab.active ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${tab.active ? 'bg-accent/20 text-accent' : ''}`}><Icon size={20} /></div>
              <span className="text-[9px] sm:text-[10px] font-semibold truncate max-w-full px-1">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
