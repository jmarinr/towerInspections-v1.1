import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardCheck, Wrench, Package, Shield, Zap } from 'lucide-react'

const FORM_MAP = {
  inspeccion: {
    title: 'Inspección General',
    badge: 'EJECUCIÓN',
    description: 'Complete la inspección del sitio y equipos. Registre evidencia y valide campos obligatorios.',
    icon: ClipboardCheck,
    iconBg: 'bg-blue-500',
    route: '/inspeccion',
    features: [
      { icon: '📷', text: 'Fotos Antes/Después' },
      { icon: '📍', text: 'GPS Automático' },
      { icon: '✓', text: 'Validación en Tiempo Real' },
      { icon: '💾', text: 'Guardado Automático' },
    ],
  },
  mantenimiento: {
    title: 'Mantenimiento Preventivo',
    badge: 'EJECUCIÓN',
    description: 'Registre los trabajos de mantenimiento preventivo realizados en el sitio, incluyendo evidencias antes y después.',
    icon: Wrench,
    iconBg: 'bg-orange-500',
    route: '/mantenimiento',
    features: [
      { icon: '📷', text: 'Fotos Antes/Después' },
      { icon: '📍', text: 'GPS Automático' },
      { icon: '✓', text: 'Validación en Tiempo Real' },
      { icon: '💾', text: 'Guardado Automático' },
    ],
  },
  equipment: {
    title: 'Inventario de Equipos',
    badge: 'EJECUCIÓN',
    description: 'Complete el inventario de equipos (Torre + Piso) y registre evidencias del sitio.',
    icon: Package,
    iconBg: 'bg-emerald-500',
    route: '/inventario-equipos',
    features: [
      { icon: '📍', text: 'GPS Automático' },
      { icon: '✓', text: 'Validación en Tiempo Real' },
      { icon: '💾', text: 'Guardado Automático' },
    ],
  },
  'sistema-ascenso': {
    title: 'Sistema de ascenso',
    badge: 'EJECUCIÓN',
    description: 'Revise el sistema de ascenso y registre el estado de los componentes.',
    icon: Shield,
    iconBg: 'bg-indigo-500',
    route: '/sistema-ascenso',
    features: [
      { icon: '✓', text: 'Validación en Tiempo Real' },
      { icon: '💾', text: 'Guardado Automático' },
    ],
  },
  'grounding-system-test': {
    title: 'Prueba de puesta a tierra',
    badge: 'EJECUCIÓN',
    description: 'Registre mediciones del sistema de puesta a tierra y adjunte evidencia.',
    icon: Zap,
    iconBg: 'bg-purple-500',
    route: '/grounding-system-test',
    features: [
      { icon: '✓', text: 'Validación en Tiempo Real' },
      { icon: '💾', text: 'Guardado Automático' },
    ],
  },
}

export default function FormIntro() {
  const { formId } = useParams()
  const navigate = useNavigate()

  const cfg = useMemo(() => FORM_MAP[formId], [formId])
  if (!cfg) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-gray-600 font-semibold mb-4">Formulario no encontrado</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">Volver al inicio</button>
        </div>
      </div>
    )
  }

  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="px-6 pt-8 pb-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 ${cfg.iconBg} rounded-2xl flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{cfg.title}</h1>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-extrabold">{cfg.badge}</span>
            </div>
          </div>

          <p className="text-gray-500 mt-5 leading-relaxed">{cfg.description}</p>

          <div className="mt-6 space-y-3">
            {cfg.features.map((f, idx) => (
              <div key={idx} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="font-semibold text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(cfg.route)}
            className="mt-7 w-full bg-primary text-white rounded-2xl py-4 font-extrabold text-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            Iniciar Formulario <span className="text-xl">→</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 font-bold active:scale-[0.99]"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
