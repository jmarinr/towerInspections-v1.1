import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import StepPills from '../components/layout/StepPills'
import FormMetaBar from '../components/layout/FormMetaBar'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'

import { equipmentInventoryV2Steps, getEquipmentV2StepIndex } from '../data/equipmentInventoryV2Config'
import { useAppStore } from '../hooks/useAppStore'

import EquipmentInventorySiteInfoForm from '../components/forms/EquipmentInventorySiteInfoForm'
import TowerInventoryTableV2 from '../components/forms/TowerInventoryTableV2'
import FloorInventoryClientsV2 from '../components/forms/FloorInventoryClientsV2'
import CarrierSection from '../components/forms/CarrierSection'

export default function InventarioEquiposV2() {
  const navigate = useNavigate()
  const { step } = useParams()

  const { showAutosaveIndicator, showToast, formMeta, equipmentInventoryV2Data, updateEquipmentV2SiteField, resetFormDraft, finalizeForm } = useAppStore()

  const currentStepId = useMemo(() => {
    if (step && equipmentInventoryV2Steps.some(s => s.id === step)) return step
    return equipmentInventoryV2Steps[0].id
  }, [step])

  const stepIndex = getEquipmentV2StepIndex(currentStepId)
  const currentStep = equipmentInventoryV2Steps[stepIndex] || equipmentInventoryV2Steps[0]
  const totalSteps = equipmentInventoryV2Steps.length

  const navigateToStep = (id) => navigate(`/inventario-equipos-v2/${id}`, { replace: true })

  const handlePrev = () => {
    if (stepIndex > 0) navigateToStep(equipmentInventoryV2Steps[stepIndex - 1].id)
  }

  const handleNext = async () => {
    if (stepIndex < totalSteps - 1) {
      navigateToStep(equipmentInventoryV2Steps[stepIndex + 1].id)
    } else {
      try {
        await finalizeForm('inventario-v2')
        showToast('¡Inventario v2 enviado!', 'success')
        navigate('/')
      } catch (e) {
        console.error('[InventarioV2] finalize error:', e)
        showToast('Error al enviar. Intente de nuevo.', 'error')
      }
    }
  }

  const meta = formMeta?.['equipment-v2']
  const siteInfo = equipmentInventoryV2Data?.siteInfo || {}

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'form':
        return <EquipmentInventorySiteInfoForm siteInfo={siteInfo} onChange={updateEquipmentV2SiteField} />
      case 'table-torre-v2':
        return <TowerInventoryTableV2 />
      case 'piso':
        return <FloorInventoryClientsV2 />
      case 'carriers':
        return <CarrierSection />
      default:
        return <div className="text-gray-500 text-center py-8">Sección no implementada</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader title="Inventario de Equipos v2" subtitle="PTI Inspect" onBack={() => navigate('/')} />

      <StepPills steps={equipmentInventoryV2Steps} currentStepId={currentStepId} completedSteps={[]} onStepClick={(s) => navigateToStep(s.id)} />

      {showAutosaveIndicator && <AutosaveIndicator />}

      <FormMetaBar meta={meta} onReset={() => { if (window.confirm('¿Reiniciar formulario?')) resetFormDraft('inventario-v2') }} />

      <main className="flex-1 px-4 pb-32">
        <div className="mb-4">
          <div className="text-2xl">{currentStep.icon}</div>
          <h2 className="text-lg font-extrabold text-gray-900">{currentStep.title}</h2>
          <p className="text-sm text-gray-500">{currentStep.description}</p>
        </div>
        {renderStepContent()}
      </main>

      <BottomNav onPrev={handlePrev} onNext={handleNext} showPrev={stepIndex > 0} nextLabel={stepIndex === totalSteps - 1 ? 'Finalizar' : 'Siguiente'} />
    </div>
  )
}
