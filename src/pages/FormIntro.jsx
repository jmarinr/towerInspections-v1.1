import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardCheck, Wrench, ListChecks, Shield, Zap } from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'

const introConfig = {
  inspeccion: {
    title: 'Inspección de Sitio',
    badge: 'EJECUCIÓN',
    icon: ClipboardCheck,
    description: 'Registra la inspección del sitio con fotografías y validación automática para asegurar calidad y consistencia.',
    features: [
      { icon: '📷', label: 'Fotos Antes/Después' },
      { icon: '📍', label: 'GPS Automático' },
      { icon: '✓', label: 'Validación en Tiempo Real' },
      { icon: '💾', label: 'Guardado Automático' },
    ],
    startPath: '/inspeccion',
    buttonText: 'Iniciar Formulario',
  },
  mantenimiento: {
    title: 'Mantenimiento Preventivo',
    badge: 'EJECUCIÓN',
    icon: Wrench,
    description: 'Registre los trabajos de mantenimiento preventivo ejecutados en el sitio, incluyendo fotografías antes y después de cada actividad realizada con validación automática.',
    features: [
      { icon: '📷', label: 'Fotos Antes/Después' },
      { icon: '📍', label: 'GPS Automático' },
      { icon: '✓', label: 'Validación en Tiempo Real' },
      { icon: '💾', label: 'Guardado Automático' },
    ],
    startPath: '/mantenimiento',
    buttonText: 'Iniciar Formulario',
  },
  inventario: {
    title: 'Inventario de Equipos',
    badge: 'EJECUCIÓN',
    icon: ListChecks,
    description: 'Captura el inventario de equipos por torre y por piso, con croquis y distribución para documentación completa del sitio.',
    features: [
      { icon: '🗼', label: 'Inventario por Torre' },
      { icon: '🏢', label: 'Inventario por Piso' },
      { icon: '🗺️', label: 'Croquis y Planos' },
      { icon: '💾', label: 'Guardado Automático' },
    ],
    startPath: '/inventario-equipos',
    buttonText: 'Iniciar Formulario',
  },
  ascenso: {
    title: 'Sistema de Ascenso',
    badge: 'EJECUCIÓN',
    icon: Shield,
    description: 'Evalúa el sistema de ascenso y componentes de seguridad con checklist por secciones y soporte visual.',
    features: [
      { icon: '🧷', label: 'Secciones Guiadas' },
      { icon: '📷', label: 'Evidencia Fotográfica' },
      { icon: '✓', label: 'Validación en Tiempo Real' },
      { icon: '💾', label: 'Guardado Automático' },
    ],
    startPath: '/sistema-ascenso',
    buttonText: 'Iniciar Formulario',
  },
  puesta_tierra: {
    title: 'Sistema de Puesta a Tierra',
    badge: 'EJECUCIÓN',
    icon: Zap,
    description: 'Registra mediciones y verificación del sistema de puesta a tierra con secciones organizadas para una captura rápida en campo.',
    features: [
      { icon: '🧪', label: 'Mediciones y Datos' },
      { icon: '📷', label: 'Evidencia Fotográfica' },
      { icon: '✓', label: 'Validación en Tiempo Real' },
      { icon: '💾', label: 'Guardado Automático' },
    ],
    startPath: '/grounding-system-test',
    buttonText: 'Iniciar Formulario',
  },
}

export default function FormIntro() {
  const navigate = useNavigate()
  const { formId } = useParams()

  const cfg = useMemo(() => introConfig[formId] || introConfig.mantenimiento, [formId])
  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon size={26} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-extrabold text-gray-900">{cfg.title}</div>
              <div className="inline-flex mt-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-extrabold tracking-wide">
                {cfg.badge}
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 text-gray-600 leading-relaxed">
            {cfg.description}
          </div>

          <div className="px-6 pb-6 space-y-3">
            {cfg.features.map((f, idx) => (
              <div key={idx} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <span className="text-lg">{f.icon}</span>
                </div>
                <div className="font-semibold text-gray-800">{f.label}</div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-7">
            <button
              type="button"
              onClick={() => navigate(cfg.startPath)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-extrabold shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {cfg.buttonText} <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav showPrev={false} showNext={false} />
    </div>
  )
}