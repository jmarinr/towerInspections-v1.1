import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Copy,
  Hand,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  Undo2,
  Unlock,
  X,
} from 'lucide-react'
import PhotoUpload from '../ui/PhotoUpload'

import templateDistribucion from '../../assets/equipment/template_distribucion_torre.png'

import tri from '../../assets/equipment/triangulo_estabilizador.png'
import herraje from '../../assets/equipment/herraje_vacio.png'
import soporte from '../../assets/equipment/soporte_vacio.png'
import pararrayo from '../../assets/equipment/pararrayo.png'
import microonda from '../../assets/equipment/microonda.png'
import antena1 from '../../assets/equipment/antena_rf.png'
import antena2 from '../../assets/equipment/antena_rf_2.png'
import rru from '../../assets/equipment/rru.png'
import luz from '../../assets/equipment/luz_obstruccion.png'

// Dimensiones reales de la plantilla para exportar sin pérdida.
const WORLD_W = 1275
const WORLD_H = 1650

const PALETTE = [
  { type: 'triangulo', label: 'Triángulo estabilizador', src: tri, w: 180, h: 95 },
  { type: 'herraje', label: 'Herraje', src: herraje, w: 120, h: 120 },
  { type: 'soporte', label: 'Soporte', src: soporte, w: 70, h: 160 },
  { type: 'pararrayo', label: 'Pararrayo', src: pararrayo, w: 60, h: 190 },
  { type: 'microonda', label: 'Microonda', src: microonda, w: 105, h: 105 },
  { type: 'antena_rf', label: 'Antena RF', src: antena1, w: 55, h: 185 },
  { type: 'antena_rf_2', label: 'Antena RF (2)', src: antena2, w: 55, h: 130 },
  { type: 'rru', label: 'RRU', src: rru, w: 80, h: 115 },
  { type: 'luz', label: 'Luz de obstrucción', src: luz, w: 115, h: 95 },
]

const byType = (t) => PALETTE.find(p => p.type === t)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.src = src
})

function fitView(canvasW, canvasH) {
  const padding = 0.94
  const s = Math.min(canvasW / WORLD_W, canvasH / WORLD_H) * padding
  const ox = (canvasW - WORLD_W * s) / 2
  const oy = (canvasH - WORLD_H * s) / 2
  return { scale: clamp(s, 0.2, 4), ox, oy }
}

function screenToWorld(clientX, clientY, rect, view) {
  return {
    x: (clientX - rect.left - view.ox) / view.scale,
    y: (clientY - rect.top - view.oy) / view.scale,
  }
}

function PiecePicker({ open, onClose, onPick }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl border-t border-gray-200 p-4 max-h-[75svh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="font-extrabold text-gray-900">Agregar piezas</div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white active:scale-95 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PALETTE.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => { onPick(p.type); onClose() }}
              className="border-2 border-gray-200 rounded-2xl p-3 bg-white active:scale-95 hover:border-primary"
            >
              <img src={p.src} alt={p.label} className="w-full h-16 object-contain" />
              <div className="mt-2 text-[12px] font-bold text-gray-800 leading-tight text-left">{p.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Tip: selecciona una pieza y luego toca el croquis para colocarla.
        </div>
      </div>
    </div>
  )
}

export default function DistributionBuilder({
  scene,
  pngDataUrl,
  fotoTorreDataUrl,
  onSaveScene,
  onSaveFoto,
  variant = 'card', // 'card' | 'fullscreen'
  onRequestFullscreen = null,
}) {
  const isFullscreen = variant === 'fullscreen'

  // Card mode: preview + botón para editor fullscreen (mejor UX móvil)
  if (!isFullscreen) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <div>
              <div className="font-extrabold text-gray-900">Distribución de equipos en torre</div>
              <div className="text-xs text-gray-500 mt-1">Edita en pantalla completa para arrastrar, zoom y precisión.</div>
            </div>
            <div className="flex-1" />
            {typeof onRequestFullscreen === 'function' && (
              <button
                type="button"
                onClick={onRequestFullscreen}
                className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2"
              >
                <Maximize2 size={18} /> Editar
              </button>
            )}
          </div>
          <div className="p-3 bg-gray-50">
            <img
              src={pngDataUrl || templateDistribucion}
              alt="Vista de distribución"
              className="w-full rounded-xl border border-gray-200 bg-white"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="font-extrabold text-gray-900 mb-3">Foto de torre completa</div>
          <PhotoUpload
            type="after"
            photo={fotoTorreDataUrl}
            onCapture={(data) => onSaveFoto?.(data)}
            onRemove={() => onSaveFoto?.('')}
          />
          <p className="text-xs text-gray-500 mt-2">Se guarda como evidencia junto al croquis.</p>
        </div>
      </div>
    )
  }

  // Fullscreen editor
  const viewportRef = useRef(null)
  const rafRef = useRef(null)

  const [objects, setObjects] = useState(() => scene?.objects || [])
  const [selectedId, setSelectedId] = useState(null)

  const [view, setView] = useState({ scale: 1, ox: 0, oy: 0 })
  const [viewReady, setViewReady] = useState(false)

  const pointersRef = useRef(new Map()) // pointerId -> {x,y,targetId}
  const gestureRef = useRef({ mode: null })

  const [placingType, setPlacingType] = useState(null)
  const [openPieces, setOpenPieces] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(true)

  // history (para Undo/Redo)
  const [history, setHistory] = useState(() => [scene?.objects || []])
  const [historyIndex, setHistoryIndex] = useState(0)
  const lastCommittedRef = useRef(scene?.objects || [])

  useEffect(() => {
    setObjects(scene?.objects || [])
    setHistory([scene?.objects || []])
    setHistoryIndex(0)
    lastCommittedRef.current = scene?.objects || []
  }, [scene])

  const selected = useMemo(() => objects.find(o => o.id === selectedId), [objects, selectedId])

  const scheduleObjects = (updater) => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      setObjects(prev => updater(prev))
    })
  }

  const commitHistory = (nextObjects) => {
    // Evita commits redundantes
    const prevJson = JSON.stringify(lastCommittedRef.current)
    const nextJson = JSON.stringify(nextObjects)
    if (prevJson === nextJson) return

    lastCommittedRef.current = nextObjects
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1)
      return [...base, nextObjects]
    })
    setHistoryIndex((i) => i + 1)
  }

  const undo = () => {
    if (historyIndex <= 0) return
    const nextIndex = historyIndex - 1
    const next = history[nextIndex]
    setHistoryIndex(nextIndex)
    setObjects(next)
    lastCommittedRef.current = next
    setSelectedId(null)
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    const next = history[nextIndex]
    setHistoryIndex(nextIndex)
    setObjects(next)
    lastCommittedRef.current = next
    setSelectedId(null)
  }

  const fit = () => {
    const vp = viewportRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    setView(fitView(rect.width, rect.height))
    setViewReady(true)
  }

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    const ro = new ResizeObserver(() => {
      if (!viewReady) fit()
    })
    ro.observe(vp)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewReady])

  useEffect(() => {
    if (!viewReady) fit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addPieceAt = (type, wx, wy) => {
    const p = byType(type)
    if (!p) return
    const id = `${type}-${Math.random().toString(36).slice(2, 9)}`
    const obj = {
      id,
      type,
      x: wx - p.w / 2,
      y: wy - p.h / 2,
      w: p.w,
      h: p.h,
      rot: 0,
      locked: false,
      z: objects.length + 1,
    }
    const next = [...objects, obj]
    setObjects(next)
    setSelectedId(id)
    commitHistory(next)
  }

  const updatePointer = (e, targetId = null) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, targetId })
  }

  const getTwoPointers = () => {
    const arr = Array.from(pointersRef.current.entries())
    if (arr.length < 2) return null
    return { a: arr[0], b: arr[1] }
  }

  const snapX = (obj) => {
    if (!snapEnabled) return obj
    const centerLine = WORLD_W / 2
    const cx = obj.x + obj.w / 2
    if (Math.abs(cx - centerLine) < 14) {
      return { ...obj, x: centerLine - obj.w / 2 }
    }
    return obj
  }

  const onViewportPointerDown = (e) => {
    // Colocar pieza (tap) — UX móvil
    if (placingType) {
      const rect = viewportRef.current.getBoundingClientRect()
      const { x, y } = screenToWorld(e.clientX, e.clientY, rect, view)
      addPieceAt(placingType, x, y)
      setPlacingType(null)
      return
    }

    // Si toca fondo, pan con 1 dedo
    if (e.target === viewportRef.current) {
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      updatePointer(e, null)
      gestureRef.current = {
        mode: 'pan',
        start: { x: e.clientX, y: e.clientY, ox: view.ox, oy: view.oy },
      }
      setSelectedId(null)
    }
  }

  const onViewportPointerMove = (e) => {
    const g = gestureRef.current
    if (!g?.mode) return

    updatePointer(e, pointersRef.current.get(e.pointerId)?.targetId || null)

    if (g.mode === 'pan') {
      e.preventDefault()
      const dx = e.clientX - g.start.x
      const dy = e.clientY - g.start.y
      setView(v => ({ ...v, ox: g.start.ox + dx, oy: g.start.oy + dy }))
      return
    }

    if (g.mode === 'pinch-view') {
      e.preventDefault()
      const two = getTwoPointers()
      if (!two) return
      const v1 = two.a[1]
      const v2 = two.b[1]
      const dx = v2.x - v1.x
      const dy = v2.y - v1.y
      const dist = Math.hypot(dx, dy)
      const ratio = dist / (g.start.dist || 1)
      const nextScale = clamp(g.start.scale * ratio, 0.25, 5)

      const rect = viewportRef.current.getBoundingClientRect()
      const cx = (v1.x + v2.x) / 2
      const cy = (v1.y + v2.y) / 2
      const before = screenToWorld(cx, cy, rect, { ...view, scale: g.start.scale, ox: g.start.ox, oy: g.start.oy })
      const ox = cx - rect.left - before.x * nextScale
      const oy = cy - rect.top - before.y * nextScale
      setView({ scale: nextScale, ox, oy })
      return
    }

    if (g.mode === 'drag-piece') {
      e.preventDefault()
      const dxScreen = e.clientX - g.start.x
      const dyScreen = e.clientY - g.start.y
      const dx = dxScreen / view.scale
      const dy = dyScreen / view.scale
      scheduleObjects(prev => prev.map(o => {
        if (o.id !== g.id) return o
        if (o.locked) return o
        return snapX({ ...o, x: g.start.ox + dx, y: g.start.oy + dy })
      }))
      return
    }

    if (g.mode === 'pinch-piece') {
      e.preventDefault()
      const two = getTwoPointers()
      if (!two) return
      const v1 = two.a[1]
      const v2 = two.b[1]
      const dx = v2.x - v1.x
      const dy = v2.y - v1.y
      const dist = Math.hypot(dx, dy)
      const ratio = clamp(dist / (g.start.dist || 1), 0.35, 2.8)
      scheduleObjects(prev => prev.map(o => {
        if (o.id !== g.id) return o
        if (o.locked) return o
        const w = Math.max(24, g.start.w * ratio)
        const h = Math.max(24, g.start.h * ratio)
        const x = g.start.cx - w / 2
        const y = g.start.cy - h / 2
        return snapX({ ...o, w, h, x, y })
      }))
    }
  }

  const onViewportPointerUp = (e) => {
    pointersRef.current.delete(e.pointerId)

    // Si tenemos dos dedos y levantamos uno, limpiamos gesto para evitar estados raros.
    if (pointersRef.current.size < 2 && (gestureRef.current.mode === 'pinch-view' || gestureRef.current.mode === 'pinch-piece')) {
      gestureRef.current = { mode: null }
      return
    }

    if (pointersRef.current.size === 0) {
      // fin de gesto principal
      const g = gestureRef.current
      gestureRef.current = { mode: null }

      // commit historia solo al finalizar drag/scale/pan relevante
      if (g?.mode === 'drag-piece' || g?.mode === 'pinch-piece') {
        // Espera a que el raf aplique cambios
        requestAnimationFrame(() => commitHistory(objects))
      }
    }
  }

  const onPiecePointerDown = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture?.(e.pointerId)

    setSelectedId(id)
    updatePointer(e, id)

    const obj = objects.find(o => o.id === id)
    if (!obj) return

    const two = getTwoPointers()
    if (two) {
      const t1 = two.a[1].targetId
      const t2 = two.b[1].targetId
      // Pinch sobre la misma pieza => escala pieza; de lo contrario, zoom/pan del lienzo.
      if (t1 && t2 && t1 === t2) {
        const dx = two.b[1].x - two.a[1].x
        const dy = two.b[1].y - two.a[1].y
        const dist = Math.hypot(dx, dy)
        gestureRef.current = {
          mode: 'pinch-piece',
          id,
          start: {
            dist,
            w: obj.w,
            h: obj.h,
            cx: obj.x + obj.w / 2,
            cy: obj.y + obj.h / 2,
          },
        }
        return
      }

      // pinch view
      const dx = two.b[1].x - two.a[1].x
      const dy = two.b[1].y - two.a[1].y
      const dist = Math.hypot(dx, dy)
      gestureRef.current = {
        mode: 'pinch-view',
        start: { dist, scale: view.scale, ox: view.ox, oy: view.oy },
      }
      return
    }

    // Drag con un dedo
    gestureRef.current = {
      mode: 'drag-piece',
      id,
      start: { x: e.clientX, y: e.clientY, ox: obj.x, oy: obj.y },
    }
  }

  const onPiecePointerMove = (e, id) => {
    const g = gestureRef.current
    if (!g?.mode) return
    if (g.id && g.id !== id) return
    onViewportPointerMove(e)
  }

  const onPiecePointerUp = (e) => {
    onViewportPointerUp(e)
  }

  const rotate = (dir) => {
    if (!selectedId) return
    const next = objects.map(o => (o.id === selectedId ? { ...o, rot: (o.rot + (dir === 'cw' ? 15 : -15)) } : o))
    setObjects(next)
    commitHistory(next)
  }

  const toggleLock = () => {
    if (!selectedId) return
    const next = objects.map(o => (o.id === selectedId ? { ...o, locked: !o.locked } : o))
    setObjects(next)
    commitHistory(next)
  }

  const duplicate = () => {
    if (!selected) return
    const id = `${selected.type}-${Math.random().toString(36).slice(2, 9)}`
    const next = [...objects, { ...selected, id, x: selected.x + 18, y: selected.y + 18, z: objects.length + 1, locked: false }]
    setObjects(next)
    setSelectedId(id)
    commitHistory(next)
  }

  const removeSelected = () => {
    if (!selectedId) return
    const next = objects.filter(o => o.id !== selectedId)
    setObjects(next)
    setSelectedId(null)
    commitHistory(next)
  }

  const clearAll = () => {
    const next = []
    setObjects(next)
    setSelectedId(null)
    commitHistory(next)
  }

  const exportPng = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = WORLD_W
    canvas.height = WORLD_H
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tpl = await loadImage(templateDistribucion)
    ctx.drawImage(tpl, 0, 0, WORLD_W, WORLD_H)

    // Orden por z
    const sorted = [...objects].sort((a, b) => (a.z || 0) - (b.z || 0))
    for (const o of sorted) {
      const p = byType(o.type)
      if (!p) continue
      const img = await loadImage(p.src)
      const cx = o.x + o.w / 2
      const cy = o.y + o.h / 2
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((o.rot || 0) * Math.PI / 180)
      ctx.drawImage(img, -o.w / 2, -o.h / 2, o.w, o.h)
      ctx.restore()
    }

    return canvas.toDataURL('image/png')
  }

  const save = async () => {
    const png = await exportPng()
    onSaveScene?.({ objects }, png)
  }

  const helpContent = (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs text-gray-700">
      <div className="font-extrabold text-gray-900 mb-2 flex items-center gap-2"><Hand size={14} /> Cómo usarlo</div>
      <ul className="space-y-1">
        <li>• Pulsa <span className="font-bold">Piezas</span> para agregar elementos.</li>
        <li>• <span className="font-bold">1 dedo</span>: mueve una pieza o desplaza el lienzo desde el fondo.</li>
        <li>• <span className="font-bold">2 dedos</span>: zoom/pan del lienzo.</li>
        <li>• <span className="font-bold">Pinch</span> sobre la pieza seleccionada (2 dedos) para cambiar tamaño.</li>
        <li>• Usa <span className="font-bold">Undo/Redo</span> si te equivocas.</li>
      </ul>
    </div>
  )

  return (
    <div className="pti-landscape-flex h-full gap-3 p-3 bg-white">
      <div className="flex-1 min-h-0">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-100 bg-white">
            <div className="font-extrabold text-gray-900 text-sm px-1">Distribución</div>
            <div className="flex-1" />

            <button type="button" onClick={() => setOpenPieces(true)} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2">
              <ImageIcon size={18} /> Piezas
            </button>

            <button type="button" onClick={undo} disabled={historyIndex <= 0} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Undo" title="Undo">
              <Undo2 size={18} />
            </button>
            <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Redo" title="Redo">
              <Redo2 size={18} />
            </button>

            <button type="button" onClick={() => setSnapEnabled(v => !v)} className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 active:scale-95 flex items-center gap-2 ${snapEnabled ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-600 bg-white'}`}>
              {snapEnabled ? <Check size={18} /> : <X size={18} />} Snap
            </button>

            <button type="button" onClick={fit} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white active:scale-95 flex items-center justify-center" aria-label="Centrar" title="Centrar">
              <Maximize2 size={18} />
            </button>

            <button type="button" onClick={() => setShowHelp(s => !s)} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white active:scale-95 flex items-center justify-center" aria-label="Ayuda" title="Ayuda">
              <HelpCircle size={18} />
            </button>

            <button type="button" onClick={save} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2">
              <Save size={18} /> Guardar
            </button>

            <button type="button" onClick={clearAll} className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-600 bg-white active:scale-95 flex items-center gap-2">
              <Trash2 size={18} /> Limpiar
            </button>
          </div>

          {showHelp && <div className="p-2">{helpContent}</div>}

          <div className="flex-1 min-h-0 bg-gray-50">
            <div
              ref={viewportRef}
              onPointerDown={onViewportPointerDown}
              onPointerMove={onViewportPointerMove}
              onPointerUp={onViewportPointerUp}
              onPointerCancel={onViewportPointerUp}
              className="relative w-full h-full overflow-hidden bg-white"
              style={{ touchAction: 'none' }}
            >
              {/* World */}
              <div
                className="absolute left-0 top-0"
                style={{
                  width: WORLD_W,
                  height: WORLD_H,
                  transformOrigin: '0 0',
                  transform: `translate(${view.ox}px, ${view.oy}px) scale(${view.scale})`,
                  backgroundImage: `url(${templateDistribucion})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 16,
                }}
              >
                {/* guía vertical suave (vista lateral) */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{ left: WORLD_W / 2, width: 2, background: 'rgba(59,130,246,0.12)' }}
                />

                {objects
                  .slice()
                  .sort((a, b) => (a.z || 0) - (b.z || 0))
                  .map((o) => {
                    const p = byType(o.type)
                    if (!p) return null
                    const isSel = o.id === selectedId
                    return (
                      <img
                        key={o.id}
                        src={p.src}
                        alt={p.label}
                        draggable={false}
                        onPointerDown={(e) => onPiecePointerDown(e, o.id)}
                        onPointerMove={(e) => onPiecePointerMove(e, o.id)}
                        onPointerUp={onPiecePointerUp}
                        onPointerCancel={onPiecePointerUp}
                        className={`absolute select-none ${o.locked ? 'opacity-90' : 'cursor-grab active:cursor-grabbing'} ${isSel ? 'ring-4 ring-primary/35 rounded-lg' : ''}`}
                        style={{
                          left: o.x,
                          top: o.y,
                          width: o.w,
                          height: o.h,
                          transform: `rotate(${o.rot || 0}deg)`,
                          touchAction: 'none',
                        }}
                      />
                    )
                  })}
              </div>

              {/* Hint placing */}
              {placingType && (
                <div className="absolute left-3 top-3 bg-white/95 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-800 shadow-sm">
                  Toca el croquis para colocar: {byType(placingType)?.label}
                </div>
              )}
            </div>
          </div>

          {/* Bottom mini toolbar */}
          <div className="p-2 border-t border-gray-100 bg-white flex items-center gap-2">
            <button type="button" onClick={() => rotate('ccw')} disabled={!selectedId} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Rotar izquierda" title="Rotar">
              <RotateCcw size={18} />
            </button>
            <button type="button" onClick={() => rotate('cw')} disabled={!selectedId} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Rotar derecha" title="Rotar">
              <RotateCw size={18} />
            </button>
            <button type="button" onClick={duplicate} disabled={!selectedId} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Duplicar" title="Duplicar">
              <Copy size={18} />
            </button>
            <button type="button" onClick={toggleLock} disabled={!selectedId} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Bloquear" title="Bloquear">
              {selected?.locked ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
            <button type="button" onClick={removeSelected} disabled={!selectedId} className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 bg-white disabled:opacity-40 active:scale-95 flex items-center justify-center" aria-label="Borrar" title="Borrar">
              <Trash2 size={18} />
            </button>

            <div className="flex-1" />

            {selected ? (
              <div className="text-[11px] text-gray-500">
                <span className="font-bold text-gray-800">Seleccionado:</span> {byType(selected.type)?.label}{selected.locked ? ' (bloqueado)' : ''}
              </div>
            ) : (
              <div className="text-[11px] text-gray-500">Tip: arrastra con 1 dedo. Zoom/pan con 2 dedos.</div>
            )}
          </div>
        </div>
      </div>

      {/* Side */}
      <div className="pti-landscape-side w-full space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-gray-900">Piezas</div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setOpenPieces(true)}
              className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center gap-2"
            >
              <ImageIcon size={18} /> Agregar
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">Todo el trabajo se hace en el editor. Usa “Agregar” para seleccionar piezas.</div>

          {placingType && (
            <button
              type="button"
              onClick={() => setPlacingType(null)}
              className="mt-3 w-full px-3 py-2 rounded-xl text-sm font-semibold border-2 border-primary text-primary bg-primary/5 active:scale-95 flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancelar colocación
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="font-extrabold text-gray-900 mb-3">Foto de torre completa</div>
          <PhotoUpload
            type="after"
            photo={fotoTorreDataUrl}
            onCapture={(data) => onSaveFoto?.(data)}
            onRemove={() => onSaveFoto?.('')}
          />
          <p className="text-xs text-gray-500 mt-2">Se guarda como evidencia junto al croquis.</p>
        </div>

        {pngDataUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 p-3">
            <div className="text-sm font-extrabold text-gray-900 mb-2">Vista guardada</div>
            <img src={pngDataUrl} alt="Vista guardada" className="w-full rounded-xl border border-gray-200" />
          </div>
        )}
      </div>

      <PiecePicker
        open={openPieces}
        onClose={() => setOpenPieces(false)}
        onPick={(type) => setPlacingType(type)}
      />
    </div>
  )
}
