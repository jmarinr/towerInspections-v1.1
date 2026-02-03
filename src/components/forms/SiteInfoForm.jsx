import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function SiteInfoForm({ type = 'inspection' }) {
  const { inspectionData, maintenanceData, updateSiteInfo, updateMaintenanceSiteInfo } = useAppStore()
  const data = type === 'inspection' ? inspectionData.siteInfo : maintenanceData.formData
  const updateFn = type === 'inspection' ? updateSiteInfo : updateMaintenanceSiteInfo

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <Input
        label="Empresa proveedora"
        description="Nombre de la empresa contratista"
        required
        placeholder="Ej: Servicios de Torres CR"
        value={data.proveedor || ''}
        onChange={(e) => updateFn('proveedor', e.target.value)}
      />

      <Input
        label="ID del Sitio"
        description="Código asignado por PTI"
        required
        placeholder="Ej: PTI-CR-SJ-001"
        value={data.idSitio || ''}
        onChange={(e) => updateFn('idSitio', e.target.value)}
      />

      <Input
        label="Nombre del Sitio"
        required
        placeholder="Ej: San José Centro"
        value={data.nombreSitio || ''}
        onChange={(e) => updateFn('nombreSitio', e.target.value)}
      />

      <Select
        label="Tipo de sitio"
        value={data.tipoSitio || ''}
        onChange={(e) => updateFn('tipoSitio', e.target.value)}
        options={[
          { value: '', label: 'Seleccione...' },
          { value: 'rawland', label: 'Rawland' },
          { value: 'rooftop', label: 'Rooftop' },
        ]}
      />

      {type === 'inspection' && (
        <>
          <Select
            label="Tipo de torre"
            value={data.tipoTorre || ''}
            onChange={(e) => updateFn('tipoTorre', e.target.value)}
            options={[
              { value: '', label: 'Seleccione...' },
              { value: 'autosoportada', label: 'Auto soportada' },
              { value: 'arriostrada', label: 'Arriostrada' },
              { value: 'monopolo', label: 'Monopolo' },
            ]}
          />
          <Input
            label="Altura de torre (m)"
            type="number"
            placeholder="Ej: 45"
            value={data.alturaTorre || ''}
            onChange={(e) => updateFn('alturaTorre', e.target.value)}
          />
        </>
      )}
    </div>
  )
}
