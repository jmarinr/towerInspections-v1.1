import { ChevronLeft, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AppHeader({ title, subtitle, badge, progress, onMenuClick }) {
  const navigate = useNavigate()
  return (
    <header className="bg-primary sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
        <button onClick={() => navigate('/')} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all flex-shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-[17px] font-bold text-white truncate">{title}</h1>
          <div className="text-[11px] sm:text-xs text-white/70 flex items-center gap-2 flex-wrap">
            <span className="truncate">{subtitle}</span>
            {badge && <span className="bg-accent px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0">{badge}</span>}
          </div>
        </div>
        <button onClick={onMenuClick} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all flex-shrink-0">
          <MoreVertical size={20} />
        </button>
      </div>
      {progress !== undefined && (
        <div className="px-3 sm:px-4 py-3 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white text-sm font-bold min-w-[40px] text-right">{progress}%</span>
          </div>
        </div>
      )}
    </header>
  )
}
