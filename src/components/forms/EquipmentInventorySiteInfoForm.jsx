import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function EquipmentInventorySiteInfoForm() {
  const { equipmentInventoryData, updateEquipmentSiteField } = useAppStore()
  const data = equipmentInventoryData?.siteInfo || {}

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Proveedor" required placeholder="Ej: Contratista / Proveedor" value={data.proveedor || ''} onChange={(e) => updateEquipmentSiteField('proveedor', e.target.value)} />
        <Select
          label="Tipo de Visita"
          required
          value={data.tipoVisita || ''}
          onChange={(e) => updateEquipmentSiteField('tipoVisita', e.target.value)}
          options={[
            { value: '', label: 'Seleccione...' },
            { value: 'RoofTop', label: 'RoofTop' },
            { value: 'RawLand', label: 'RawLand' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="ID Sitio" required placeholder="Ej: PTI-XXX" value={data.idSitio || ''} onChange={(e) => updateEquipmentSiteField('idSitio', e.target.value)} />
        <Input label="Nombre Sitio" required placeholder="Ej: Torre San José" value={data.nombreSitio || ''} onChange={(e) => updateEquipmentSiteField('nombreSitio', e.target.value)} />
      </div>

      <Input label="Dirección" required placeholder="Dirección completa del sitio" value={data.direccion || ''} onChange={(e) => updateEquipmentSiteField('direccion', e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Altura (Mts)" type="number" placeholder="Ej: 42.3" value={data.alturaMts || ''} onChange={(e) => updateEquipmentSiteField('alturaMts', e.target.value)} />
        <Input label="Tipo Sitio" placeholder="Ej: RoofTop" value={data.tipoSitio || ''} onChange={(e) => updateEquipmentSiteField('tipoSitio', e.target.value)} />
        <Input label="Tipo Estructura" placeholder="Ej: Monopolo" value={data.tipoEstructura || ''} onChange={(e) => updateEquipmentSiteField('tipoEstructura', e.target.value)} />
      </div>
    </div>
  )
}
