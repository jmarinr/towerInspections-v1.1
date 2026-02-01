import { useMemo } from 'react'
import AppHeader from '../components/layout/AppHeader'
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
    showToast 
  } = useAppStore()

  // Asegurar que tenemos datos válidos con valores por defecto
  const currentStep = maintenanceData?.currentStep || 1
  const completedSteps = maintenanceData?.completedSteps || []
  const formData = maintenanceData?.formData || {}
  const checklistData = maintenanceData?.checklistData || {}
  const photos = maintenanceData?.photos || {}
  
  const currentStepData = getStepById(currentStep)

  const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

  const shouldShow = (item) => {
    if (!item?.showIf) return true
    const { field, value, values } = item.showIf
    const currentValue = formData[field]
    if (values) return values.includes(currentValue)
    return currentValue === value
  }

  const validateField = (field, value) => {
    if (!field?.required && isBlank(value)) return true
    if (field?.required && isBlank(value)) return false
    switch (field.type) {
      case 'number': return Number.isFinite(Number(String(value)))
      case 'date': return /^\d{4}-\d{2}-\d{2}$/.test(String(value))
      case 'time': return /^\d{2}:\d{2}$/.test(String(value))
      case 'select': return !isBlank(value)
      case 'toggle':
      case 'status': return !isBlank(value)
      case 'gps': {
        const parts = String(value).split(',').map(s => s.trim())
        if (parts.length !== 2) return false
        const lat = Number(parts[0]); const lng = Number(parts[1])
        return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      }
      case 'photo': return !isBlank(value)
      default: return true
    }
  }

  const isFormStepValid = useMemo(() => {
    if (!currentStepData || currentStepData.type !== 'form') return true
    const fields = currentStepData.fields || []
    for (const f of fields) {
      if (!shouldShow(f)) continue
      const value = formData[f.id]
      if (!validateField(f, value)) return false
    }
    return true
  }, [currentStepData, formData])

  const isLastStep = currentStep === totalSteps
  const totalSteps = maintenanceFormConfig.steps.length

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
    if (!isFormStepValid) {
      showToast('Completa los campos requeridos antes de continuar', 'warning')
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
    if (stats.pendingPhotos > 0) {
      showToast(`Faltan fotos en ${stats.pendingPhotos} ítem(s)`, 'warning')
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
        showPrev={currentStep > 1} prevDisabled={currentStep <= 1} nextDisabled={!isFormStepValid} 
        nextLabel={isLastStep ? 'Finalizar' : 'Siguiente'} 
      />
    </div>
  )
}
