import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const validateCoords = (coords) => {
  if (isBlank(coords)) return { valid: false, message: 'Coordenadas requeridas' }
  const parts = String(coords).split(',').map(s => s.trim())
  if (parts.length !== 2) return { valid: false, message: 'Formato: latitud, longitud' }
  const lat = Number(parts[0])
  const lng = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { valid: false, message: 'Coordenadas inválidas' }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { valid: false, message: 'Coordenadas fuera de rango' }
  return { valid: true }
}

export default function SiteInfoForm({ type = 'inspection' }) {
  const { inspectionData, maintenanceData, updateSiteInfo, updateMaintenanceSiteInfo } = useAppStore()
  const data = type === 'inspection' ? inspectionData.siteInfo : maintenanceData.siteInfo
  const updateFn = type === 'inspection' ? updateSiteInfo : updateMaintenanceSiteInfo

  const [gpsTouched, setGpsTouched] = useState(false)

  useEffect(() => {
    if (!gpsTouched && !isBlank(data.coordenadas)) setGpsTouched(true)
  }, [data.coordenadas, gpsTouched])

  const handleGetLocation = () => {
    setGpsTouched(true)
    if (!navigator.geolocation) return alert('Geolocalización no disponible')
    navigator.geolocation.getCurrentPosition(
      (pos) => updateFn('coordenadas', `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      (err) => alert('Error: ' + err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const gpsValidation = gpsTouched && !isBlank(data.coordenadas) ? validateCoords(data.coordenadas) : null
  const gpsStatus = !gpsTouched ? 'neutral' : (gpsValidation?.valid ? 'valid' : (isBlank(data.coordenadas) ? 'invalid' : 'invalid'))

  const gpsBorder =
    gpsStatus === 'valid'
      ? 'border-emerald-500 bg-emerald-50/40'
      : gpsStatus === 'invalid'
      ? 'border-red-500 bg-red-50/40'
      : 'border-gray-200 bg-gray-50'

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <Input
        label="Empresa proveedora"
        description="Nombre de la empresa contratista"
        required
        placeholder="Ej: Servicios de Torres CR"
        value={data.proveedor}
        onChange={(e) => updateFn('proveedor', e.target.value)}
      />

      <Input
        label="ID del Sitio"
        description="Código asignado por PTI"
        required
        placeholder="Ej: PTI-CR-SJ-001"
        value={data.idSitio}
        onChange={(e) => updateFn('idSitio', e.target.value)}
      />

      <Input
        label="Nombre del Sitio"
        required
        placeholder="Ej: San José Centro"
        value={data.nombreSitio}
        onChange={(e) => updateFn('nombreSitio', e.target.value)}
      />

      <Select
        label="Tipo de sitio"
        value={data.tipoSitio}
        onChange={(e) => updateFn('tipoSitio', e.target.value)}
        options={[
          { value: '', label: 'Seleccione...' },
          { value: 'rawland', label: 'Rawland' },
          { value: 'rooftop', label: 'Rooftop' },
        ]}
      />

      {/* GPS */}
      <div className="mb-5">
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Coordenadas GPS
          </span>
          <span className="text-xs text-gray-500 block mt-1">Captura automática desde el dispositivo</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            placeholder="Latitud, Longitud"
            value={data.coordenadas}
            className={`flex-1 px-4 py-3 text-[15px] border-2 rounded-xl min-w-0 transition-all ${gpsBorder}`}
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full sm:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <MapPin size={18} />
            Capturar GPS
          </button>
        </div>

        {gpsStatus === 'valid' && (
          <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ Coordenadas registradas correctamente</p>
        )}
        {gpsStatus === 'invalid' && (
          <p className="mt-2 text-xs text-red-600 font-semibold">⚠ {gpsValidation?.message || 'Captura las coordenadas GPS'}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha" required type="date" value={data.fecha} onChange={(e) => updateFn('fecha', e.target.value)} />
        <Input label="Hora" required type="time" value={data.hora} onChange={(e) => updateFn('hora', e.target.value)} />
      </div>

      {type === 'inspection' && (
        <>
          <Select
            label="Tipo de torre"
            value={data.tipoTorre}
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
            value={data.alturaTorre}
            onChange={(e) => updateFn('alturaTorre', e.target.value)}
          />
        </>
      )}
    </div>
  )
}