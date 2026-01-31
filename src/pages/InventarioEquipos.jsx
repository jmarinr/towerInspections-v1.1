
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import StepPills from '../components/layout/StepPills'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'

import { equipmentInventorySteps, getEquipmentStepIndex } from '../data/equipmentInventoryConfig'
import { useAppStore } from '../hooks/useAppStore'

import EquipmentInventorySiteInfoForm from '../components/forms/EquipmentInventorySiteInfoForm'
import TowerInventoryTable from '../components/forms/TowerInventoryTable'
import FloorInventoryClients from '../components/forms/FloorInventoryClients'
import DistributionBuilder from '../components/equipment/DistributionBuilder'
import DrawingCanvas from '../components/drawing/DrawingCanvas'
import Input from '../components/ui/Input'

import templateCroquis from '../assets/equipment/template_croquis_esquematico.png'

export default function InventarioEquipos() {
  const navigate = useNavigate()
  const { step } = useParams()

  const {
    showAutosaveIndicator,
    equipmentInventoryData,
    setDistribucionTorre,
    setDistribucionFotoTorre,
    setCroquisEsquematico,
    setCroquisNiveles,
    setPlanoPlanta,
  } = useAppStore()

  const currentStepId = useMemo(() => {
    if (step && equipmentInventorySteps.some(s => s.id === step)) return step
    return equipmentInventorySteps[0].id
  }, [step])

  const currentStepIndex = Math.max(0, getEquipmentStepIndex(currentStepId))
  const currentStep = equipmentInventorySteps[currentStepIndex]

  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => {
    // Marca como completado el paso anterior al avanzar (simple UX, sin validación dura)
    setCompletedSteps((prev) => {
      const ids = equipmentInventorySteps.slice(0, currentStepIndex).map(s => s.id)
      return Array.from(new Set([...prev, ...ids]))
    })
  }, [currentStepIndex])

  const goToStep = (id) => navigate(`/inventario-equipos/${id}`)
  const goNext = () => {
    const next = equipmentInventorySteps[currentStepIndex + 1]
    if (next) goToStep(next.id)
  }
  const goPrev = () => {
    const prev = equipmentInventorySteps[currentStepIndex - 1]
    if (prev) goToStep(prev.id)
    else navigate('/')
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'form':
        return <EquipmentInventorySiteInfoForm />
      case 'table-torre':
        return <TowerInventoryTable />
      case 'piso':
        return <FloorInventoryClients />
      case 'builder':
        return (
          <DistributionBuilder
            scene={equipmentInventoryData?.distribucionTorre?.scene}
            pngDataUrl={equipmentInventoryData?.distribucionTorre?.pngDataUrl}
            fotoTorreDataUrl={equipmentInventoryData?.distribucionTorre?.fotoTorreDataUrl}
            onSaveScene={(scene, png) => setDistribucionTorre(scene, png)}
            onSaveFoto={(data) => setDistribucionFotoTorre(data)}
          />
        )
      case 'drawing-template':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="font-extrabold text-gray-900">Niveles (según formato)</div>
              <div className="text-xs text-gray-500 mt-1">Opcional: completa alturas para Nivel 1-3 y Banqueta.</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <Input label="Nivel 1" placeholder="m" value={equipmentInventoryData?.croquisEsquematico?.niveles?.nivel1 || ''} onChange={(e) => setCroquisNiveles('nivel1', e.target.value)} />
                <Input label="Nivel 2" placeholder="m" value={equipmentInventoryData?.croquisEsquematico?.niveles?.nivel2 || ''} onChange={(e) => setCroquisNiveles('nivel2', e.target.value)} />
                <Input label="Nivel 3" placeholder="m" value={equipmentInventoryData?.croquisEsquematico?.niveles?.nivel3 || ''} onChange={(e) => setCroquisNiveles('nivel3', e.target.value)} />
                <Input label="Banqueta" placeholder="m" value={equipmentInventoryData?.croquisEsquematico?.niveles?.banqueta || ''} onChange={(e) => setCroquisNiveles('banqueta', e.target.value)} />
              </div>
            </div>

            <DrawingCanvas
              backgroundImage={templateCroquis}
              initialDrawing={equipmentInventoryData?.croquisEsquematico?.drawing}
              onChange={(drawing, png) => setCroquisEsquematico(drawing, png)}
              height={650}
            />

            {equipmentInventoryData?.croquisEsquematico?.pngDataUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-3">
                <div className="text-sm font-extrabold text-gray-900 mb-2">Vista guardada</div>
                <img src={equipmentInventoryData.croquisEsquematico.pngDataUrl} alt="Croquis esquemático" className="w-full rounded-xl border border-gray-200" />
              </div>
            )}
          </div>
        )
      case 'drawing-blank':
        return (
          <div className="space-y-4">
            <DrawingCanvas
              backgroundImage={null}
              initialDrawing={equipmentInventoryData?.planoPlanta?.drawing}
              onChange={(drawing, png) => setPlanoPlanta(drawing, png)}
              height={700}
            />
            {equipmentInventoryData?.planoPlanta?.pngDataUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-3">
                <div className="text-sm font-extrabold text-gray-900 mb-2">Vista guardada</div>
                <img src={equipmentInventoryData.planoPlanta.pngDataUrl} alt="Plano de planta" className="w-full rounded-xl border border-gray-200" />
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Inventario de Equipos" subtitle="Formulario 3 · PTI Inspect" />

      <StepPills
        steps={equipmentInventorySteps}
        currentStep={currentStepId}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      <AutosaveIndicator show={showAutosaveIndicator} />

      <div className="px-4 pb-32">
        <div className="mb-4">
          <div className="text-lg font-extrabold text-gray-900">{currentStep.icon} {currentStep.title}</div>
          <div className="text-sm text-gray-600 mt-1">{currentStep.description}</div>
        </div>

        {renderStepContent()}
      </div>

      <BottomNav onBack={goPrev} onNext={goNext} nextLabel={currentStepIndex === equipmentInventorySteps.length - 1 ? 'Finalizar' : 'Siguiente'} />
    </div>
  )
}
