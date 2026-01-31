
import { useEffect, useRef, useState } from 'react'
import { Eraser, Pencil, Undo2, Redo2, Trash2 } from 'lucide-react'

/**
 * DrawingCanvas (simple)
 * - Dibujo libre con lápiz y borrador sobre un canvas.
 * - Undo/Redo por lista de strokes (incluye borrador como tool='erase').
 * - Si backgroundImage existe, se pinta como fondo antes de los strokes.
 *
 * Props:
 *  - backgroundImage: string | null
 *  - initialDrawing: object | null
 *  - onChange: (drawingObject, pngDataUrl) => void
 *  - height: number (px)
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

  const [tool, setTool] = useState('pen') // pen | erase
  const [penSize, setPenSize] = useState(3)
  const [eraseSize, setEraseSize] = useState(14)

  const [strokes, setStrokes] = useState(() => initialDrawing?.strokes || [])
  const [redoStack, setRedoStack] = useState(() => initialDrawing?.redoStack || [])
  const [isDrawing, setIsDrawing] = useState(false)
  const [activeStroke, setActiveStroke] = useState(null)

  const isFullscreen = variant === 'fullscreen'

  const loadBackground = async () => {
    if (!backgroundImage) {
      bgRef.current = null
      return
    }
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        bgRef.current = img
        resolve()
      }
      img.src = backgroundImage
    })
  }

  const getCtx = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  const drawStroke = (ctx, stroke) => {
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
    rest.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.stroke()
    ctx.restore()
  }

  const renderAll = () => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    // fondo blanco
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // fondo plantilla
    if (bgRef.current) {
      ctx.drawImage(bgRef.current, 0, 0, canvas.width, canvas.height)
    }

    strokes.forEach(s => drawStroke(ctx, s))
    if (activeStroke) drawStroke(ctx, activeStroke)
  }

  const exportToPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return ''
    return canvas.toDataURL('image/png')
  }

  const commit = (nextStrokes, nextRedo) => {
    setStrokes(nextStrokes)
    setRedoStack(nextRedo)
  }

  const toPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // init / resize
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = async () => {
      const width = Math.min(maxWidth, wrap.clientWidth)
      canvas.width = width
      // En pantalla completa, damos prioridad al espacio para dibujar.
      const targetHeight = isFullscreen ? Math.max(320, wrap.clientHeight - 2) : height
      canvas.height = targetHeight

      // Ajuste de grosor de lápiz/borra según tamaño (mejor para móvil).
      // - Con plantilla (imagen), el trazo debe ser más fino.
      // - En blanco, un poco más grueso.
      const base = Math.max(1.5, Math.min(4, canvas.width / 420))
      const pen = backgroundImage ? (isFullscreen ? Math.max(1.5, base * 0.75) : Math.max(2, base * 0.9)) : (isFullscreen ? Math.max(2, base) : Math.max(2.5, base * 1.1))
      setPenSize(pen)
      setEraseSize(Math.max(10, pen * 5))

      await loadBackground()
      renderAll()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, height, maxWidth, variant])

  // re-render on strokes
  useEffect(() => {
    renderAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, activeStroke])

  // emit changes
  useEffect(() => {
    if (!onChange) return
    const drawingObject = { version: 1, strokes, redoStack }
    onChange(drawingObject, exportToPng())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, redoStack])

  const onPointerDown = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    setRedoStack([])
    const p = toPoint(e)
    const size = tool === 'erase' ? eraseSize : penSize
    setActiveStroke({ tool, size, points: [p] })
  }

  const onPointerMove = (e) => {
    if (!isDrawing || !activeStroke) return
    e.preventDefault()
    const p = toPoint(e)
    setActiveStroke((s) => ({ ...s, points: [...s.points, p] }))
  }

  const onPointerUp = () => {
    if (!isDrawing || !activeStroke) return
    setIsDrawing(false)
    commit([...strokes, activeStroke], [])
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

  return (
    <div className={isFullscreen ? 'bg-white h-full flex flex-col' : 'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'}>
      <div className={isFullscreen ? 'flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-100 sticky top-0 z-20 bg-white' : 'flex flex-wrap items-center gap-2 p-3 border-b border-gray-100'}>
        <Btn active={tool==='pen'} onClick={() => setTool('pen')} icon={Pencil} label="Lápiz" />
        <Btn active={tool==='erase'} onClick={() => setTool('erase')} icon={Eraser} label="Borrar" />

        <div className="flex-1" />

        <button type="button" onClick={undo} className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`} aria-label="Undo" title="Undo">
          <Undo2 size={18} />{!compactControls && ' Undo'}
        </button>
        <button type="button" onClick={redo} className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`} aria-label="Redo" title="Redo">
          <Redo2 size={18} />{!compactControls && ' Redo'}
        </button>
        <button type="button" onClick={clear} className={`${compactControls ? 'w-10 h-10' : 'px-3 py-2'} rounded-xl ${compactControls ? '' : 'text-sm font-semibold'} flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95`} aria-label="Limpiar" title="Limpiar">
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
            onPointerLeave={onPointerUp}
            className={isFullscreen ? 'touch-none w-full h-full' : 'touch-none'}
          />
        </div>
        {!hideFooter && !isFullscreen && (
          <p className="text-xs text-gray-500 mt-2">
            El dibujo se guarda automáticamente en el dispositivo.
          </p>
        )}
      </div>
    </div>
  )
}
