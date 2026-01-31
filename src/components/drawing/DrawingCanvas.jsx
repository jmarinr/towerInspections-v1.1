
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
}) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const bgRef = useRef(null)

  const [tool, setTool] = useState('pen') // pen | erase
  const [penSize] = useState(4)
  const [eraseSize] = useState(18)

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
      const targetHeight = isFullscreen ? Math.max(260, wrap.clientHeight - 4) : height
      canvas.height = targetHeight
      await loadBackground()
      renderAll()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage, height])

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
    setIsDrawing(true)
    setRedoStack([])
    const p = toPoint(e)
    const size = tool === 'erase' ? eraseSize : penSize
    setActiveStroke({ tool, size, points: [p] })
  }

  const onPointerMove = (e) => {
    if (!isDrawing || !activeStroke) return
    const p = toPoint(e)
    setActiveStroke((s) => ({ ...s, points: [...s.points, p] }))
  }

  const onPointerUp = () => {
    if (!isDrawing || !activeStroke) return
    setIsDrawing(false)
    commit([...strokes, activeStroke], [])
    setActiveStroke(null)
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
        <button type="button" onClick={() => setTool('pen')} className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-2 active:scale-95 ${tool==='pen' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 bg-white'}`}>
          <Pencil size={18} /> Lápiz
        </button>
        <button type="button" onClick={() => setTool('erase')} className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-2 active:scale-95 ${tool==='erase' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 bg-white'}`}>
          <Eraser size={18} /> Borrar
        </button>

        <div className="flex-1" />

        <button type="button" onClick={undo} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95">
          <Undo2 size={18} /> Undo
        </button>
        <button type="button" onClick={redo} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95">
          <Redo2 size={18} /> Redo
        </button>
        <button type="button" onClick={clear} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-2 border-gray-200 text-gray-600 bg-white active:scale-95">
          <Trash2 size={18} /> Limpiar
        </button>

        {rightControls}
      </div>

      <div ref={wrapRef} className={isFullscreen ? 'flex-1 bg-gray-50 p-2' : 'p-3 bg-gray-50'}>
        <div className={isFullscreen ? 'w-full h-full overflow-hidden rounded-xl border border-gray-200 bg-white' : 'w-full overflow-hidden rounded-xl border border-gray-200 bg-white'}>
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
