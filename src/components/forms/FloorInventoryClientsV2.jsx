import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { useAppStore } from '../../hooks/useAppStore'
import PhotoUpload from '../ui/PhotoUpload'
import Input from '../ui/Input'

const TIPO_LABEL = { ancla: 'CLIENTE ANCLA', colo: 'CLIENTE COLO' }
const TIPO_COLOR = { ancla: 'border-blue-400 bg-blue-50', colo: 'border-gray-300 bg-white' }
const TIPO_HEADER = { ancla: 'bg-blue-700', colo: 'bg-gray-800' }

export default function FloorInventoryClientsV2() {
  const {
    equipmentInventoryV2Data,
    addFloorClientV2, removeFloorClientV2, updateFloorClientFieldV2,
    addCabinetV2, removeCabinetV2, updateCabinetFieldV2,
    updateEquipmentV2Field,
  } = useAppStore()

  const clientes = equipmentInventoryV2Data?.piso?.clientes || []
  const fotos = equipmentInventoryV2Data?.fotos || {}

  return (
    <div className="space-y-6">

      {/* ── Clientes ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-gray-900">Inventario de equipos en piso</div>
            <div className="text-xs text-gray-500 mt-1">Secciones por cliente (Ancla / Colo) con gabinetes y dimensiones.</div>
          </div>
          <div className="flex-1" />
          <button type="button" onClick={() => addFloorClientV2('ancla')}
            className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-blue-500 text-blue-700 bg-blue-50 active:scale-95 flex items-center gap-2">
            <Plus size={16} /> Ancla
          </button>
          <button type="button" onClick={() => addFloorClientV2('colo')}
            className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-gray-400 text-gray-700 bg-gray-50 active:scale-95 flex items-center gap-2">
            <Plus size={16} /> Colo
          </button>
        </div>

        <div className="p-4 space-y-5">
          {clientes.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">Sin clientes. Agrega un Ancla o Colo.</div>
          )}

          {clientes.map((cliente, cIdx) => (
            <div key={cIdx} className={`rounded-2xl border-2 overflow-hidden ${TIPO_COLOR[cliente.tipoCliente] || 'border-gray-200 bg-white'}`}>

              {/* Header de cliente — estilo formulario físico */}
              <div className={`flex items-center justify-between px-4 py-2 ${TIPO_HEADER[cliente.tipoCliente] || 'bg-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <select
                    value={cliente.tipoCliente || 'colo'}
                    onChange={(e) => updateFloorClientFieldV2(cIdx, 'tipoCliente', e.target.value)}
                    className="text-sm font-extrabold text-white bg-transparent border-none outline-none cursor-pointer appearance-none">
                    <option value="ancla" className="text-black bg-white">CLIENTE ANCLA</option>
                    <option value="colo" className="text-black bg-white">CLIENTE COLO</option>
                  </select>
                  <span className="text-white/60 text-xs">#{cIdx + 1}</span>
                </div>
                <button type="button" onClick={() => removeFloorClientV2(cIdx)}
                  className="text-white/70 hover:text-white active:scale-95 flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-white/30 hover:border-white/60">
                  <Trash2 size={12} /> Quitar
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Datos del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Nombre cliente" value={cliente.nombreCliente || ''}
                    onChange={(e) => updateFloorClientFieldV2(cIdx, 'nombreCliente', e.target.value)}
                    placeholder="Ej: Operador X" className="mb-0" />
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Área arrendada (m²)</label>
                    <input value={cliente.areaArrendada || ''}
                      onChange={(e) => updateFloorClientFieldV2(cIdx, 'areaArrendada', e.target.value)}
                      placeholder="m²"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Área en uso (m²)</label>
                    <input value={cliente.areaEnUso || ''}
                      onChange={(e) => updateFloorClientFieldV2(cIdx, 'areaEnUso', e.target.value)}
                      placeholder="m²"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Placa de equipos</label>
                  <input value={cliente.placaEquipos || ''}
                    onChange={(e) => updateFloorClientFieldV2(cIdx, 'placaEquipos', e.target.value)}
                    placeholder="Ej: placa / identificadores"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary" />
                </div>

                {/* Tabla de gabinetes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Gabinetes</div>
                    <button type="button" onClick={() => addCabinetV2(cIdx)}
                      className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 bg-white active:scale-95 flex items-center gap-1 hover:border-primary hover:text-primary">
                      <Plus size={12} /> Agregar gabinete
                    </button>
                  </div>

                  {/* Desktop: tabla compacta */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-900 text-white text-xs font-bold uppercase">
                          <th className="px-3 py-2 text-left">Gabinete</th>
                          <th className="px-3 py-2 text-center">Largo</th>
                          <th className="px-3 py-2 text-center">Ancho</th>
                          <th className="px-3 py-2 text-center">Alto</th>
                          <th className="px-3 py-2 text-center">Foto #</th>
                          <th className="px-2 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cliente.gabinetes || []).map((gab, gIdx) => (
                          <tr key={gIdx} className="border-t border-dashed border-gray-200 hover:bg-gray-50">
                            <td className="px-2 py-1">
                              <input value={gab.gabinete || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'gabinete', e.target.value)}
                                placeholder="Gab-01"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
                            </td>
                            <td className="px-2 py-1">
                              <input value={gab.largo || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'largo', e.target.value)}
                                placeholder="m"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-primary" />
                            </td>
                            <td className="px-2 py-1">
                              <input value={gab.ancho || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'ancho', e.target.value)}
                                placeholder="m"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-primary" />
                            </td>
                            <td className="px-2 py-1">
                              <input value={gab.alto || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'alto', e.target.value)}
                                placeholder="m"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-primary" />
                            </td>
                            <td className="px-2 py-1">
                              <input value={gab.fotoRef || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'fotoRef', e.target.value)}
                                placeholder="#"
                                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-primary" />
                            </td>
                            <td className="px-2 py-1 text-center">
                              <button type="button" onClick={() => removeCabinetV2(cIdx, gIdx)}
                                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 active:scale-95 flex items-center justify-center mx-auto">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(cliente.gabinetes || []).length === 0 && (
                          <tr><td colSpan={6} className="text-center text-xs text-gray-400 py-3">Sin gabinetes. Agrega uno.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: cards */}
                  <div className="md:hidden space-y-2">
                    {(cliente.gabinetes || []).map((gab, gIdx) => (
                      <div key={gIdx} className="rounded-xl border border-gray-200 p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-700">Gabinete {gIdx + 1}</span>
                          <button type="button" onClick={() => removeCabinetV2(cIdx, gIdx)}
                            className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 active:scale-95 flex items-center justify-center">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input label="Gabinete" value={gab.gabinete || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'gabinete', e.target.value)} placeholder="Gab-01" className="mb-0" />
                          <Input label="Foto #" value={gab.fotoRef || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'fotoRef', e.target.value)} placeholder="#" className="mb-0" />
                          <Input label="Largo (m)" value={gab.largo || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'largo', e.target.value)} placeholder="m" className="mb-0" />
                          <Input label="Ancho (m)" value={gab.ancho || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'ancho', e.target.value)} placeholder="m" className="mb-0" />
                          <Input label="Alto (m)" value={gab.alto || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'alto', e.target.value)} placeholder="m" className="mb-0" />
                        </div>
                      </div>
                    ))}
                    {(cliente.gabinetes || []).length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-2">Sin gabinetes.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plano de planta y equipos ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900">
          <ImageIcon size={16} className="text-white" />
          <span className="text-sm font-extrabold text-white uppercase tracking-wide">Plano de planta y equipos</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-4">
            Carga una fotografía o imagen del plano de planta y distribución de equipos del sitio.
          </p>
          <PhotoUpload
            type="after"
            photo={fotos.fotoPlanoPlanta || null}
            onCapture={(data) => updateEquipmentV2Field('fotos', 'fotoPlanoPlanta', data)}
            onRemove={() => updateEquipmentV2Field('fotos', 'fotoPlanoPlanta', null)}
            formCode="equipment-v2"
            assetType="equipmentV2:fotoPlanoPlanta"
          />
        </div>
      </div>

    </div>
  )
}
