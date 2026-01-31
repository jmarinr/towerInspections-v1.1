import { ChevronLeft, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AppHeader({ 
  title, 
  subtitle, 
  badge,
  progress,
  onMenuClick 
}) {
  const navigate = useNavigate()

  return (
    <header className="bg-primary sticky top-0 z-50">
      {/* Top Row */}
      <div className="flex items-center gap-3 px-4 py-3 safe-top">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95 active:bg-white/20 transition-all"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold text-white truncate">{title}</h1>
          <div className="text-xs text-white/70 flex items-center gap-2">
            {subtitle}
            {badge && (
              <span className="bg-accent px-2 py-0.5 rounded-lg text-[10px] font-bold">
                {badge}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onMenuClick}
          className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all relative"
        >
          <MoreVertical size={22} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-success rounded-full border-2 border-primary" />
        </button>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="px-4 py-3 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white text-sm font-bold min-w-[45px] text-right">
              {progress}%
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
