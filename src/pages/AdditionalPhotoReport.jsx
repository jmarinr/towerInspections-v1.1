/**
 * AdditionalPhotoReport.jsx
 * Reporte Adicional de Fotografías — formulario paso a paso
 * formCode: 'additional-photo-report'
 */
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, ChevronLeft, ChevronRight, Check, Plus, Trash2,
  X, Loader2, AlertCircle, UploadCloud, Info, RefreshCw,
} from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import FormMetaBar from '../components/layout/FormMetaBar'
import BottomNav from '../components/layout/BottomNav'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import FormLockedScreen from '../components/ui/FormLockedScreen'
import StepPills from '../components/layout/StepPills'
import { useAppStore, isDisplayablePhoto, recoverPhotoFromQueue } from '../hooks/useAppStore'
import { processImageFile } from '../lib/photoUtils'
import { PHOTO_CATEGORIES } from '../data/additionalPhotoConfig'
import { queueAssetUpload, flushSupabaseQueues } from '../lib/supabaseSync'

const FORM_CODE = 'additional-photo-report'
const FORM_ID   = 'additional-photo-report'

// ─────────────────────────────────────────────
// Single photo slot
// ─────────────────────────────────────────────
function PhotoSlot({ label, acronym, index, value, onChange, onRemove, required = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const inputId = `photo-${acronym}-${index}`
  const assetType = `photos:${acronym}:${index}`

  const recovered = useMemo(() => {
    if (isDisplayablePhoto(value)) return value
    if (value) return recoverPhotoFromQueue(FORM_CODE, assetType)
    return null
  }, [value, assetType])

  const displayable = recovered || (isDisplayablePhoto(value) ? value : null)
  const uploaded = !!value && !displayable

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    const result = await processImageFile(file)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      setTimeout(() => setError(null), 6000)
      return
    }
    onChange(result.dataUrl)
    // Queue upload immediately
    queueAssetUpload(FORM_CODE, assetType, result.dataUrl)
    flushSupabaseQueues({ formCode: FORM_CODE })
    setLoading(false)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
            {acronym}_{String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold text-gray-600">{label}</span>
          {required && <span className="text-red-400 text-xs">*</span>}
        </div>
        {value && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-6 h-6 rounded-lg bg-red-100 text-red-500 flex items-center justify-center active:scale-95"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>

      <input id={inputId} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

      {error && (
        <div className="flex items-start gap-2 p-2 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-xs font-semibold text-blue-600">Procesando...</span>
        </div>
      ) : displayable ? (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-emerald-500">
          <img src={displayable} alt={label} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
            <span className="text-[9px] font-mono font-bold text-white">{acronym}_{String(index + 1).padStart(2, '0')}</span>
          </div>
          <label htmlFor={inputId} className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-95">
            <RefreshCw size={14} className="text-white" />
          </label>
        </div>
      ) : uploaded ? (
        <label htmlFor={inputId} className="aspect-[4/3] rounded-xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center gap-1 cursor-pointer">
          <UploadCloud size={20} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">Foto guardada en nube</span>
          <span className="text-[10px] text-emerald-500">Toque para reemplazar</span>
        </label>
      ) : (
        <label htmlFor={inputId} className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Camera size={18} className="text-gray-400" />
          </div>
          <span className="text-xs font-semibold text-gray-600">Tomar foto</span>
        </label>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Category step — renders all photo slots
// ─────────────────────────────────────────────
function CategoryStep({ category, photos, onPhotoChange, onAddPhoto, onRemovePhoto }) {
  const { id: acronym, title, description, minPhotos, variable, subLabels, subGroups, hint, quality, emoji } = category

  // Ensure we always show at least minPhotos slots
  const slotCount = Math.max(photos.length, minPhotos)
  const slots = Array.from({ length: slotCount }, (_, i) => ({
    index: i,
    label: subLabels?.[i] ?? (subGroups ? `Foto ${i + 1}` : `Foto ${i + 1}`),
    value: photos[i] ?? null,
  }))

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
              <span className="text-[10px] font-mono font-bold bg-primary text-white px-2 py-0.5 rounded-lg flex-shrink-0">
                {acronym}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
            📷 Mín. {minPhotos} foto{minPhotos !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            🔍 {quality}
          </span>
          {variable && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
              ± Cantidad variable
            </span>
          )}
        </div>

        {/* Sub-groups legend (when applicable) */}
        {subGroups && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={12} className="text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vistas sugeridas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subGroups.map((sg) => (
                <span key={sg.key} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                  {acronym}_{sg.key}
                </span>
              ))}
            </div>
          </div>
        )}

        {hint && (
          <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">{hint}</p>
          </div>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => (
          <PhotoSlot
            key={`${acronym}-${slot.index}`}
            label={slot.label}
            acronym={acronym}
            index={slot.index}
            value={slot.value}
            onChange={(dataUrl) => onPhotoChange(acronym, slot.index, dataUrl)}
            onRemove={slot.index >= minPhotos ? () => onRemovePhoto(acronym, slot.index) : undefined}
            required={slot.index < minPhotos}
          />
        ))}
      </div>

      {/* Add photo button (variable categories) */}
      {variable && (
        <button
          type="button"
          onClick={() => onAddPhoto(acronym)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <Plus size={16} />
          Agregar foto adicional
        </button>
      )}

      {/* Completion badge */}
      {photos.filter(Boolean).length >= minPhotos && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <Check size={14} className="text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-bold text-emerald-700">
            {photos.filter(Boolean).length} foto{photos.filter(Boolean).length !== 1 ? 's' : ''} capturada{photos.filter(Boolean).length !== 1 ? 's' : ''} · Mínimo cumplido
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AdditionalPhotoReport() {
  const navigate = useNavigate()

  const isFormCompleted = useAppStore((s) => s.isFormCompleted)
  const additionalPhotoData = useAppStore((s) => s.additionalPhotoData || {})
  const setAdditionalPhotoField = useAppStore((s) => s.setAdditionalPhotoField)
  const setAdditionalPhoto = useAppStore((s) => s.setAdditionalPhoto)
  const addAdditionalPhotoSlot = useAppStore((s) => s.addAdditionalPhotoSlot)
  const removeAdditionalPhotoSlot = useAppStore((s) => s.removeAdditionalPhotoSlot)
  const resetFormDraft = useAppStore((s) => s.resetFormDraft)
  const finalizeForm = useAppStore((s) => s.finalizeForm)
  const showToast = useAppStore((s) => s.showToast)
  const formMeta = useAppStore((s) => s.formMeta)

  const locked = isFormCompleted(FORM_ID)

  const currentStepRaw = useAppStore((s) => s.additionalPhotoStep ?? 1)
  const setStep = (step) => useAppStore.setState({ additionalPhotoStep: step })

  const totalSteps = PHOTO_CATEGORIES.length
  const currentStep = Math.max(1, Math.min(Number(currentStepRaw) || 1, totalSteps))
  const currentCategory = PHOTO_CATEGORIES[currentStep - 1]

  // ── Progress ──
  const completedSteps = useMemo(() => {
    return PHOTO_CATEGORIES.map((cat) => {
      const photos = additionalPhotoData?.photos?.[cat.id] || []
      return photos.filter(Boolean).length >= cat.minPhotos
    })
  }, [additionalPhotoData])

  const overallProgress = useMemo(() => {
    const done = completedSteps.filter(Boolean).length
    return Math.round((done / totalSteps) * 100)
  }, [completedSteps, totalSteps])

  // ── Notes (free text field at end) ──
  const notes = additionalPhotoData?.notes || ''

  // ── Handlers ──
  const handlePhotoChange = useCallback((acronym, index, dataUrl) => {
    setAdditionalPhoto(acronym, index, dataUrl)
  }, [setAdditionalPhoto])

  const handleAddSlot = useCallback((acronym) => {
    addAdditionalPhotoSlot(acronym)
  }, [addAdditionalPhotoSlot])

  const handleRemoveSlot = useCallback((acronym, index) => {
    removeAdditionalPhotoSlot(acronym, index)
  }, [removeAdditionalPhotoSlot])

  const handlePrev = () => {
    if (currentStep > 1) setStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    const photos = additionalPhotoData?.photos?.[currentCategory.id] || []
    const captured = photos.filter(Boolean).length
    if (captured < currentCategory.minPhotos) {
      showToast(
        `Se requieren al menos ${currentCategory.minPhotos} foto(s) para "${currentCategory.title}"`,
        'error'
      )
      return
    }
    if (currentStep < totalSteps) {
      setStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinalize = async () => {
    // Validate all categories
    const missing = PHOTO_CATEGORIES.filter((cat) => {
      const photos = additionalPhotoData?.photos?.[cat.id] || []
      return photos.filter(Boolean).length < cat.minPhotos
    })
    if (missing.length > 0) {
      showToast(`Faltan fotos en: ${missing.slice(0, 2).map((c) => c.title).join(', ')}${missing.length > 2 ? '...' : ''}`, 'error')
      return
    }
    try {
      await finalizeForm('additional-photo')
      showToast('Reporte de fotos completado ✓', 'success')
      navigate('/')
    } catch (e) {
      showToast('Error al finalizar el formulario', 'error')
    }
  }

  const handleReset = () => {
    if (window.confirm('¿Desea eliminar todas las fotos y empezar de nuevo?')) {
      resetFormDraft('additional-photo')
      setStep(1)
    }
  }

  if (locked) {
    return (
      <FormLockedScreen
        title="Reporte de Fotos"
        formId={FORM_ID}
        onReset={handleReset}
      />
    )
  }

  const categoryPhotos = additionalPhotoData?.photos?.[currentCategory.id] || []

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24">
      <AppHeader title="Reporte de Fotos" subtitle={`${currentCategory.emoji} ${currentCategory.title}`} />
      <FormMetaBar formId={FORM_ID} formCode={FORM_CODE} />
      <AutosaveIndicator />

      {/* Overall progress bar */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-gray-500">
            {completedSteps.filter(Boolean).length} / {totalSteps} categorías completadas
          </span>
          <span className="text-[11px] font-bold text-primary">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="px-4 pt-3">
        <StepPills
          steps={PHOTO_CATEGORIES.map((cat, i) => ({
            id: cat.id,
            label: cat.id,
            emoji: cat.emoji,
          }))}
          currentStep={currentStep}
          completedSteps={PHOTO_CATEGORIES
            .map((_, i) => i + 1)
            .filter((i) => completedSteps[i - 1])}
          onStepClick={(i) => setStep(i)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pt-4 pb-2">
        <CategoryStep
          category={currentCategory}
          photos={categoryPhotos}
          onPhotoChange={handlePhotoChange}
          onAddPhoto={handleAddSlot}
          onRemovePhoto={handleRemoveSlot}
        />

        {/* Notes — shown on last step */}
        {currentStep === totalSteps && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Observaciones adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setAdditionalPhotoField('notes', e.target.value)}
              placeholder="Notas, condiciones especiales, aclaraciones..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        )}
      </main>

      {/* Navigation */}
      <BottomNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrev={handlePrev}
        onNext={currentStep < totalSteps ? handleNext : undefined}
        onFinalize={currentStep === totalSteps ? handleFinalize : undefined}
        prevDisabled={currentStep === 1}
        nextLabel={`Siguiente: ${currentStep < totalSteps ? PHOTO_CATEGORIES[currentStep]?.id : ''}`}
        finalizeLabel="Completar Reporte"
      />
    </div>
  )
}
