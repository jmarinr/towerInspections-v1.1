import { useMemo } from 'react'
import AppHeader from '../components/layout/AppHeader'
import FormMetaBar from '../components/layout/FormMetaBar'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import CategoryTabs from '../components/layout/CategoryTabs'
import StepIndicator from '../components/layout/StepIndicator'
import DynamicForm from '../components/forms/DynamicForm'
import InspectionChecklist from '../components/forms/InspectionChecklist'
import { useAppStore } from '../hooks/useAppStore'
import { maintenanceFormConfig, getStepById } from '../data/maintenanceFormConfig'

export default function MantenimientoPreventivo() {
  const { 
    maintenanceData, 
    updateMaintenanceField, 
    updateChecklistItem,
    updateChecklistPhoto,
    setMaintenanceStep,
    completeMaintenanceStep,
    showToast,
    formMeta
  } = useAppStore()

  // Asegurar que tenemos datos válidos con valores por defecto
  // Importante: normalizar a número (evita que "1" rompa getStepById)
  const currentStep = Number(maintenanceData?.currentStep) || 1
  const completedSteps = maintenanceData?.completedSteps || []
  const formData = maintenanceData?.formData || {}
  const checklistData = maintenanceData?.checklistData || {}
  const photos = maintenanceData?.photos || {}
  
  const currentStepData = getStepById(currentStep) || getStepById(1)
  const totalSteps = maintenanceFormConfig.steps.length

  const validateFieldByType = (field, value) => {
    const v = value ?? ''
    const isEmpty = String(v).trim().length === 0
    if (!field.required && isEmpty) return true
    if (field.required && isEmpty) return false

    switch (field.type) {
      case 'number':
        return Number.isFinite(Number(v))
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(String(v))
      case 'time':
        return /^\d{2}:\d{2}$/.test(String(v))
      case 'photo':
        // Puede venir como string (dataUrl/blob/url) o como objeto (metadatos de subida a Supabase)
        if (!v) return false
        if (typeof v === 'string') {
          const s = v.trim()
          return s.startsWith('data:image') || s.startsWith('blob:') || s.startsWith('http')
        }
        if (typeof v === 'object') {
          return Boolean(v.dataUrl || v.publicUrl || v.url || v.path || v.key || v.storageKey)
        }
        return false
      case 'select':
        return String(v).trim().length > 0
      default:
        return true
    }
  }

  const getMissingForStep = (stepCfg) => {
    if (!stepCfg) return []
    if (stepCfg.type === 'form') {
      const fields = stepCfg.fields || []
      return fields
        .filter(f => f.required)
        .filter(f => {
          // Condicional
          if (f.showIf) {
            const { field, value, values } = f.showIf
            const currentValue = formData[field]
            if (values && !values.includes(currentValue)) return false
            if (value && currentValue !== value) return false
          }
          return !validateFieldByType(f, formData[f.id])
        })
        .map(f => f.label)
    }

    if (stepCfg.type === 'checklist') {
      const items = stepCfg.items || []
      const missing = []
      items.forEach(item => {
        // Condicional
        if (item.showIf) {
          const { field, value, values } = item.showIf
          const currentValue = formData[field]
          if (values && !values.includes(currentValue)) return
          if (value && currentValue !== value) return
        }
        const st = checklistData[item.id]?.status
        if (!st) missing.push(item.title || item.label || item.id)
        // Si es yes, requiere fotos before/after
        if (st === 'yes') {
          const hasBefore = !!photos[`${item.id}-before`]
          const hasAfter = !!photos[`${item.id}-after`]
          if (!hasBefore || !hasAfter) missing.push(`${item.title || item.id} (fotos)`)
        }
      })
      return missing
    }

    return []
  }

  // Calcular progreso general
  const { progress, stats } = useMemo(() => {
    let totalItems = 0
    let completedItems = 0
    let pendingPhotos = 0

    maintenanceFormConfig.steps.forEach(step => {
      if (step.type === 'checklist' && step.items) {
        step.items.forEach(item => {
          // Verificar si el item debería mostrarse
          if (item.showIf) {
            const { field, value, values } = item.showIf
            const currentValue = formData[field]
            if (values && !values.includes(currentValue)) return
            if (value && currentValue !== value) return
          }
          
          totalItems++
          const itemData = checklistData[item.id]
          if (itemData?.status) {
            if (itemData.status === 'na') {
              completedItems++
            } else {
              const hasBeforePhoto = photos[`${item.id}-before`]
              const hasAfterPhoto = photos[`${item.id}-after`]
              if (hasBeforePhoto && hasAfterPhoto) {
                completedItems++
              } else {
                pendingPhotos++
              }
            }
          }
        })
      }
    })

    const progressValue = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    return { 
      progress: progressValue, 
      stats: { 
        completedItems, 
        totalItems, 
        pendingPhotos,
        currentStep,
        totalSteps
      }
    }
  }, [checklistData, photos, formData, currentStep, totalSteps])

  // Navegación simplificada
  const handlePrev = () => {
    if (currentStep > 1) {
      setMaintenanceStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    const stepCfg = currentStepData
    const missing = getMissingForStep(stepCfg)

    if (missing.length) {
      const preview = missing.slice(0, 8).join(', ')
      const suffix = missing.length > 8 ? ` (+${missing.length - 8})` : ''
      showToast(`Pendientes para continuar: ${preview}${suffix}`, 'error')
      return
    }

    // Marcar step actual como completado
    completeMaintenanceStep(currentStep)

    if (currentStep < totalSteps) {
      setMaintenanceStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    // Validar todo el formulario antes de finalizar
    const allMissing = []
    maintenanceFormConfig.steps.forEach(stepCfg => {
      const miss = getMissingForStep(stepCfg)
      miss.forEach(m => allMissing.push(`${stepCfg.title}: ${m}`))
    })

    if (allMissing.length) {
      const preview = allMissing.slice(0, 10).join(' | ')
      const suffix = allMissing.length > 10 ? ` (+${allMissing.length - 10})` : ''
      showToast(`Pendientes para finalizar: ${preview}${suffix}`, 'error')
      return
    }

    showToast('¡Mantenimiento completado!', 'success')
  }

  const handleStepChange = (stepId) => {
    setMaintenanceStep(stepId)
  }

  if (!currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-gray-500 mb-4">Cargando formulario...</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />
      
      <AppHeader 
        title="Mantenimiento Preventivo" 
        subtitle={formData.idSitio || 'Nuevo'} 
        badge="En progreso" 
        progress={progress} 
        onMenuClick={() => showToast('Menú de opciones')} 
      />
      
      <CategoryTabs 
        currentStep={currentStep}
        completedSteps={completedSteps}
        onCategoryChange={handleStepChange}
      />

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={handleStepChange}
      />

      <main className="flex-1 px-4 pb-44 pt-4 overflow-x-hidden overflow-y-auto">
        <FormMetaBar meta={formMeta?.mantenimiento} />
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-1">{currentStepData.icon}</div>
              <h2 className="text-xl font-extrabold text-gray-900">{currentStepData.title}</h2>
              <p className="text-sm text-gray-500">{currentStepData.subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {currentStep}/{totalSteps}
              </div>
              <div className="text-[10px] text-gray-500">paso</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          {currentStepData.type === 'form' ? (
            <DynamicForm
              step={currentStepData}
              formData={formData}
              onFieldChange={updateMaintenanceField}
              formCode="preventive-maintenance"
            />
          ) : (
            <InspectionChecklist
              step={currentStepData}
              checklistData={checklistData}
              photos={photos}
              formData={formData}
              onItemChange={updateChecklistItem}
              onPhotoChange={updateChecklistPhoto}
            />
          )}
        </div>
      </main>

      <BottomNav 
        onPrev={handlePrev} 
        onNext={handleNext} 
        showPrev={currentStep > 1} 
        nextLabel={currentStep === totalSteps ? 'Finalizar' : 'Siguiente'} 
      />
    </div>
  )
}
