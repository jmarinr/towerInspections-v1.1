import { Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../hooks/useAppStore'
import Input from '../ui/Input'

export default function FloorInventoryClientsV2() {
  const {
    equipmentInventoryV2Data,
    addFloorClientV2,
    removeFloorClientV2,
    updateFloorClientFieldV2,
    addCabinetV2,
    removeCabinetV2,
    updateCabinetFieldV2,
  } = useAppStore()

  const clientes = equipmentInventoryV2Data?.piso?.clientes || []

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-gray-900">Inventario de equipos en piso</div>
            <div className="text-xs text-gray-500 mt-1">Secciones por cliente (Ancla / Colo) y gabinetes con dimensiones + foto #.</div>
          </div>
          <div className="flex-1" />
          <button type="button" onClick={() => addFloorClientV2('ancla')} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Agregar Ancla
          </button>
          <button type="button" onClick={() => addFloorClientV2('colo')} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-gray-400 text-gray-700 bg-gray-50 active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Agregar Colo
          </button>
        </div>

        <div className="p-4 space-y-6">
          {clientes.map((cliente, cIdx) => (
            <div key={cIdx} className="rounded-2xl border-2 border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="font-bold text-gray-900">Cliente {cliente.tipoCliente === 'ancla' ? 'Ancla' : 'Colo'}</div>
                <span className="text-xs text-gray-500">Cliente #{cIdx + 1}</span>
                <div className="flex-1" />
                <button type="button" onClick={() => removeFloorClientV2(cIdx)} className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 active:scale-95 flex items-center gap-1">
                  <Trash2 size={12} /> Quitar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                  <select
                    value={cliente.tipoCliente || 'colo'}
                    onChange={(e) => updateFloorClientFieldV2(cIdx, 'tipoCliente', e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="ancla">Ancla</option>
                    <option value="colo">Colo</option>
                  </select>
                </div>
                <Input label="Nombre cliente" value={cliente.nombreCliente || ''} onChange={(e) => updateFloorClientFieldV2(cIdx, 'nombreCliente', e.target.value)} placeholder="Ej: Operador X" className="mb-0" />
                <Input label="Área arrendada" value={cliente.areaArrendada || ''} onChange={(e) => updateFloorClientFieldV2(cIdx, 'areaArrendada', e.target.value)} placeholder="m²" className="mb-0" />
                <Input label="Área en uso" value={cliente.areaEnUso || ''} onChange={(e) => updateFloorClientFieldV2(cIdx, 'areaEnUso', e.target.value)} placeholder="m²" className="mb-0" />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Placa de equipos</label>
                <span className="block text-[10px] text-gray-400 mb-1">Texto libre.</span>
                <input
                  value={cliente.placaEquipos || ''}
                  onChange={(e) => updateFloorClientFieldV2(cIdx, 'placaEquipos', e.target.value)}
                  placeholder="Ej: placa/identificadores"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Gabinetes */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-gray-800">Gabinetes</div>
                  <button type="button" onClick={() => addCabinetV2(cIdx)} className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 active:scale-95 flex items-center gap-1">
                    <Plus size={12} /> Agregar gabinete
                  </button>
                </div>

                <div className="space-y-2">
                  {(cliente.gabinetes || []).map((gab, gIdx) => (
                    <div key={gIdx} className="grid grid-cols-6 gap-2 items-end">
                      <Input label={gIdx === 0 ? 'Gabinete' : ''} value={gab.gabinete || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'gabinete', e.target.value)} placeholder="Ej: Gab-01" className="mb-0" />
                      <Input label={gIdx === 0 ? 'Largo' : ''} value={gab.largo || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'largo', e.target.value)} placeholder="m" className="mb-0" />
                      <Input label={gIdx === 0 ? 'Ancho' : ''} value={gab.ancho || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'ancho', e.target.value)} placeholder="m" className="mb-0" />
                      <Input label={gIdx === 0 ? 'Alto' : ''} value={gab.alto || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'alto', e.target.value)} placeholder="m" className="mb-0" />
                      <Input label={gIdx === 0 ? 'Foto #' : ''} value={gab.fotoRef || ''} onChange={(e) => updateCabinetFieldV2(cIdx, gIdx, 'fotoRef', e.target.value)} placeholder="Ej: 3" className="mb-0" />
                      <button type="button" onClick={() => removeCabinetV2(cIdx, gIdx)} className="w-9 h-9 rounded-xl border-2 border-gray-200 text-gray-600 bg-white hover:border-red-300 hover:text-red-600 active:scale-95 flex items-center justify-center mb-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Tip: si el cliente tiene varios racks, agrega múltiples filas.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
