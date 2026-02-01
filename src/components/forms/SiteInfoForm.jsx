import { MapPin } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function SiteInfoForm({ type = 'inspection' }) {
  const { inspectionData, maintenanceData, updateSiteInfo, updateMaintenanceSiteInfo } = useAppStore()
  const data = type === 'inspection' ? inspectionData.siteInfo : maintenanceData.siteInfo
  const updateFn = type === 'inspection' ? updateSiteInfo : updateMaintenanceSiteInfo

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocalización no disponible')
    navigator.geolocation.getCurrentPosition(
      (pos) => updateFn('coordenadas', `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      (err) => alert('Error: ' + err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <Input label="Empresa proveedora" description="Nombre de la empresa contratista" required placeholder="Ej: Servicios de Torres CR" value={data.proveedor} onChange={(e) => updateFn('proveedor', e.target.value)} />
      <Input label="ID del Sitio" description="Código asignado por PTI" required placeholder="Ej: PTI-CR-SJ-001" value={data.idSitio} onChange={(e) => updateFn('idSitio', e.target.value)} />
      <Input label="Nombre del Sitio" required placeholder="Ej: San José Centro" value={data.nombreSitio} onChange={(e) => updateFn('nombreSitio', e.target.value)} />
      <Select label="Tipo de sitio" value={data.tipoSitio} onChange={(e) => updateFn('tipoSitio', e.target.value)} options={[{ value: '', label: 'Seleccione...' }, { value: 'rawland', label: 'Rawland' }, { value: 'rooftop', label: 'Rooftop' }]} />
      <div className="mb-5">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Input
              label="Coordenadas GPS"
              required
              type="gps"
              value={data.coordenadas}
              placeholder="Latitud, Longitud"
              readOnly
              successText="✓ GPS capturado"
              errorText="⚠ GPS requerido"
            />
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            className="mb-4 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <MapPin size={18} />
            Capturar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha" required type="date" value={data.fecha} onChange={(e) => updateFn('fecha', e.target.value)} />
        <Input label="Hora" required type="time" value={data.hora} onChange={(e) => updateFn('hora', e.target.value)} />
      </div>
      {type === 'inspection' && (
        <>
          <Select label="Tipo de torre" value={data.tipoTorre} onChange={(e) => updateFn('tipoTorre', e.target.value)} options={[{ value: '', label: 'Seleccione...' }, { value: 'autosoportada', label: 'Auto soportada' }, { value: 'arriostrada', label: 'Arriostrada' }, { value: 'monopolo', label: 'Monopolo' }]} />
          <Input label="Altura de torre (m)" type="number" placeholder="Ej: 45" value={data.alturaTorre} onChange={(e) => updateFn('alturaTorre', e.target.value)} />
        </>
      )}
    </div>
  )
}
