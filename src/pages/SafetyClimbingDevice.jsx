import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import BottomNav from '../components/layout/BottomNav'
import FormMetaBar from '../components/layout/FormMetaBar'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import DynamicForm from '../components/forms/DynamicForm'
import { safetyClimbingSections, safetySectionFields } from '../data/safetyClimbingDeviceConfig'
import { useAppStore } from '../hooks/useAppStore'

import safety1 from '../assets/safety/safety_1.png'
import safety2 from '../assets/safety/safety_2.png'
import safety3 from '../assets/safety/safety_3.png'

export default function SafetyClimbingDevice() {
  const navigate = useNavigate()
  const { sectionId } = useParams()

  const safetyData = useAppStore(s => s.safetyClimbingData)
  const setSafetyField = useAppStore(s => s.setSafetyField)
  const lastSavedAt = useAppStore(s => s.lastSavedAt)
  const showToast = useAppStore(s => s.showToast)
  const formMeta = useAppStore(s => s.formMeta)

  const currentSection = useMemo(() => safetyClimbingSections.find(s => s.id === sectionId), [sectionId])

  const openSection = (id) => navigate(`/sistema-ascenso/${id}`)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Sistema de ascenso" showBack={!!sectionId} onBack={() => navigate('/sistema-ascenso')} />

      <div className="max-w-5xl mx-auto px-4 pb-28 pt-4">
        <AutosaveIndicator lastSavedAt={lastSavedAt} />
        <FormMetaBar meta={formMeta?.['sistema-ascenso']} />

        {!sectionId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyClimbingSections.map((s) => (
              <button
                key={s.id}
                className="text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition"
                onClick={() => openSection(s.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {s.items} ítems · {s.steps} paso
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sectionId && currentSection && (
          <div className="space-y-4">
            {/* Referencias (solo en la sección correspondiente) */}
            {sectionId === 'prensacables' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-extrabold text-gray-900">Guía de referencia</div>
                  <div className="text-xs text-gray-500 mt-0.5">Úsala como apoyo visual durante la inspección.</div>
                </div>
                <div className="p-3 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[safety1, safety2, safety3].map((src, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <img src={src} alt={`Referencia ${idx + 1}`} className="w-full h-auto block" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-extrabold text-gray-900">{currentSection.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{currentSection.description}</div>
              </div>

              <div className="p-4">
                <DynamicForm
                  fields={safetySectionFields[sectionId] || []}
                  data={safetyData?.[sectionId] || {}}
                  onChange={(fieldId, value) => setSafetyField(sectionId, fieldId, value)}
                />
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white font-semibold shadow-sm active:scale-[0.99]"
                  onClick={() => {
                    const fields = safetySectionFields[sectionId] || []
                    const data = safetyData?.[sectionId] || {}
                    const missing = fields
                      .filter(f => f.required)
                      .filter(f => {
                        const v = data[f.id]
                        const isEmpty = String(v ?? '').trim().length === 0
                        if (isEmpty) return true
                        if (f.type === 'number') return !Number.isFinite(Number(v))
                        if (f.type === 'photo') return !String(v).startsWith('data:image')
                        if (f.type === 'date') return !/^\d{4}-\d{2}-\d{2}$/.test(String(v))
                        if (f.type === 'time') return !/^\d{2}:\d{2}$/.test(String(v))
                        return false
                      })
                      .map(f => f.label)

                    if (missing.length) {
                      showToast(`Campos requeridos pendientes: ${missing.join(', ')}`, 'error')
                      return
                    }
                    navigate('/sistema-ascenso')
                  }}
                >
                  Guardar y volver al menú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
