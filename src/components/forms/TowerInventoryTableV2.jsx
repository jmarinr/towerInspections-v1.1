import { Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../hooks/useAppStore'
import PhotoUpload from '../ui/PhotoUpload'
import Input from '../ui/Input'

const cellClass = "w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"

function calcArea(alto, ancho) {
  const a = parseFloat(alto)
  const b = parseFloat(ancho)
  if (Number.isFinite(a) && Number.isFinite(b)) return (a * b).toFixed(4)
  return '0'
}

export default function TowerInventoryTableV2() {
  const { equipmentInventoryV2Data, addTowerItemV2, removeTowerItemV2, updateTowerItemFieldV2, updateEquipmentV2Field } = useAppStore()
  const items = equipmentInventoryV2Data?.torre?.items || []
  const fotos = equipmentInventoryV2Data?.fotos || {}

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-gray-900">Inventario de equipos en torre</div>
            <div className="text-xs text-gray-500 mt-1">Área M2 se calcula automáticamente (Alto × Ancho).</div>
          </div>
          <div className="flex-1" />
          <button type="button" onClick={addTowerItemV2} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Agregar fila
          </button>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">Aún no hay filas. Toca "Agregar fila".</div>
          )}
          {items.map((row, idx) => (
            <div key={idx} className="rounded-2xl border-2 border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm font-extrabold text-gray-900">Fila {idx + 1}</div>
                <div className="flex-1" />
                <button type="button" onClick={() => removeTowerItemV2(idx)} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white active:scale-95 flex items-center justify-center">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Altura (m)" value={row.alturaMts || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'alturaMts', e.target.value)} placeholder="Ej: 32.0" className="mb-0" />
                  <Input label="Orientación" value={row.orientacion || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'orientacion', e.target.value)} placeholder="Ej: N" className="mb-0" />
                </div>
                <Input label="Tipo de Antena y/o Equipo" value={row.tipoEquipo || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'tipoEquipo', e.target.value)} placeholder="Ej: Antena RF" className="mb-0" />
                <Input label="Número de Antenas y/o Equipo" value={row.cantidad || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'cantidad', e.target.value)} placeholder="Ej: 2" className="mb-0" />
                <div className="text-xs font-bold text-gray-500 uppercase mt-1">Dimensiones en metros</div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Alto" value={row.alto || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'alto', e.target.value)} placeholder="m" className="mb-0" />
                  <Input label="Ancho" value={row.ancho || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'ancho', e.target.value)} placeholder="m" className="mb-0" />
                  <Input label="Profundidad" value={row.profundidad || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'profundidad', e.target.value)} placeholder="m" className="mb-0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Área M2</label>
                    <div className="px-3 py-2 text-sm bg-gray-100 rounded-xl text-gray-700 font-mono">{calcArea(row.alto, row.ancho)}</div>
                  </div>
                  <Input label="Carrier" value={row.carrier || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'carrier', e.target.value)} placeholder="Ej: Claro" className="mb-0" />
                </div>
                <Input label="Comentario" value={row.comentario || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'comentario', e.target.value)} placeholder="Observaciones..." className="mb-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-[1200px] w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-extrabold text-gray-700">
                <th className="p-3">Altura (m)</th>
                <th className="p-3">Orientación</th>
                <th className="p-3">Tipo Antena/Equipo</th>
                <th className="p-3">Número</th>
                <th className="p-3">Alto</th>
                <th className="p-3">Ancho</th>
                <th className="p-3">Profundidad</th>
                <th className="p-3">Área M2</th>
                <th className="p-3">Carrier</th>
                <th className="p-3">Comentario</th>
                <th className="p-3 w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="p-2"><input className={cellClass} value={row.alturaMts || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'alturaMts', e.target.value)} placeholder="m" /></td>
                  <td className="p-2"><input className={cellClass} value={row.orientacion || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'orientacion', e.target.value)} placeholder="N" /></td>
                  <td className="p-2"><input className={cellClass} value={row.tipoEquipo || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'tipoEquipo', e.target.value)} placeholder="RF" /></td>
                  <td className="p-2"><input className={cellClass} value={row.cantidad || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'cantidad', e.target.value)} placeholder="1" /></td>
                  <td className="p-2"><input className={cellClass} value={row.alto || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'alto', e.target.value)} placeholder="m" /></td>
                  <td className="p-2"><input className={cellClass} value={row.ancho || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'ancho', e.target.value)} placeholder="m" /></td>
                  <td className="p-2"><input className={cellClass} value={row.profundidad || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'profundidad', e.target.value)} placeholder="m" /></td>
                  <td className="p-2"><div className="px-3 py-2 text-sm bg-gray-100 rounded-xl text-gray-700 font-mono text-center">{calcArea(row.alto, row.ancho)}</div></td>
                  <td className="p-2"><input className={cellClass} value={row.carrier || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'carrier', e.target.value)} placeholder="Claro" /></td>
                  <td className="p-2"><input className={cellClass} value={row.comentario || ''} onChange={(e) => updateTowerItemFieldV2(idx, 'comentario', e.target.value)} placeholder="..." /></td>
                  <td className="p-2">
                    <button type="button" onClick={() => removeTowerItemV2(idx)} className="w-9 h-9 rounded-xl border-2 border-gray-200 text-gray-600 bg-white hover:border-red-300 hover:text-red-600 active:scale-95 flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Photos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="font-extrabold text-gray-900 mb-1">Fotos de torre</div>
        <div className="text-xs text-gray-500 mb-4">Evidencia fotográfica de la torre.</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Distribución de equipos en torre</label>
            <PhotoUpload type="after" photo={fotos.fotoDistribucionTorre || null} onCapture={(data) => updateEquipmentV2Field('fotos', 'fotoDistribucionTorre', data)} onRemove={() => updateEquipmentV2Field('fotos', 'fotoDistribucionTorre', null)} formCode="equipment-v2" assetType="equipmentV2:fotoDistribucionTorre" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Foto de torre completa</label>
            <PhotoUpload type="after" photo={fotos.fotoTorreCompleta || null} onCapture={(data) => updateEquipmentV2Field('fotos', 'fotoTorreCompleta', data)} onRemove={() => updateEquipmentV2Field('fotos', 'fotoTorreCompleta', null)} formCode="equipment-v2" assetType="equipmentV2:fotoTorreCompleta" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Croquis esquemático del edificio</label>
            <PhotoUpload type="after" photo={fotos.fotoCroquisEdificio || null} onCapture={(data) => updateEquipmentV2Field('fotos', 'fotoCroquisEdificio', data)} onRemove={() => updateEquipmentV2Field('fotos', 'fotoCroquisEdificio', null)} formCode="equipment-v2" assetType="equipmentV2:fotoCroquisEdificio" />
          </div>
        </div>
      </div>
    </div>
  )
}
