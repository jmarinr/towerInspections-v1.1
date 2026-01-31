import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Wrench, ChevronRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const forms = [
    { id: 'inspeccion', title: 'Inspección de Sitio', desc: 'Checklist de inspección de sitio y torre', icon: ClipboardCheck, color: 'bg-blue-500', items: '38 items', path: '/inspeccion-sitio' },
    { id: 'mantenimiento', title: 'Mantenimiento Preventivo', desc: 'Registro de actividades de mantenimiento', icon: Wrench, color: 'bg-accent', items: '20 actividades', path: '/mantenimiento' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-lg font-extrabold">PTI</div>
          <div>
            <h1 className="text-xl font-bold">PTI Inspect</h1>
            <p className="text-white/60 text-sm">Sistema de Inspección v1.1</p>
          </div>
        </div>
      </header>

      <main className="px-5 -mt-4 pb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Formularios</h2>
        <div className="space-y-3">
          {forms.map((form) => {
            const Icon = form.icon
            return (
              <button key={form.id} onClick={() => navigate(form.path)} className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-200 active:scale-[0.98] transition-all text-left">
                <div className={`w-14 h-14 ${form.color} rounded-xl flex items-center justify-center`}><Icon size={28} className="text-white" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{form.desc}</p>
                  <span className="inline-block mt-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{form.items}</span>
                </div>
                <ChevronRight size={24} className="text-gray-300" />
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
