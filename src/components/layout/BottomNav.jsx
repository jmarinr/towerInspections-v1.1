import { ArrowLeft, ArrowRight, Home, ClipboardList, Wrench, ListChecks } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'inspeccion', label: 'Inspección', icon: ClipboardList, path: '/inspeccion' },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, path: '/mantenimiento' },
  { id: 'inventario', label: 'Inventario', icon: ListChecks, path: '/inventario-equipos' },
]

const isActivePath = (pathname, tabPath) => {
  if (tabPath === '/') return pathname === '/'
  return pathname === tabPath || pathname.startsWith(tabPath + '/')
}

export default function BottomNav({
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  showPrev,
  showNext,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const canPrev = typeof onPrev === 'function' && !prevDisabled
  const canNext = typeof onNext === 'function' && !nextDisabled
  const renderPrev = showPrev ?? typeof onPrev === 'function'
  const renderNext = showNext ?? typeof onNext === 'function'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="py-2 flex items-center justify-between gap-3">
          {renderPrev ? (
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                canPrev
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  : 'bg-gray-100/60 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={16} />
              {prevLabel}
            </button>
          ) : (
            <div />
          )}

          {renderNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                canNext
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                  : 'bg-primary/40 text-white/80 cursor-not-allowed'
              }`}
            >
              {nextLabel}
              <ArrowRight size={16} />
            </button>
          ) : (
            <div />
          )}
        </div>

        <div className="pb-2 flex justify-around">
          {tabs.map((tab) => {
            const active = isActivePath(location.pathname, tab.path)
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                  active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium mt-1">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}