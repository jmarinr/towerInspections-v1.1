import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function EquipmentInventorySiteInfoForm({ siteInfo: siteInfoProp, onChange: onChangeProp } = {}) {
  const { equipmentInventoryData, updateEquipmentSiteField } = useAppStore()

  // If props are passed (v2), use them. Otherwise fall back to v1 store.
  const data = siteInfoProp ?? (equipmentInventoryData?.siteInfo || {})
  const update = onChangeProp
    ? (field, value) => onChangeProp(field, value)
    : (field, value) => updateEquipmentSiteField(field, value)

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Proveedor" required placeholder="Ej: Contratista / Proveedor" value={data.proveedor || ''} onChange={(e) => update('proveedor', e.target.value)} />
        <Select
          label="Tipo de Visita"
          required
          value={data.tipoVisita || ''}
          onChange={(e) => update('tipoVisita', e.target.value)}
          options={[
            { value: '', label: 'Seleccione...' },
            { value: 'RoofTop', label: 'RoofTop' },
            { value: 'RawLand', label: 'RawLand' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Número de Orden" placeholder="Ej: OT-2026-0451" value={data.numeroOrden || ''} onChange={(e) => update('numeroOrden', e.target.value)} readOnly={!!data.numeroOrden} />
        <Input label="ID Sitio" required placeholder="Ej: PTI-XXX" value={data.idSitio || ''} onChange={(e) => update('idSitio', e.target.value)} readOnly={!!data.idSitio} />
        <Input label="Nombre Sitio" required placeholder="Ej: Torre San José" value={data.nombreSitio || ''} onChange={(e) => update('nombreSitio', e.target.value)} readOnly={!!data.nombreSitio} />
      </div>

      <Input label="Dirección" required placeholder="Dirección completa del sitio" value={data.direccion || ''} onChange={(e) => update('direccion', e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Altura (Mts)" type="number" placeholder="Ej: 42.3" value={data.alturaMts || ''} onChange={(e) => update('alturaMts', e.target.value)} />
        <Input label="Tipo Sitio" placeholder="Ej: RoofTop" value={data.tipoSitio || ''} onChange={(e) => update('tipoSitio', e.target.value)} />
        <Input label="Tipo Estructura" placeholder="Ej: Monopolo" value={data.tipoEstructura || ''} onChange={(e) => update('tipoEstructura', e.target.value)} />
      </div>
    </div>
  )
}
