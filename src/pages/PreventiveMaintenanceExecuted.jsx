import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import AppHeader from '../components/layout/AppHeader'
import FormMetaBar from '../components/layout/FormMetaBar'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import PhotoUpload from '../components/ui/PhotoUpload'
import SinglePhotoUpload from '../components/ui/SinglePhotoUpload'
import AutosaveIndicator from '../components/ui/AutosaveIndicator'
import { useAppStore } from '../hooks/useAppStore'
import { PM_EXECUTED_SITE_TYPES, groupActivities } from '../data/preventiveMaintenanceExecutedConfig'

function normalizeSiteType(value) {
  if (value === 'ROOFTOP' || value === 'Rooftop') return 'rooftop'
  if (value === 'RAWLAND' || value === 'Rawland') return 'rawland'
  return value
}

export default function PreventiveMaintenanceExecuted() {
  const {
    pmExecutedData,
    updatePMExecutedField,
    updatePMExecutedPhoto,
    showAutosave,
    showToast,
  } = useAppStore()

  const siteInfo = pmExecutedData?.siteInfo || {}
  const photos = pmExecutedData?.photos || {}
  const siteType = normalizeSiteType(siteInfo.tipoSitio || '')

  const groups = useMemo(() => groupActivities(), [])
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {}
    groups.forEach((g, idx) => { init[g.name] = idx === 0 }) // abre el primer grupo
    return init
  })

  const applicableItems = useMemo(() => {
    return groups.flatMap(g => g.items).filter((a) => {
      if (!siteType) return false
      return !!a.applies?.[siteType]
    })
  }, [groups, siteType])

  const completedCount = useMemo(() => {
    if (!siteType) return 0
    let done = 0
    for (const a of applicableItems) {
      const before = photos[`${a.id}-before`]
      const after = photos[`${a.id}-after`]
      if (before && after) done += 1
    }
    return done
  }, [applicableItems, photos, siteType])

  const progress = useMemo(() => {
    if (!siteType) return 0
    const total = applicableItems.length
    if (total === 0) return 0
    return Math.round((completedCount / total) * 100)
  }, [applicableItems.length, completedCount, siteType])

  const toggleGroup = (name) => setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }))

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Mantenimiento Preventivo"
        subtitle="Reporte de trabajos ejecutados"
        badge="Form 6"
        progress={progress}
        onMenuClick={() => showToast('Guardado automático activo', 'info')}
      />

      <main className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Datos del sitio */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-base font-bold text-gray-800">Datos del sitio</h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete la información base antes de capturar evidencias.
          </p>

          <div className="mt-4">
            <Input
              label="Proveedor"
              required
              placeholder="Ej: Proveedor del sitio"
              value={siteInfo.proveedor || ''}
              onChange={(e) => updatePMExecutedField('proveedor', e.target.value)}
            />

            <Input
              label="ID Sitio"
              required
              placeholder="Ej: PTI-CR-0001"
              value={siteInfo.idSitio || ''}
              onChange={(e) => updatePMExecutedField('idSitio', e.target.value)}
            />

            <Input
              label="Tipo de visita"
              required
              placeholder="Ej: Mantenimiento Preventivo"
              value={siteInfo.tipoVisita || ''}
              onChange={(e) => updatePMExecutedField('tipoVisita', e.target.value)}
            />

            <Input
              label="Nombre del sitio"
              required
              placeholder="Ej: Torre Heredia Centro"
              value={siteInfo.nombreSitio || ''}
              onChange={(e) => updatePMExecutedField('nombreSitio', e.target.value)}
            />

            <Select
              label="Tipo de sitio"
              required
              options={PM_EXECUTED_SITE_TYPES}
              value={siteType}
              onChange={(e) => updatePMExecutedField('tipoSitio', e.target.value)}
              successText="✓ Tipo de sitio seleccionado"
              errorText="⚠ Campo requerido"
            />

            <Input
              label="Dirección"
              placeholder="Opcional"
              value={siteInfo.direccion || ''}
              onChange={(e) => updatePMExecutedField('direccion', e.target.value)}
              required={false}
              successText="✓ Dirección registrada"
            />
          </div>
        </div>

        {/* Actividades */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Evidencias fotográficas</h2>
              <p className="text-xs text-gray-500 mt-1">
                Para cada actividad aplicable, capture <b>1 foto Antes</b> y <b>1 foto Después</b>.
              </p>
            </div>
            {siteType ? (
              <div className="text-right">
                <p className="text-xs text-gray-500">Progreso</p>
                <p className="text-sm font-bold text-gray-800">{completedCount}/{applicableItems.length}</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-xs text-gray-500">Seleccione</p>
                <p className="text-sm font-bold text-amber-600">Tipo de sitio</p>
              </div>
            )}
          </div>

          {!siteType && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-700 font-semibold">
                ⚠ Seleccione el <b>Tipo de sitio</b> para filtrar las actividades aplicables (Rooftop / Rawland).
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {groups.map((g) => {
              const items = g.items
              const totalApplicable = siteType ? items.filter(a => a.applies?.[siteType]).length : 0
              const doneApplicable = siteType
                ? items.filter(a => a.applies?.[siteType]).filter((a) => photos[`${a.id}-before`] && photos[`${a.id}-after`]).length
                : 0
              const isOpen = !!openGroups[g.name]

              return (
                <div key={g.name} className="rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.name)}
                    className={`w-full px-4 py-3 flex items-center justify-between ${isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'} transition-all`}
                  >
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{g.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {siteType ? (
                          <>Aplicables: <b>{doneApplicable}/{totalApplicable}</b></>
                        ) : (
                          <>Actividades: <b>{items.length}</b></>
                        )}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white space-y-4">
                      {items.map((a) => {
                        const applicable = siteType ? !!a.applies?.[siteType] : false
                        const before = photos[`${a.id}-before`]
                        const after = photos[`${a.id}-after`]
                        const complete = applicable && before && after

                        return (
                          <div
                            key={a.id}
                            className={`rounded-2xl border-2 p-4 transition-all ${
                              !siteType
                                ? 'border-gray-200 bg-gray-50'
                                : applicable
                                  ? complete
                                    ? 'border-emerald-500 bg-emerald-50/30'
                                    : 'border-gray-200 bg-white'
                                  : 'border-gray-200 bg-gray-50 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800">
                                  #{a.item} <span className="text-gray-500 font-semibold">· {a.photoLabel}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{a.name}</p>
                              </div>

                              {siteType && (
                                <div className="flex-shrink-0">
                                  {applicable ? (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${complete ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                      {complete ? '✓ Completo' : 'Pendiente'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-200 text-gray-600">
                                      No aplica
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {siteType && applicable ? (
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <PhotoUpload
                                  type="before"
                                  photo={before || null}
                                  onCapture={(data) => updatePMExecutedPhoto(a.id, 'before', data)}
                                  onRemove={() => updatePMExecutedPhoto(a.id, 'before', null)}
                                />
                                <PhotoUpload
                                  type="after"
                                  photo={after || null}
                                  onCapture={(data) => updatePMExecutedPhoto(a.id, 'after', data)}
                                  onRemove={() => updatePMExecutedPhoto(a.id, 'after', null)}
                                />
                              </div>
                            ) : (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500">
                                  {siteType
                                    ? 'Esta actividad no aplica para el tipo de sitio seleccionado.'
                                    : 'Seleccione el tipo de sitio para habilitar las evidencias.'}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {showAutosave && <AutosaveIndicator />}

      <div className="h-6" />
    </div>
  )
}
