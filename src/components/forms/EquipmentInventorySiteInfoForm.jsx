
import { MapPin } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function EquipmentInventorySiteInfoForm() {
  const { equipmentInventoryData, updateEquipmentSiteField } = useAppStore()
  const data = equipmentInventoryData?.siteInfo || {}

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocalización no disponible')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateEquipmentSiteField('latitud', pos.coords.latitude.toFixed(6))
        updateEquipmentSiteField('longitud', pos.coords.longitude.toFixed(6))
      },
      (err) => alert('Error: ' + err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Fecha Inicio" required type="date" value={data.fechaInicio || ''} onChange={(e) => updateEquipmentSiteField('fechaInicio', e.target.value)} />
        <Input label="Fecha Término" required type="date" value={data.fechaTermino || ''} onChange={(e) => updateEquipmentSiteField('fechaTermino', e.target.value)} />
      </div>

      <Input label="Dirección" required placeholder="Dirección completa del sitio" value={data.direccion || ''} onChange={(e) => updateEquipmentSiteField('direccion', e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Altura (Mts)" type="number" placeholder="Ej: 42.3" value={data.alturaMts || ''} onChange={(e) => updateEquipmentSiteField('alturaMts', e.target.value)} />
        <Input label="Tipo Sitio" placeholder="Ej: RoofTop" value={data.tipoSitio || ''} onChange={(e) => updateEquipmentSiteField('tipoSitio', e.target.value)} />
        <Input label="Tipo Estructura" placeholder="Ej: Monopolo" value={data.tipoEstructura || ''} onChange={(e) => updateEquipmentSiteField('tipoEstructura', e.target.value)} />
      </div>

      <div className="mb-5">
        <label className="block mb-2 text-sm font-semibold text-gray-700">Latitud / Longitud</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="text" placeholder="Latitud" value={data.latitud || ''} onChange={(e) => updateEquipmentSiteField('latitud', e.target.value)} className="px-4 py-3 text-[15px] border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <input type="text" placeholder="Longitud" value={data.longitud || ''} onChange={(e) => updateEquipmentSiteField('longitud', e.target.value)} className="px-4 py-3 text-[15px] border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <button type="button" onClick={handleGetLocation} className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
            <MapPin size={18} /> Capturar GPS
          </button>
        </div>
      </div>
    </div>
  )
}
