impor

{
  id: 'sistema-ascenso',
  title: 'Sistema de ascenso',
  description: 'Revisión de dispositivo de ascenso y componentes asociados',
  icon: Shield,
  iconBg: 'bg-emerald-500',
  stats: '34 ítems / 6 secciones',
  route: '/sistema-ascenso',
},
t { useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, Wrench, Shield, Settings, User, Package } from 'lucide-react'
import Toast from '../components/ui/Toast'

export default function Home() {
  const navigate = useNavigate()

  const forms = [
    {
      id: 'inspeccion',
      title: 'Inspección General',
      description: 'Lista de verificación para inspección general de equipos y sitio',
      icon: ClipboardCheck,
      iconBg: 'bg-blue-500',
      stats: '38 ítems / 6 secciones',
      route: '/inspeccion',
    },
    {
      id: 'mantenimiento',
      title: 'Mantenimiento Preventivo',
      description: 'Registro de actividades para mantenimiento preventivo de torres',
      icon: Wrench,
      iconBg: 'bg-orange-500',
      stats: '92 ítems / 17 pasos',
      route: '/mantenimiento',
    },
    {
      id: 'equipment',
      title: 'Inventario de Equipos',
      description: 'Inventario de equipos (Torre + Piso) con croquis y plano',
      icon: Package,
      iconBg: 'bg-emerald-500',
      stats: '28 ítems / 6 pasos',
      route: '/inventario-equipos',
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Toast />
      
      {/* Header con gradiente */}
      <header className="bg-gradient-to-b from-primary to-primary/90 text-white px-6 pt-12 pb-10">
        {/* Logo PTI */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            {/* Logo placeholder - se reemplazará con imagen */}
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-primary">PTI</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PTI Inspect</h1>
          <p className="text-white/70 text-sm mt-1">Sistema de Inspección v1.1.4</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 px-4 -mt-4">
        {/* Sección de formularios */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Formularios
          </h2>
          
          <div className="space-y-3">
            {forms.map((form) => {
              const IconComponent = form.icon
              return (
                <button
                  key={form.id}
                  onClick={() => navigate(form.route)}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all text-left"
                >
                  {/* Icono */}
                  <div className={`w-14 h-14 ${form.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <IconComponent size={28} className="text-white" />
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base">{form.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{form.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`w-4 h-4 ${form.iconBg} rounded flex items-center justify-center`}>
                        <IconComponent size={10} className="text-white" />
                      </span>
                      <span className="text-xs font-semibold text-gray-600">{form.stats}</span>
                    </div>
                  </div>
                  
                  {/* Flecha */}
                  <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </section>

        {/* Sección de acciones rápidas */}
        <section className="mt-6 mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Acceso Rápido
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-100 active:scale-95 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings size={20} className="text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Configuración</span>
            </button>
            
            <button className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-100 active:scale-95 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Mi Perfil</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          Phoenix Tower International © 2026
        </p>
      </footer>
    </div>
  )
}
