import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, ChevronRight, AlertTriangle, Loader2, Building2 } from 'lucide-react'
import { fetchSitesDirect } from '../../lib/siteCatalogService'

/**
 * SiteSelector — lets the inspector pick a site from the catalog.
 *
 * Props:
 *   selectedSite  — { id, site_id, name, province, height_m, region_id } | null
 *   onSelect(site) — callback when a site is chosen
 */
export default function SiteSelector({ selectedSite, onSelect }) {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(!selectedSite)

  useEffect(() => {
    setLoading(true)
    fetchSitesDirect()
      .then(data => { setSites(data); setLoading(false) })
      .catch(e => { setError(e.message || 'Error al cargar sitios'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return sites
    const q = query.toLowerCase()
    return sites.filter(s =>
      s.site_id?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.province?.toLowerCase().includes(q)
    )
  }, [sites, query])

  // ── Already selected — show summary + change button ──
  if (selectedSite && !open) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                  {selectedSite.site_id}
                </span>
                {selectedSite.height_m && (
                  <span className="text-xs text-gray-400">{selectedSite.height_m}m</span>
                )}
              </div>
              <div className="font-bold text-sm text-gray-900">{selectedSite.name}</div>
              {selectedSite.province && (
                <div className="text-xs text-gray-400 mt-0.5">{selectedSite.province}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-primary font-bold px-3 py-1.5 rounded-xl border border-primary/30 hover:bg-primary/5 active:scale-95 transition-all flex-shrink-0"
          >
            Cambiar
          </button>
        </div>
      </div>
    )
  }

  // ── Selector open ──
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Seleccionar Sitio
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por ID, nombre o provincia..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-gray-50"
            autoComplete="off"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Cargando sitios...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-4 text-amber-700 bg-amber-50">
            <AlertTriangle size={18} />
            <div>
              <div className="text-sm font-bold">Error al cargar sitios</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && sites.length === 0 && (
          <div className="p-6 text-center">
            <AlertTriangle size={28} className="text-amber-400 mx-auto mb-2" />
            <div className="font-bold text-sm text-gray-800 mb-1">Sin sitios disponibles</div>
            <div className="text-xs text-gray-500">
              No hay sitios asignados a su empresa. Comuníquese con su supervisor.
            </div>
          </div>
        )}

        {!loading && !error && sites.length > 0 && filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            Sin resultados para "{query}"
          </div>
        )}

        {!loading && !error && filtered.map(site => (
          <button
            key={site.id}
            type="button"
            onClick={() => { onSelect(site); setOpen(false); setQuery('') }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-primary/5 transition-colors border-b border-gray-50 last:border-0 ${
              selectedSite?.id === site.id ? 'bg-primary/5' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex-shrink-0">
                  {site.site_id}
                </span>
                {site.height_m && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{site.height_m}m</span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">{site.name}</div>
              {site.province && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{site.province}</span>
                </div>
              )}
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Cancel if already had a selection */}
      {selectedSite && (
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery('') }}
            className="w-full py-2 text-sm text-gray-500 font-medium rounded-xl hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
