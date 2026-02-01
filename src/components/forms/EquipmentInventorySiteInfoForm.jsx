import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const validateLat = (v) => {
  if (isBlank(v)) return { valid: false, message: 'Campo requerido' }
  const n = Number(String(v))
  if (!Number.isFinite(n)) return { valid: false, message: 'Latitud inválida' }
  if (n < -90 || n > 90) return { valid: false, message: 'Rango: -90 a 90' }
  return { valid: true }
}

const validateLng = (v) => {
  if (isBlank(v)) return { valid: false, message: 'Campo requerido' }
  const n = Number(String(v))
  if (!Number.isFinite(n)) return { valid: false, message: 'Longitud inválida' }
  if (n < -180 || n > 180) return { valid: false, message: 'Rango: -180 a 180' }
  return { valid: true }
}

export default function EquipmentInventorySiteInfoForm() {
  const { equipmentInventoryData, updateEquipmentSiteField } = useAppStore()
  const data = equipmentInventoryData?.siteInfo || {}

  const [gpsTouched, setGpsTouched] = useState(false)

  useEffect(() => {
    if (!gpsTouched && (!isBlank(data.latitud) || !isBlank(data.longitud))) setGpsTouched(true)
  }, [data.latitud, data.longitud, gpsTouched])

  const handleGetLocation = () => {
    setGpsTouched(true)
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

  const hasValidGps = validateLat(data.latitud).valid && validateLng(data.longitud).valid

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Proveedor"
          required
          placeholder="Ej: Contratista / Proveedor"
          value={data.proveedor || ''}
          onChange={(e) => updateEquipmentSiteField('proveedor', e.target.value)}
        />

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

      {/* GPS */}
      <div className="mt-2">
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Latitud / Longitud <span className="text-red-500 font-extrabold">*</span>
          </span>
          <span className="text-xs text-gray-500 block mt-1">Captura automática desde el dispositivo</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            label="Latitud"
            required
            validator={validateLat}
            touchedExternally={gpsTouched}
            placeholder="Ej: 9.933123"
            value={data.latitud || ''}
            onChange={(e) => updateEquipmentSiteField('latitud', e.target.value)}
            className="mb-0"
          />
          <Input
            label="Longitud"
            required
            validator={validateLng}
            touchedExternally={gpsTouched}
            placeholder="Ej: -84.084321"
            value={data.longitud || ''}
            onChange={(e) => updateEquipmentSiteField('longitud', e.target.value)}
            className="mb-0"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="h-[52px] md:mt-[30px] px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <MapPin size={18} /> Capturar GPS
          </button>
        </div>

        {gpsTouched && hasValidGps && (
          <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ Coordenadas registradas correctamente</p>
        )}
      </div>
    </div>
  )
}