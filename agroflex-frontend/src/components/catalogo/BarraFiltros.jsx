/**
 * BarraFiltros — Barra sticky de búsqueda, filtros y tabs del catálogo.
 * Sticky justo debajo del TopNavbar (top-14 en mobile, top-[60px] en desktop).
 */
import { useState, useRef } from 'react'
import { SlidersHorizontal, LayoutGrid, List, Search, X } from 'lucide-react'

const TABS = [
  { value: '',           label: 'Todos' },
  { value: 'cosecha',    label: 'Cosechas' },
  { value: 'suministro', label: 'Suministros' },
]

const MUNICIPIOS = [
  { value: '', label: 'Municipio' },
  { value: 'Tepeaca',      label: 'Tepeaca' },
  { value: 'Acatzingo',    label: 'Acatzingo' },
  { value: 'Huixcolotla',  label: 'Huixcolotla' },
]

const ORDEN_OPTIONS = [
  { value: 'recientes',   label: 'Recientes' },
  { value: 'precio_asc',  label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
]

export default function BarraFiltros({
  filtros,
  onFiltrosChange,
  vista = 'grid',
  onVistaChange,
  onOpenFiltrosAvanzados,
  onSearch,
}) {
  const [query, setQuery] = useState(filtros.buscar ?? '')
  const inputRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  const selectClass =
    'text-xs font-medium text-tinta-200 bg-tinta-700 border border-tinta-600 rounded-chip px-3 py-1.5 outline-none focus:border-verde-500 transition-all cursor-pointer'

  return (
    <div className="sticky top-14 lg:top-[60px] z-10 bg-tinta-900 border-b border-tinta-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Fila 1: Búsqueda */}
        <div className="pt-3 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, municipio, productor…"
              className="
                w-full pl-9 pr-9 py-2.5 text-sm
                bg-tinta-800 border border-tinta-700 rounded-card
                text-tinta-100 placeholder-white/30
                outline-none transition-all
                focus:bg-tinta-700 focus:border-verde-500 focus:ring-2 focus:ring-verde-500/20
              "
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* ── Fila 2: Tabs */}
        <div className="flex items-center gap-1 pb-1 overflow-x-auto scrollbar-none">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onFiltrosChange({ tipo: value })}
              className={[
                'whitespace-nowrap px-4 py-1.5 rounded-btn text-sm font-semibold transition-all',
                filtros.tipo === value
                  ? 'bg-verde-400 text-white'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/8',
              ].join(' ')}
            >
              {label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Filtros quick */}
          <select
            value={filtros.municipio ?? ''}
            onChange={(e) => onFiltrosChange({ municipio: e.target.value })}
            className={selectClass}
          >
            {MUNICIPIOS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filtros.orden ?? 'recientes'}
            onChange={(e) => onFiltrosChange({ orden: e.target.value })}
            className={selectClass}
          >
            {ORDEN_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenFiltrosAvanzados}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white/70 border border-tinta-600 bg-tinta-700 rounded-chip hover:bg-tinta-600 hover:text-white transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Vista */}
          <div className="flex items-center gap-0.5 bg-tinta-700 rounded-chip p-0.5">
            <button
              type="button"
              onClick={() => onVistaChange('grid')}
              className={`w-7 h-7 flex items-center justify-center rounded-sm transition-all ${
                vista === 'grid' ? 'bg-tinta-600 text-verde-400' : 'text-white/45 hover:text-white/80'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onVistaChange('list')}
              className={`w-7 h-7 flex items-center justify-center rounded-sm transition-all ${
                vista === 'list' ? 'bg-tinta-600 text-verde-400' : 'text-white/45 hover:text-white/80'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
