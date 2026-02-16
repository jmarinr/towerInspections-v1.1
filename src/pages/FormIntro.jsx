import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { useAppStore } from '../hooks/useAppStore'
import { Wrench, ClipboardList, Package, Shield, Activity, CheckCircle2 } from 'lucide-react'

const FORM_MAP = {
  inspeccion: {
    title: 'Inspección del sitio',
    description: 'Registre el checklist de inspección del sitio.',
    summary: ['Datos del sitio', 'Checklist por secciones', 'Evidencia fotográfica'],
    route: '/inspeccion',
    icon: ClipboardList,
  },
  mantenimiento: {
    title: 'Mantenimiento preventivo',
    description: 'Registre actividades de mantenimiento preventivo con fotos antes/después.',
    summary: ['Datos del sitio', 'Checklist de actividades', 'Fotos antes / después'],
    // Ruta canónica (App.jsx mantiene también alias /mantenimiento)
    route: '/mantenimiento-preventivo',
    icon: Wrench,
  },
  equipment: {
    title: 'Inventario de equipos',
    description: 'Documente inventario y evidencia fotográfica del sitio.',
    summary: ['Datos generales', 'Inventario / detalles', 'Fotos y observaciones'],
    route: '/inventario-equipos',
    icon: Package,
  },
  'sistema-ascenso': {
    title: 'Sistema de ascenso',
    description: 'Inspección de dispositivos y condiciones de seguridad.',
    summary: ['Secciones por componente', 'Campos técnicos', 'Fotos de evidencia'],
    route: '/sistema-ascenso',
    icon: Shield,
  },
  'grounding-system-test': {
    title: 'Grounding System Test',
    description: 'Registro de prueba de sistema de puesta a tierra.',
    summary: ['Datos generales', 'Mediciones', 'Cálculos automáticos'],
    route: '/grounding-system-test',
    icon: Activity,
  },
  'mantenimiento-ejecutado': {
    title: 'Mantenimiento ejecutado',
    description: 'Registro del mantenimiento preventivo ejecutado (según checklist).',
    summary: ['Datos de ejecución', 'Actividades', 'Fotos antes / después'],
    route: '/mantenimiento-ejecutado',
    icon: CheckCircle2,
  },
  // compatibilidad
  'pm-executed': {
    title: 'Mantenimiento ejecutado',
    description: 'Registro del mantenimiento preventivo ejecutado (según checklist).',
    summary: ['Datos de ejecución', 'Actividades', 'Fotos antes / después'],
    route: '/mantenimiento-ejecutado',
    icon: CheckCircle2,
  },
}

const pad2 = (n) => String(n).padStart(2, '0')
const getDateTime = () => {
  const d = new Date()
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  return { date, time, startedAt: d.toISOString() }
}

const getGeo = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocalización no soportada'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  })

export default function FormIntro() {
  const navigate = useNavigate()
  const { formId } = useParams()
  const [loading, setLoading] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)

  const cfg = useMemo(() => FORM_MAP[formId], [formId])

  const {
    setFormMeta,
    showToast,
    updateSiteInfo,
    updateMaintenanceField,
    updateEquipmentSiteField,
    updatePMExecutedField,
    setSafetyField,
    setGroundingField,
    resetFormDraft,
    formMeta,
    activeVisit,
  } = useAppStore()

  // Check if this form has previous data
  const normalizedId = useMemo(() => {
    if (!formId) return ''
    return formId === 'pm-executed' ? 'mantenimiento-ejecutado' : formId
  }, [formId])

  const hasPreviousData = useMemo(() => {
    if (!normalizedId) return false
    return !!formMeta?.[normalizedId]?.startedAt
  }, [formMeta, normalizedId])

  // Map normalizedId → resetFormDraft key
  const resetKeyMap = {
    'inspeccion': 'inspeccion',
    'mantenimiento': 'mantenimiento',
    'equipment': 'inventario',
    'mantenimiento-ejecutado': 'mantenimiento-ejecutado',
    'sistema-ascenso': 'safety-system',
    'grounding-system-test': 'puesta-tierra',
  }

  if (!cfg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Formulario" showBack onBack={() => navigate('/')} />
        <div className="max-w-xl mx-auto px-4 py-10 text-center text-gray-700">
          <div className="text-lg font-bold">Formulario no encontrado</div>
          <button className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Called when user taps "Iniciar Formulario"
  const handleStart = () => {
    if (hasPreviousData) {
      setShowResumeDialog(true)
      return
    }
    start()
  }

  // Continue with existing data
  const handleResume = () => {
    setShowResumeDialog(false)
    navigate(cfg.route)
  }

  // Reset and start fresh
  const handleRestart = () => {
    setShowResumeDialog(false)
    const resetKey = resetKeyMap[normalizedId]
    if (resetKey) resetFormDraft(resetKey)
    start()
  }

  const start = async () => {
    if (loading) return
    setLoading(true)

    const base = getDateTime()

    // 1) Guardar meta base (fecha/hora) inmediatamente
    setFormMeta(normalizedId, { ...base, lat: null, lng: null })

    // 2) Copiar fecha/hora a los "campos" existentes del formulario (sin mostrarlos)
    try {
      if (normalizedId === 'inspeccion') {
        updateSiteInfo('fecha', base.date)
        updateSiteInfo('hora', base.time)
      }
      if (normalizedId === 'mantenimiento') {
        updateMaintenanceField('fechaInicio', base.date)
        updateMaintenanceField('horaEntrada', base.time)
      }
      if (normalizedId === 'equipment') {
        updateEquipmentSiteField('fechaInicio', base.date)
      }
      if (normalizedId === 'mantenimiento-ejecutado') {
        updatePMExecutedField('fecha', base.date)
        updatePMExecutedField('hora', base.time)
      }
      if (normalizedId === 'sistema-ascenso') {
        setSafetyField('datos', 'fechaInicio', base.date)
      }
      if (normalizedId === 'grounding-system-test') {
        setGroundingField('datos', 'fechaInicio', base.date)
      }
    } catch (e) {
      // no bloquear
    }

    // 2b) Auto-fill site data from active order
    if (activeVisit) {
      const sId = activeVisit.site_id || ''
      const sName = activeVisit.site_name || ''
      try {
        if (normalizedId === 'inspeccion') {
          updateSiteInfo('idSitio', sId)
          updateSiteInfo('nombreSitio', sName)
        }
        if (normalizedId === 'mantenimiento') {
          updateMaintenanceField('idSitio', sId)
          updateMaintenanceField('nombreSitio', sName)
        }
        if (normalizedId === 'equipment') {
          updateEquipmentSiteField('idSitio', sId)
          updateEquipmentSiteField('nombreSitio', sName)
        }
        if (normalizedId === 'mantenimiento-ejecutado') {
          updatePMExecutedField('idSitio', sId)
          updatePMExecutedField('nombreSitio', sName)
        }
        if (normalizedId === 'sistema-ascenso') {
          setSafetyField('datos', 'idSitio', sId)
          setSafetyField('datos', 'nombreSitio', sName)
        }
        if (normalizedId === 'grounding-system-test') {
          setGroundingField('datos', 'idSitio', sId)
          setGroundingField('datos', 'nombreSitio', sName)
        }
      } catch (e) {
        // no bloquear
      }
    }

    // 3) Capturar GPS (si el usuario permite)
    getGeo()
      .then((pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setFormMeta(normalizedId, { ...base, lat, lng })

        const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        try {
          if (normalizedId === 'inspeccion') updateSiteInfo('coordenadas', coordsStr)
          if (normalizedId === 'mantenimiento') updateMaintenanceField('coordenadas', coordsStr)
          if (normalizedId === 'mantenimiento-ejecutado') updatePMExecutedField('coordenadas', coordsStr)
          if (normalizedId === 'equipment') {
            updateEquipmentSiteField('latitud', String(lat))
            updateEquipmentSiteField('longitud', String(lng))
          }
          if (normalizedId === 'sistema-ascenso') {
            setSafetyField('datos', 'latitud', String(lat))
            setSafetyField('datos', 'longitud', String(lng))
          }
          if (normalizedId === 'grounding-system-test') {
            setGroundingField('datos', 'latitud', String(lat))
            setGroundingField('datos', 'longitud', String(lng))
          }
        } catch (e) {
          // no bloquear
        }
      })
      .catch(() => {
        showToast('No se pudo capturar GPS automáticamente (permiso/ubicación). Puedes continuar.', 'warning')
      })
      .finally(() => setLoading(false))

    // 4) Navegar sin esperar al GPS
    navigate(cfg.route)
  }

  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title={cfg.title} showBack onBack={() => navigate('/')} />

      <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-extrabold text-gray-900">{cfg.title}</div>
              <div className="text-sm text-gray-600 mt-1">{cfg.description}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-bold text-gray-900">Resumen</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {cfg.summary.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-[3px] h-4 w-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="mt-6 w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold shadow-sm active:scale-[0.99] disabled:opacity-70"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? 'Iniciando…' : hasPreviousData ? 'Continuar / Reiniciar →' : 'Iniciar Formulario →'}
          </button>
        </div>
      </div>

      {/* Resume Dialog */}
      {showResumeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900 text-center">
                Datos previos encontrados
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                Este formulario tiene datos ingresados previamente.
                ¿Desea continuar donde se quedó o iniciar desde cero?
              </p>

              {formMeta?.[normalizedId]?.startedAt && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Iniciado</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(formMeta[normalizedId].startedAt).toLocaleDateString('es', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-4 space-y-2">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold active:scale-[0.98] transition-all"
              >
                Continuar con datos previos
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 rounded-xl border-2 border-red-300 bg-red-50 text-red-600 text-sm font-bold active:scale-[0.98] transition-all"
              >
                Reiniciar formulario
              </button>
              <button
                onClick={() => setShowResumeDialog(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-400 active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
