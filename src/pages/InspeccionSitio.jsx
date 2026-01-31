import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import StepPills from '../components/layout/StepPills'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import SiteInfoForm from '../components/forms/SiteInfoForm'
import InspectionItem from '../components/forms/InspectionItem'
import { inspectionSections, getTotalInspectionItems } from '../data/inspectionItems'
import { useAppStore } from '../hooks/useAppStore'

export default function InspeccionSitio() {
  const navigate = useNavigate()
  const { step } = useParams()
  const { inspectionData, showToast } = useAppStore()

  // Current step (default to first section)
  const currentStepId = step || inspectionSections[0].id
  const currentStepIndex = inspectionSections.findIndex(s => s.id === currentStepId)
  const currentSection = inspectionSections[currentStepIndex]

  // Calculate progress
  const progress = useMemo(() => {
    const totalItems = getTotalInspectionItems()
    const answeredItems = Object.keys(inspectionData.items).filter(
      key => inspectionData.items[key]?.status
    ).length
    return Math.round((answeredItems / totalItems) * 100)
  }, [inspectionData.items])

  // Get completed steps
  const completedSteps = useMemo(() => {
    return inspectionSections.filter(section => {
      if (section.type === 'form') {
        // Check if required fields are filled
        const { proveedor, idSitio, nombreSitio, fecha, hora } = inspectionData.siteInfo
        return proveedor && idSitio && nombreSitio && fecha && hora
      }
      if (section.items) {
        // Check if all items in section are answered
        return section.items.every(item => inspectionData.items[item.id]?.status)
      }
      return false
    }).map(s => s.id)
  }, [inspectionData])

  // Navigation
  const goToStep = (stepId) => {
    navigate(`/inspeccion-sitio/${stepId}`)
  }

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      goToStep(inspectionSections[currentStepIndex - 1].id)
    }
  }

  const goToNext = () => {
    if (currentStepIndex < inspectionSections.length - 1) {
      goToStep(inspectionSections[currentStepIndex + 1].id)
    } else {
      // Last step - generate report
      showToast('¡Inspección completada!', 'success')
    }
  }

  // Steps for pills
  const steps = inspectionSections.map(s => ({
    id: s.id,
    title: s.icon + ' ' + s.title,
    shortTitle: s.title,
  }))

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />

      <AppHeader
        title="Inspección de Sitio"
        subtitle={inspectionData.siteInfo.idSitio || 'Nuevo'}
        badge="En progreso"
        progress={progress}
        onMenuClick={() => showToast('Opciones: Guardar, Exportar, Ayuda')}
      />

      <StepPills
        steps={steps}
        currentStep={currentStepId}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 pb-44 pt-4">
        {/* Section Header */}
        <div className="mb-4">
          <div className="text-3xl mb-2">{currentSection.icon}</div>
          <h2 className="text-xl font-extrabold text-gray-900">{currentSection.title}</h2>
          <p className="text-sm text-gray-500">{currentSection.description}</p>
        </div>

        {/* Section Content */}
        {currentSection.type === 'form' ? (
          <SiteInfoForm type="inspection" />
        ) : (
          <div>
            {currentSection.items?.map((item, index) => (
              <InspectionItem key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </main>

      <BottomNav
        onPrev={goToPrev}
        onNext={goToNext}
        showPrev={currentStepIndex > 0}
        nextLabel={currentStepIndex === inspectionSections.length - 1 ? 'Finalizar' : 'Siguiente'}
      />
    </div>
  )
}
