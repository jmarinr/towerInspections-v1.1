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

  const { currentStep, completedSteps, formData, checklistData, photos } = maintenanceData
  const currentStepData = getStepById(currentStep)
  const totalSteps = maintenanceFormConfig.steps.length

  // Calcular progreso general
  const { progress, stats } = useMemo(() => {
    let totalItems = 0
    let completedItems = 0
    let pendingPhotos = 0

    maintenanceFormConfig.steps.forEach(step => {
      if (step.type === 'checklist') {
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

  // Navegación
  const handlePrev = () => {
    if (currentStep > 1) {
      // Buscar step anterior válido
      let prevStep = currentStep - 1
      let prevStepData = getStepById(prevStep)
      
      while (prevStepData?.showIf && prevStep > 0) {
        const { field, value } = prevStepData.showIf
        if (formData[field] !== value) {
          prevStep--
          prevStepData = getStepById(prevStep)
        } else {
          break
        }
      }
      
      if (prevStep >= 1) {
        setMaintenanceStep(prevStep)
      }
    }
  }

  const handleNext = () => {
    // Marcar step actual como completado
    if (!completedSteps.includes(currentStep)) {
      completeMaintenanceStep(currentStep)
    }

    if (currentStep < totalSteps) {
      // Buscar siguiente step válido
      let nextStep = currentStep + 1
      let nextStepData = getStepById(nextStep)
      
      while (nextStepData?.showIf && nextStep <= totalSteps) {
        const { field, value } = nextStepData.showIf
        if (formData[field] !== value) {
          nextStep++
          nextStepData = getStepById(nextStep)
        } else {
          break
        }
      }

      if (nextStep <= totalSteps) {
        setMaintenanceStep(nextStep)
      } else {
        handleFinish()
      }
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
    return <div className="min-h-screen flex items-center justify-center">Error: Step no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />
      
      {/* Header */}
      <AppHeader 
        title="Mantenimiento Preventivo" 
        subtitle={formData.idSitio || 'Nuevo'} 
        badge="En progreso" 
        progress={progress} 
        onMenuClick={() => showToast('Menú de opciones')} 
      />
      
      {/* Category Tabs */}
      <CategoryTabs 
        currentStep={currentStep}
        completedSteps={completedSteps}
        onCategoryChange={handleStepChange}
      />

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={handleStepChange}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 pb-44 pt-4 overflow-x-hidden overflow-y-auto">
        {/* Step Header */}
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

        {/* Form or Checklist Content */}
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

      {/* Bottom Navigation */}
      <BottomNav 
        onPrev={handlePrev} 
        onNext={handleNext} 
        showPrev={currentStep > 1} 
        nextLabel={currentStep === totalSteps ? 'Finalizar' : 'Siguiente'} 
      />
    </div>
  )
}
