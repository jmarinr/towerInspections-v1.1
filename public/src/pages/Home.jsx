import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, Wrench, Shield, Package, Zap, Camera, LogOut, User } from 'lucide-react'
import { useAppStore } from '../hooks/useAppStore'
import { filterFormsByRole } from '../lib/auth'

const ALL_FORMS = [
  {
    id: 'inspeccion',
    title: 'Inspección General',
    description: 'Lista de verificación para inspección general de equipos y sitio',
    icon: ClipboardCheck,
    iconBg: 'bg-blue-500',
    stats: '38 ítems / 6 secciones',
    route: '/intro/inspeccion',
  },
  {
    id: 'mantenimiento',
    title: 'Mantenimiento Preventivo',
    description: 'Registro de actividades para mantenimiento preventivo de torres',
    icon: Wrench,
    iconBg: 'bg-orange-500',
    stats: '92 ítems / 17 pasos',
    route: '/intro/mantenimiento',
  },
  {
    id: 'mantenimiento-ejecutado',
    title: 'Mantenimiento Ejecutado',
    description: 'Trabajos ejecutados (Rawland/Rooftop) con fotos Antes/Después por actividad',
    icon: Camera,
    iconBg: 'bg-teal-500',
    stats: '32 actividades / 64 fotos',
    route: '/intro/mantenimiento-ejecutado',
  },
  {
    id: 'equipment',
    title: 'Inventario de Equipos',
    description: 'Inventario de equipos (Torre + Piso) con croquis y plano',
    icon: Package,
    iconBg: 'bg-emerald-500',
    stats: '28 ítems / 6 pasos',
    route: '/intro/equipment',
  },
  {
    id: 'sistema-ascenso',
    title: 'Sistema de ascenso',
    description: 'Revisión de dispositivo de ascenso y componentes asociados',
    icon: Shield,
    iconBg: 'bg-indigo-500',
    stats: '34 ítems / 6 secciones',
    route: '/intro/sistema-ascenso',
  },
  {
    id: 'grounding-system-test',
    title: 'Prueba de puesta a tierra',
    description: 'Medición de resistencia del sistema de puesta a tierra y evidencia',
    icon: Zap,
    iconBg: 'bg-purple-500',
    stats: '29 ítems / 5 secciones',
    route: '/intro/grounding-system-test',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const logout = useAppStore((s) => s.logout)

  const visibleForms = useMemo(() => {
    if (!session) return []
    return filterFormsByRole(ALL_FORMS, session.role)
  }, [session])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary to-primary/90 text-white px-6 pt-4 pb-3 relative">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>

        <div className="flex flex-col items-center">
          <div className="mb-2">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-primary">PTI</span>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">PTI Inspect</h1>
          <p className="text-white/70 text-sm mt-0.5">Sistema de Inspección v1.8</p>

          {/* User info pill */}
          {session && (
            <div className="mt-2 flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <User size={12} />
              <span className="text-xs font-semibold">{session.name}</span>
              <span className="text-[10px] text-white/60">·</span>
              <span className="text-[10px] text-white/70">{session.roleLabel}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 -mt-3">
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Formularios
          </h2>

          {visibleForms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClipboardCheck size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Sin formularios asignados</p>
              <p className="text-xs text-gray-500 mt-1">
                Su rol ({session?.roleLabel}) no tiene formularios habilitados.
                Contacte al administrador.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleForms.map((form) => {
                const IconComponent = form.icon
                return (
                  <button
                    key={form.id}
                    onClick={() => navigate(form.route)}
                    className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all text-left"
                  >
                    <div className={`w-14 h-14 ${form.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <IconComponent size={28} className="text-white" />
                    </div>
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
                    <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">© 2026</p>
      </footer>
    </div>
  )
}
