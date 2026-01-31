import { useEffect, useMemo, useRef, useState } from 'react'
import { Eraser, Hand, Maximize2, Pencil, Redo2, Trash2, Undo2 } from 'lucide-react'

/**
 * DrawingCanvas (mobile-first)
 * - Dibujo libre + borrador sobre canvas
 * - Undo/Redo por lista de strokes (incluye borrador como tool='erase')
 * - Fondo opcional (plantilla)
 * - Modo "Dibujar" vs "Mover/Zoom" (pan + pinch)
 * - Export PNG + objeto de dibujo
 */
export default function DrawingCanvas({
  backgroundImage = null,
  initialDrawing = null,
  onChange,
  height = 620,
  maxWidth = 980,
  variant = 'card', // 'card' | 'fullscreen'
  hideFooter = false,
  rightControls = null,
  compactControls = false,
}) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const bgRef = useRef(null)

  const isFullscreen = variant === 'fullscreen'

  // Tools
  const [mode, setMode] = useState(() => initialDrawing?.mode || 'draw') // draw | move
  const [tool, setTool] = useState('pen') // pen | erase

  // Sizes are screen-space targets; we convert to world-space depending on zoom.
  const [penSizeScreen, setPenSizeScreen] = useState(3)
  const [eraseSizeScreen, setEraseSizeScreen] = useState(14)

  // Drawing history
  const [strokes, setStrokes] = useState(() => initialDrawing?.strokes || [])
  const [redoStack, setRedoStack] = useState(() => initialDrawing?.redoStack || [])
  const [activeStroke, setActiveStroke] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Viewport (pan/zoom)
  const [view, setView] = useState(() => initialDrawing?.view || { scale: 1, ox: 0, oy: 0 })
  const didInitViewRef = useRef(!!initialDrawing?.view)

  // World size: background image natural size, or a sensible default for blank
  const [world, setWorld] = useState(() => {
    if (initialDrawing?.world?.w && initialDrawing?.world?.h) return initialDrawing.world
    return backgroundImage ? { w: 1275, h: 1650 } : { w: 1400, h: 1000 }
  })

  // Pointer gesture tracking
  const pointersRef = useRef(new Map()) // pointerId -> {x,y}
  const gestureRef = useRef({ mode: null, start: null }) // 'pan' | 'pinch'

  const getCtx = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  const loadBackground = async () => {
    if (!backgroundImage) {
      bgRef.current = null
      return
    }
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        bgRef.current = img
        setWorld({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height })
        resolve()
      }
      img.src = backgroundImage
    })
  }

  const fitToScreen = (padding = 0.94) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scale = Math.min(
      (canvas.width / Math.max(1, world.w)) * padding,
      (canvas.height / Math.max(1, world.h)) * padding
    )
    const ox = (canvas.width - world.w * scale) / 2
    const oy = (canvas.height - world.h * scale) / 2
    setView({ scale, ox, oy })
  }

  const exportToPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return ''

    // Export at world resolution (crisp), independent of current zoom
    const out = document.createElement('canvas')
    out.width = Math.floor(world.w)
    out.height = Math.floor(world.h)
    const ctx = out.getContext('2d')

    // fondo blanco
    ctx.clearRect(0, 0, out.width, out.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out.width, out.height)

    // fondo plantilla
    if (bgRef.current) {
      ctx.drawImage(bgRef.current, 0, 0, out.width, out.height)
    }

    const drawStroke = (stroke) => {
      if (!stroke?.points?.length) return
      ctx.save()
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = stroke.size
      if (stroke.tool === 'erase') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = 'rgba(0,0,0,1)'
      } else {
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = '#111827'
      }
      ctx.beginPath()
      const [p0, ...rest] = stroke.points
      ctx.moveTo(p0.x, p0.y)
      rest.forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.stroke()
      ctx.restore()
    }

    strokes.forEach(drawStroke)

    return out.toDataURL('image/png')
  }

  const commit = (nextStrokes, nextRedo) => {
    setStrokes(nextStrokes)
    setRedoStack(nextRedo)
  }

  const drawStrokeOn = (ctx, stroke) => {
    if (!stroke?.points?.length) return
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = stroke.size
    if (stroke.tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = '#111827'
    }
    ctx.beginPath()
    const [p0, ...rest] = stroke.points
    ctx.moveTo(p0.x, p0.y)
    rest.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.stroke()
    ctx.restore()
  }

  const renderAll = () => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    // reset + fondo
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply viewport transform
    ctx.setTransform(view.scale, 0, 0, view.scale, view.ox, view.oy)

    // plantilla
    if (bgRef.current) {
      ctx.drawImage(bgRef.current, 0, 0, world.w, world.h)
    } else {
      // Fondo blanco en modo blank (ya está), opcional: grid suave en fullscreen
      if (isFullscreen) {
        ctx.save()
        ctx.globalAlpha = 0.05
        ctx.strokeStyle = '#111827'
        const step = 50
        for (let x = 0; x <= world.w; x += step) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, world.h)
          ctx.stroke()
        }
        for (let y = 0; y <= world.h; y += step) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(world.w, y)
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    strokes.forEach((s) => drawStrokeOn(ctx, s))
    if (activeStroke) drawStrokeOn(ctx, activeStroke)

    // Reset transform so overlays (if any) could be drawn in screen coords later.
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  const toWorldPoint = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left - view.ox) / Math.max(0.0001, view.scale)
    const y = (clientY - rect.top - view.oy) / Math.max(0.0001, view.scale)
    return { x, y }
  }

  // Initialize / resize
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = async () => {
      const width = Math.min(maxWidth, wrap.clientWidth)
      canvas.width = Math.floor(width)
      const targetHeight = isFullscreen ? Math.max(320, wrap.clientHeight - 2) : height
      canvas.height = Math.floor(targetHeight)

      // Ajuste de grosor (screen space) para móvil
      const base = Math.max(1.5, Math.min(4, canvas.width / 420))
      const pen = backgroundImage ? (isFullscreen ? Math.max(1.5, base * 0.7) : Math.max(2, base * 0.85)) : (isFullscreen ? Math.max(2, base) : Math.max(2.5, base * 1.1))
      setPenSizeScreen(pen)
      setEraseSizeScreen(Math.max(10, pen * 5))

      await loadBackground()

      // Fit only the first time (or if we don't have a saved view)
      if (!didInitViewRef.current) {
        fitToScreen(0.96)
        didInitViewRef.current = true
      }

      renderAll()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, height, maxWidth, variant])

  // Re-render when strokes/view changes
  useEffect(() => {
    renderAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, activeStroke, view, world])

  // Emit changes (autosave)
  useEffect(() => {
    if (!onChange) return
    const drawingObject = {
      version: 2,
      mode,
      world,
      view,
      strokes,
      redoStack,
    }
    onChange(drawingObject, exportToPng())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, redoStack, view, mode, world])

  const isMultiPointer = () => pointersRef.current.size >= 2

  const setPointer = (e) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }

  const getTwoPointers = () => {
    const arr = Array.from(pointersRef.current.values())
    if (arr.length < 2) return null
    const [a, b] = arr
    return { a, b }
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setPointer(e)

    if (mode === 'move') {
      setIsDrawing(false)
      setActiveStroke(null)

      if (isMultiPointer()) {
        const two = getTwoPointers()
        if (!two) return
        const dx = two.b.x - two.a.x
        const dy = two.b.y - two.a.y
        const dist = Math.hypot(dx, dy)
        const cx = (two.a.x + two.b.x) / 2
        const cy = (two.a.y + two.b.y) / 2
        gestureRef.current = {
          mode: 'pinch',
          start: { dist, scale: view.scale, ox: view.ox, oy: view.oy, cx, cy },
        }
      } else {
        gestureRef.current = {
          mode: 'pan',
          start: { x: e.clientX, y: e.clientY, ox: view.ox, oy: view.oy },
        }
      }
      return
    }

    // draw mode
    if (isMultiPointer()) {
      // ignore multi-touch in draw mode (user can switch to move/zoom)
      return
    }

    setIsDrawing(true)
    setRedoStack([])
    const p = toWorldPoint(e.clientX, e.clientY)
    const sizeScreen = tool === 'erase' ? eraseSizeScreen : penSizeScreen
    // Store size in world units so it stays consistent on screen under zoom
    const sizeWorld = sizeScreen / Math.max(0.0001, view.scale)
    setActiveStroke({ tool, size: sizeWorld, points: [p] })
  }

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    e.preventDefault()
    setPointer(e)

    if (mode === 'move') {
      const g = gestureRef.current
      if (!g?.mode) return

      if (g.mode === 'pan') {
        const dx = e.clientX - g.start.x
        const dy = e.clientY - g.start.y
        setView((v) => ({ ...v, ox: g.start.ox + dx, oy: g.start.oy + dy }))
        return
      }

      if (g.mode === 'pinch') {
        const two = getTwoPointers()
        if (!two) return
        const dx = two.b.x - two.a.x
        const dy = two.b.y - two.a.y
        const dist = Math.hypot(dx, dy)
        const ratio = dist / Math.max(1, g.start.dist)
        const nextScale = Math.max(0.35, Math.min(5.0, g.start.scale * ratio))

        // Zoom around center point
        const rect = canvasRef.current.getBoundingClientRect()
        const cx = g.start.cx - rect.left
        const cy = g.start.cy - rect.top

        // Convert screen center to world before and after
        const wx = (cx - g.start.ox) / Math.max(0.0001, g.start.scale)
        const wy = (cy - g.start.oy) / Math.max(0.0001, g.start.scale)
        const ox = cx - wx * nextScale
        const oy = cy - wy * nextScale

        setView({ scale: nextScale, ox, oy })
      }
      return
    }

    if (!isDrawing || !activeStroke) return
    const p = toWorldPoint(e.clientX, e.clientY)
    setActiveStroke((s) => ({ ...s, points: [...s.points, p] }))
  }

  const endPointer = (pointerId) => {
    pointersRef.current.delete(pointerId)
    if (pointersRef.current.size < 2 && gestureRef.current.mode === 'pinch') {
      gestureRef.current.mode = null
      gestureRef.current.start = null
    }
    if (pointersRef.current.size === 0) {
      gestureRef.current.mode = null
      gestureRef.current.start = null
    }
  }

  const onPointerUp = (e) => {
    e.preventDefault()
    endPointer(e.pointerId)

    if (mode === 'move') return

    if (!isDrawing || !activeStroke) return
    setIsDrawing(false)
    commit([...strokes, activeStroke], [])
    setActiveStroke(null)
  }

  const onPointerCancel = (e) => {
    endPointer(e.pointerId)
    setIsDrawing(false)
    setActiveStroke(null)
  }

  const Btn = ({ active, onClick, icon: Icon, label }) => {
    const base = compactControls
      ? 'w-10 h-10 rounded-xl flex items-center justify-center'
      : 'px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2'
    const activeCls = active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 bg-white'
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} border-2 active:scale-95 ${activeCls}`}
        aria-label={label}
        title={label}
      >
        <Icon size={18} />
        {!compactControls && <span>{label}</span>}
      </button>
    )
  }

  const undo = () => {
    if (!strokes.length) return
    const last = strokes[strokes.length - 1]
    commit(strokes.slice(0, -1), [...redoStack, last])
  }

  const redo = () => {
    if (!redoStack.length) return
    const last = redoStack[redoStack.length - 1]
    commit([...strokes, last], redoStack.slice(0, -1))
  }

  const clear = () => commit([], [])

  const drawLabel = useMemo(() => (mode === 'draw' ? 'Dibujar' : 'Mover/Zoom'), [mode])

  return (
    <div className={isFullscreen ? 'bg-white h-full flex flex-col' : 'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'}>
      <div className={isFullscreen ? 'flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-100 sticky top-0 z-20 bg-white' : 'flex flex-wrap items-center gap-2 p-3 border-b border-gray-100'}>
        <Btn active={mode === 'draw'} onClick={() => setMode('draw')} icon={Pencil} label="Dibujar" />
        <Btn active={mode === 'move'} onClick={() => setMode('move')} icon={Hand} label="Mover" />

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <Btn active={tool === 'pen'} onClick={() => setTool('pen')} icon={Pencil} label="Lápiz" />
        <Btn active={tool === 'erase'} onClick={() => setTool('erase')} icon={Eraser} label="Borrar" />

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => fitToScreen(0.96)}
          className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`}
          aria-label="Ajustar"
          title="Ajustar"
        >
          <Maximize2 size={18} />{!compactControls && ' Ajustar'}
        </button>

        <button
          type="button"
          onClick={undo}
          className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`}
          aria-label="Deshacer"
          title="Deshacer"
        >
          <Undo2 size={18} />{!compactControls && ' Deshacer'}
        </button>
        <button
          type="button"
          onClick={redo}
          className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`}
          aria-label="Rehacer"
          title="Rehacer"
        >
          <Redo2 size={18} />{!compactControls && ' Rehacer'}
        </button>
        <button
          type="button"
          onClick={clear}
          className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`}
          aria-label="Limpiar"
          title="Limpiar"
        >
          <Trash2 size={18} />{!compactControls && ' Limpiar'}
        </button>

        {rightControls}
      </div>

      <div ref={wrapRef} className={isFullscreen ? 'flex-1 bg-gray-50 p-0' : 'p-3 bg-gray-50'}>
        <div className={isFullscreen ? 'w-full h-full overflow-hidden bg-white' : 'w-full overflow-hidden rounded-xl border border-gray-200 bg-white'}>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onPointerLeave={(e) => {
              // pointerleave may fire while still captured; keep it safe
              if (mode !== 'move') onPointerUp(e)
            }}
            className={isFullscreen ? 'touch-none w-full h-full' : 'touch-none'}
            style={{ touchAction: 'none' }}
          />
        </div>

        {!hideFooter && !isFullscreen && (
          <p className="text-xs text-gray-500 mt-2">
            {drawLabel}. El contenido se guarda automáticamente.
          </p>
        )}
      </div>
    </div>
  )
}
