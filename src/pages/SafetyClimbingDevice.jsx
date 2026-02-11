import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AppHeader from '../components/layout/AppHeader'
import FormMetaBar from '../components/layout/FormMetaBar'
import DynamicForm from '../components/forms/DynamicForm'
import useAppStore from '../hooks/useAppStore'
import { safetyClimbingSections, safetySectionFields } from '../data/safetyClimbingDeviceConfig'

function isFilled(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function getSectionCompletion(sectionId, sectionData) {
  const fields = safetySectionFields?.[sectionId] ?? []
  const required = fields.filter((f) => f?.required)
  if (!required.length) return true
  const data = sectionData ?? {}
  return required.every((f) => isFilled(data[f.id]))
}

export default function SafetyClimbingDevice() {
  const navigate = useNavigate()
  const { sectionId } = useParams()

  const safetyData = useAppStore((s) => s.draft?.safetyClimbingData || {})
  const setSafetyField = useAppStore((s) => s.setSafetyField)
  const triggerAutosave = useAppStore((s) => s.triggerAutosave)
  const resetFormDraft = useAppStore((s) => s.resetFormDraft)
  const finalizeForm = useAppStore((s) => s.finalizeForm)
  const showToast = useAppStore((s) => s.showToast)

  const currentSection = useMemo(() => {
    if (!sectionId) return null
    return safetyClimbingSections.find((s) => s.id === sectionId) || null
  }, [sectionId])

  const completedCount = useMemo(() => {
    return safetyClimbingSections.filter((s) => getSectionCompletion(s.id, safetyData?.[s.id])).length
  }, [safetyData])

  const progressPct = useMemo(() => {
    if (!safetyClimbingSections.length) return 0
    return Math.round((completedCount / safetyClimbingSections.length) * 100)
  }, [completedCount])

  const handleFieldChange = (fieldId, value) => {
    if (!sectionId) return
    setSafetyField(sectionId, fieldId, value)
    triggerAutosave('safety-system')
  }

  const handleReset = () => {
    resetFormDraft('safety-system')
    showToast('Formulario reiniciado.', 'success')
    navigate('/sistema-ascenso')
  }

  const handleFinalize = async () => {
    try {
      // Validación mínima: requeridos por sección
      const incomplete = safetyClimbingSections.filter(
        (s) => !getSectionCompletion(s.id, safetyData?.[s.id])
      )

      if (incomplete.length) {
        showToast('Faltan campos requeridos. Completa las secciones pendientes.', 'error')
        return
      }

      await finalizeForm('safety-system')
      showToast('¡Formulario enviado y cerrado!', 'success')
      navigate('/')
    } catch (e) {
      console.error(e)
      showToast('No se pudo enviar. Revisa tu conexión e intenta de nuevo.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Sistema de ascenso" />

      <FormMetaBar
        title="Sistema de ascenso"
        subtitle="Checklist de seguridad"
        progress={progressPct}
      />

      {/* Vista de una sección */}
      {sectionId && currentSection ? (
        <div className="max-w-5xl mx-auto px-4 pb-28 pt-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              type="button"
              className="text-sm text-gray-700 underline"
              onClick={() => navigate('/sistema-ascenso')}
            >
              Volver a secciones
            </button>

            <button
              type="button"
              className="text-sm text-red-600 underline"
              onClick={handleReset}
            >
              Reiniciar
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{currentSection.title}</h2>
            {currentSection.description ? (
              <p className="text-sm text-gray-600 mb-4">{currentSection.description}</p>
            ) : null}

            <DynamicForm
              formCode="safety-system"
              fields={safetySectionFields?.[sectionId] ?? []}
              data={safetyData?.[sectionId] ?? {}}
              onFieldChange={handleFieldChange}
            />
          </div>
        </div>
      ) : (
        /* Vista lista de secciones */
        <div className="max-w-5xl mx-auto px-4 pb-28 pt-4">
          <div className="grid gap-3">
            {safetyClimbingSections.map((s) => {
              const done = getSectionCompletion(s.id, safetyData?.[s.id])
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/sistema-ascenso/${s.id}`)}
                  className={`w-full text-left bg-white rounded-2xl shadow p-4 border ${
                    done ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{s.title}</div>
                      {s.description ? (
                        <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                      ) : null}
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {done ? 'Completo' : 'Pendiente'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-red-200 text-red-700 bg-white"
            >
              Reiniciar formulario
            </button>

            <button
              type="button"
              onClick={handleFinalize}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-blue-600 text-white"
            >
              Enviar y cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
