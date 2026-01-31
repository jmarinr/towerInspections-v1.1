import { MapPin } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useAppStore } from '../../hooks/useAppStore'

export default function SiteInfoForm({ type = 'inspection' }) {
  const { inspectionData, maintenanceData, updateSiteInfo, updateMaintenanceSiteInfo } = useAppStore()
  
  const data = type === 'inspection' ? inspectionData.siteInfo : maintenanceData.siteInfo
  const updateFn = type === 'inspection' ? updateSiteInfo : updateMaintenanceSiteInfo

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
        updateFn('coordenadas', coords)
      },
      (err) => {
        alert('No se pudo obtener la ubicación: ' + err.message)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200">
      <Input
        label="Empresa proveedora del servicio"
        description="Nombre de la empresa contratista"
        required
        placeholder="Ej: Servicios de Torres Costa Rica S.A."
        value={data.proveedor}
        onChange={(e) => updateFn('proveedor', e.target.value)}
      />

      <Input
        label="Identificador único del sitio"
        description="Código asignado por PTI"
        required
        placeholder="Ej: PTI-CR-SJ-001"
        value={data.idSitio}
        onChange={(e) => updateFn('idSitio', e.target.value)}
      />

      <Input
        label="Nombre del sitio"
        description="Nombre descriptivo de la ubicación"
        required
        placeholder="Ej: San José Centro - Edificio Metropolitan"
        value={data.nombreSitio}
        onChange={(e) => updateFn('nombreSitio', e.target.value)}
      />

      <Select
        label="Tipo de sitio"
        value={data.tipoSitio}
        onChange={(e) => updateFn('tipoSitio', e.target.value)}
        options={[
          { value: '', label: 'Seleccione...' },
          { value: 'rawland', label: 'Rawland (Terreno)' },
          { value: 'rooftop', label: 'Rooftop (Azotea)' },
          { value: 'urbano', label: 'Urbano' },
          { value: 'rural', label: 'Rural' },
        ]}
      />

      <div className="mb-5">
        <label className="block mb-2">
          <span className="text-sm font-semibold text-gray-700">Coordenadas GPS</span>
          <span className="text-xs text-gray-500 block mt-1">
            Presione el botón para capturar automáticamente
          </span>
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            readOnly
            placeholder="Latitud, Longitud"
            value={data.coordenadas}
            className="
              flex-1 px-4 py-3.5 text-[15px] font-medium
              border-2 border-gray-200 rounded-xl bg-gray-50
            "
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="
              px-5 py-3.5 border-2 border-gray-200 rounded-xl
              bg-white text-gray-600 font-semibold text-sm
              flex items-center gap-2
              active:scale-95 active:bg-gray-50 transition-all
            "
          >
            <MapPin size={18} />
            Capturar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha"
          required
          type="date"
          value={data.fecha}
          onChange={(e) => updateFn('fecha', e.target.value)}
        />
        <Input
          label="Hora"
          required
          type="time"
          value={data.hora}
          onChange={(e) => updateFn('hora', e.target.value)}
        />
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
              { value: 'mastil', label: 'Mástil' },
            ]}
          />
          <Input
            label="Altura de torre (metros)"
            type="number"
            placeholder="Ej: 45"
            value={data.alturaTorre}
            onChange={(e) => updateFn('alturaTorre', e.target.value)}
          />
        </>
      )}

      <Input
        label="Dirección del sitio"
        placeholder="Dirección física completa"
        value={data.direccion}
        onChange={(e) => updateFn('direccion', e.target.value)}
      />
    </div>
  )
}
