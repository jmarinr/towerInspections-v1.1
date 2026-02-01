import { useMemo } from 'react'
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

  const currentStepId = step || inspectionSections[0].id
  const currentStepIndex = inspectionSections.findIndex(s => s.id === currentStepId)
  const currentSection = inspectionSections[currentStepIndex]

  const progress = useMemo(() => {
    const total = getTotalInspectionItems()
    const answered = Object.keys(inspectionData.items).filter(k => inspectionData.items[k]?.status).length
    return Math.round((answered / total) * 100)
  }, [inspectionData.items])

  const completedSteps = useMemo(() => {
    return inspectionSections.filter(section => {
      if (section.type === 'form') {
        const { proveedor, idSitio, nombreSitio } = inspectionData.siteInfo
        return proveedor && idSitio && nombreSitio
      }
      return section.items?.every(item => inspectionData.items[item.id]?.status)
    }).map(s => s.id)
  }, [inspectionData])

  const goToStep = (stepId) => navigate(`/inspeccion-sitio/${stepId}`)
  const goToPrev = () => currentStepIndex > 0 && goToStep(inspectionSections[currentStepIndex - 1].id)
  const goToNext = () => {
    if (currentStepIndex < inspectionSections.length - 1) goToStep(inspectionSections[currentStepIndex + 1].id)
    else showToast('¡Inspección completada!', 'success')
  }

  const steps = inspectionSections.map(s => ({ id: s.id, title: s.title }))

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AutosaveIndicator />
      <AppHeader title="Inspección de Sitio" subtitle={inspectionData.siteInfo.idSitio || 'Nuevo'} badge="En progreso" progress={progress} onMenuClick={() => showToast('Menú de opciones')} />
      <StepPills steps={steps} currentStep={currentStepId} completedSteps={completedSteps} onStepClick={goToStep} />
      <main className="flex-1 px-4 pb-44 pt-4 overflow-x-hidden">
        <div className="mb-4">
          <div className="text-3xl mb-2">{currentSection.icon}</div>
          <h2 className="text-xl font-extrabold text-gray-900">{currentSection.title}</h2>
          <p className="text-sm text-gray-500">{currentSection.description}</p>
        </div>
        {currentSection.type === 'form' ? <SiteInfoForm type="inspection" /> : (
          <div>{currentSection.items?.map((item, idx) => <InspectionItem key={item.id} item={item} index={idx} />)}</div>
        )}
      </main>
      <BottomNav onPrev={goToPrev} onNext={goToNext} showPrev={currentStepIndex > 0} prevDisabled={currentStepIndex === 0} nextDisabled={!isCurrentCompleted} nextLabel={isLastStep ? 'Finalizar' : 'Siguiente'} />
    </div>
  )
}
