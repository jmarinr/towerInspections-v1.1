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

export default function CarrierSection() {
  const { equipmentInventoryV2Data, updateEquipmentV2Carriers } = useAppStore()
  const carriers = equipmentInventoryV2Data?.carriers || []

  const addCarrier = () => {
    updateEquipmentV2Carriers([
      ...carriers,
      {
        nombre: '',
        items: [{ alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', alto: '', ancho: '', profundidad: '', carrier: '', comentario: '' }],
        foto1: null,
        foto2: null,
        foto3: null,
      },
    ])
  }

  const removeCarrier = (idx) => {
    const updated = carriers.filter((_, i) => i !== idx)
    updateEquipmentV2Carriers(updated)
  }

  const updateCarrierField = (cIdx, field, value) => {
    const updated = carriers.map((c, i) => i === cIdx ? { ...c, [field]: value } : c)
    updateEquipmentV2Carriers(updated)
  }

  const addItem = (cIdx) => {
    const updated = carriers.map((c, i) => {
      if (i !== cIdx) return c
      return { ...c, items: [...(c.items || []), { alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', alto: '', ancho: '', profundidad: '', carrier: '', comentario: '' }] }
    })
    updateEquipmentV2Carriers(updated)
  }

  const removeItem = (cIdx, rIdx) => {
    const updated = carriers.map((c, i) => {
      if (i !== cIdx) return c
      const items = (c.items || []).filter((_, ri) => ri !== rIdx)
      return { ...c, items: items.length ? items : [{ alturaMts: '', orientacion: '', tipoEquipo: '', cantidad: '', alto: '', ancho: '', profundidad: '', carrier: '', comentario: '' }] }
    })
    updateEquipmentV2Carriers(updated)
  }

  const updateItemField = (cIdx, rIdx, field, value) => {
    const updated = carriers.map((c, i) => {
      if (i !== cIdx) return c
      const items = (c.items || []).map((it, ri) => ri === rIdx ? { ...it, [field]: value } : it)
      return { ...c, items }
    })
    updateEquipmentV2Carriers(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-extrabold text-gray-900">Carriers</div>
          <div className="text-xs text-gray-500">Agregue un bloque por cada carrier del sitio con su tabla de equipos y fotos.</div>
        </div>
        <button type="button" onClick={addCarrier} className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2">
          <Plus size={18} /> Agregar Carrier
        </button>
      </div>

      {carriers.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">No hay carriers. Toca "Agregar Carrier" para iniciar.</div>
      )}

      {carriers.map((carrier, cIdx) => (
        <div key={cIdx} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          {/* Carrier header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-extrabold text-sm flex items-center justify-center">{cIdx + 1}</div>
            <div className="flex-1">
              <Input label="" value={carrier.nombre || ''} onChange={(e) => updateCarrierField(cIdx, 'nombre', e.target.value)} placeholder="Nombre del carrier (ej: TIGO, Claro)" className="mb-0" />
            </div>
            <button type="button" onClick={() => addItem(cIdx)} className="px-2 py-1 text-xs rounded-lg border border-primary text-primary active:scale-95 flex items-center gap-1">
              <Plus size={12} /> Fila
            </button>
            <button type="button" onClick={() => { if (window.confirm('¿Eliminar este carrier y todos sus datos?')) removeCarrier(cIdx) }} className="px-2 py-1 text-xs rounded-lg border border-red-300 text-red-600 active:scale-95 flex items-center gap-1">
              <Trash2 size={12} /> Quitar
            </button>
          </div>

          {/* Table (mobile cards) */}
          <div className="block md:hidden p-4 space-y-3">
            {(carrier.items || []).map((row, rIdx) => (
              <div key={rIdx} className="rounded-xl border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Equipo {rIdx + 1}</span>
                  <button type="button" onClick={() => removeItem(cIdx, rIdx)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Altura (m)" value={row.alturaMts || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'alturaMts', e.target.value)} placeholder="m" className="mb-0" />
                  <Input label="Orientación" value={row.orientacion || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'orientacion', e.target.value)} placeholder="N" className="mb-0" />
                </div>
                <Input label="Tipo Antena/Equipo" value={row.tipoEquipo || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'tipoEquipo', e.target.value)} placeholder="RF" className="mb-0" />
                <Input label="Número" value={row.cantidad || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'cantidad', e.target.value)} placeholder="1" className="mb-0" />
                <div className="text-[10px] font-bold text-gray-400 uppercase">Dimensiones</div>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Alto" value={row.alto || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'alto', e.target.value)} placeholder="m" className="mb-0" />
                  <Input label="Ancho" value={row.ancho || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'ancho', e.target.value)} placeholder="m" className="mb-0" />
                  <Input label="Prof." value={row.profundidad || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'profundidad', e.target.value)} placeholder="m" className="mb-0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Área M2</label>
                    <div className="px-3 py-2 text-sm bg-gray-100 rounded-xl font-mono">{calcArea(row.alto, row.ancho)}</div>
                  </div>
                  <Input label="Carrier" value={row.carrier || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'carrier', e.target.value)} placeholder="TIGO" className="mb-0" />
                </div>
                <Input label="Comentario" value={row.comentario || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'comentario', e.target.value)} placeholder="..." className="mb-0" />
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-[11px] font-extrabold text-gray-600">
                  <th className="p-2">Altura</th><th className="p-2">Orient.</th><th className="p-2">Tipo</th><th className="p-2">Núm.</th>
                  <th className="p-2">Alto</th><th className="p-2">Ancho</th><th className="p-2">Prof.</th><th className="p-2">Área M2</th>
                  <th className="p-2">Carrier</th><th className="p-2">Comentario</th><th className="p-2 w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {(carrier.items || []).map((row, rIdx) => (
                  <tr key={rIdx} className="border-t border-gray-100">
                    <td className="p-1"><input className={cellClass} value={row.alturaMts || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'alturaMts', e.target.value)} placeholder="m" /></td>
                    <td className="p-1"><input className={cellClass} value={row.orientacion || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'orientacion', e.target.value)} placeholder="N" /></td>
                    <td className="p-1"><input className={cellClass} value={row.tipoEquipo || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'tipoEquipo', e.target.value)} placeholder="RF" /></td>
                    <td className="p-1"><input className={cellClass} value={row.cantidad || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'cantidad', e.target.value)} placeholder="1" /></td>
                    <td className="p-1"><input className={cellClass} value={row.alto || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'alto', e.target.value)} placeholder="m" /></td>
                    <td className="p-1"><input className={cellClass} value={row.ancho || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'ancho', e.target.value)} placeholder="m" /></td>
                    <td className="p-1"><input className={cellClass} value={row.profundidad || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'profundidad', e.target.value)} placeholder="m" /></td>
                    <td className="p-1"><div className="px-2 py-2 text-xs bg-gray-100 rounded-xl font-mono text-center">{calcArea(row.alto, row.ancho)}</div></td>
                    <td className="p-1"><input className={cellClass} value={row.carrier || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'carrier', e.target.value)} placeholder="TIGO" /></td>
                    <td className="p-1"><input className={cellClass} value={row.comentario || ''} onChange={(e) => updateItemField(cIdx, rIdx, 'comentario', e.target.value)} placeholder="..." /></td>
                    <td className="p-1">
                      <button type="button" onClick={() => removeItem(cIdx, rIdx)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 active:scale-95 flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3 Photos per carrier */}
          <div className="p-4 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-600 mb-3">Fotos del carrier {carrier.nombre || `#${cIdx + 1}`}</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Foto 1</label>
                <PhotoUpload type="after" photo={carrier.foto1 || null} onCapture={(data) => updateCarrierField(cIdx, 'foto1', data)} onRemove={() => updateCarrierField(cIdx, 'foto1', null)} formCode="equipment-v2" assetType={`carrier:${cIdx}:foto1`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Foto 2</label>
                <PhotoUpload type="after" photo={carrier.foto2 || null} onCapture={(data) => updateCarrierField(cIdx, 'foto2', data)} onRemove={() => updateCarrierField(cIdx, 'foto2', null)} formCode="equipment-v2" assetType={`carrier:${cIdx}:foto2`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Foto 3</label>
                <PhotoUpload type="after" photo={carrier.foto3 || null} onCapture={(data) => updateCarrierField(cIdx, 'foto3', data)} onRemove={() => updateCarrierField(cIdx, 'foto3', null)} formCode="equipment-v2" assetType={`carrier:${cIdx}:foto3`} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
