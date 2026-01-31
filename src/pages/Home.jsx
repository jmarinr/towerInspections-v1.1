import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Wrench, ChevronRight, Clock, FileText } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const forms = [
    {
      id: 'inspeccion',
      title: 'Inspección de Sitio',
      description: 'Checklist completo de inspección de sitio y torre',
      icon: ClipboardCheck,
      color: 'bg-info',
      lightColor: 'bg-info-light',
      items: '76 items',
      path: '/inspeccion-sitio',
    },
    {
      id: 'mantenimiento',
      title: 'Mantenimiento Preventivo',
      description: 'Registro de actividades de mantenimiento',
      icon: Wrench,
      color: 'bg-accent',
      lightColor: 'bg-accent-light',
      items: '30 actividades',
      path: '/mantenimiento',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white px-5 pt-safe-top pb-8">
        <div className="pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-lg font-extrabold">
              PTI
            </div>
            <div>
              <h1 className="text-xl font-bold">PTI Inspect</h1>
              <p className="text-white/60 text-sm">Sistema de Inspección v1.1</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <FileText size={14} />
                En progreso
              </div>
              <div className="text-2xl font-bold">2</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Clock size={14} />
                Esta semana
              </div>
              <div className="text-2xl font-bold">5</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 -mt-4 pb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          Formularios
        </h2>

        <div className="space-y-3">
          {forms.map((form) => {
            const Icon = form.icon
            return (
              <button
                key={form.id}
                onClick={() => navigate(form.path)}
                className="
                  w-full bg-white rounded-2xl p-5
                  flex items-center gap-4
                  border border-gray-200
                  active:scale-[0.98] transition-all
                  text-left
                "
              >
                <div className={`w-14 h-14 ${form.lightColor} rounded-xl flex items-center justify-center`}>
                  <Icon size={28} className={form.color.replace('bg-', 'text-')} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{form.description}</p>
                  <span className="inline-block mt-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {form.items}
                  </span>
                </div>
                <ChevronRight size={24} className="text-gray-300" />
              </button>
            )
          })}
        </div>

        {/* Recent Activity */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-8">
          Actividad Reciente
        </h2>

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {[
            { site: 'PTI-CR-SJ-001', type: 'Inspección', time: 'Hace 2 horas', status: 'completed' },
            { site: 'PTI-CR-HE-042', type: 'Mantenimiento', time: 'Ayer', status: 'completed' },
            { site: 'PTI-CR-AL-015', type: 'Inspección', time: 'En progreso', status: 'progress' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${item.status === 'completed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}
              `}>
                {item.status === 'completed' ? '✓' : '⏳'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{item.site}</p>
                <p className="text-xs text-gray-500">{item.type}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
