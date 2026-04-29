/**
 * FiltrosAvanzados — Panel lateral deslizante de filtros avanzados.
 * Props: { open, onClose, filtros, onFiltrosChange }
 */
import { useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'

const CATEGORIAS_COSECHA = [
  'Hortalizas', 'Frutas', 'Granos y cereales', 'Chile y pimiento',
  'Leguminosas', 'Tubérculos', 'Hierbas y condimentos',
]

const CATEGORIAS_SUMINISTRO = [
  'Fertilizantes', 'Semillas', 'Plaguicidas', 'Herramientas',
  'Mallas y cubiertas', 'Sistemas de riego',
]

const MUNICIPIOS = ['Tepeaca', 'Acatzingo', 'Huixcolotla', 'Tecamachalco', 'Quecholac']

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function FiltrosAvanzados({ open, onClose, filtros, onFiltrosChange }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleReset = () => {
    onFiltrosChange({ tipo: '', buscar: '', municipio: '', orden: 'recientes' })
  }

  const activeCount = [filtros.tipo, filtros.municipio].filter(Boolean).length

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        style={FONT}
        className={`
          fixed top-0 right-0 h-full z-50 w-80 max-w-[92vw]
          bg-white border-l border-slate-200 shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div className="w-8 h-8 rounded-lg bg-verde-50 flex items-center justify-center flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-verde-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 leading-none">Filtros</h2>
            {activeCount > 0 && (
              <p className="text-xs text-verde-600 mt-0.5">{activeCount} activo{activeCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 bg-slate-50">

          <FilterSection title="Tipo de producto">
            <div className="flex flex-col gap-1.5">
              {[
                { value: '',           label: 'Todos los productos' },
                { value: 'cosecha',    label: 'Cosechas y Lotes'    },
                { value: 'suministro', label: 'Suministros y Tienda' },
              ].map(({ value, label }) => (
                <RadioOption
                  key={value}
                  name="tipo"
                  value={value}
                  label={label}
                  checked={filtros.tipo === value}
                  onChange={() => onFiltrosChange({ tipo: value })}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Municipio">
            <div className="flex flex-col gap-1.5">
              <RadioOption
                name="municipio"
                value=""
                label="Todos los municipios"
                checked={!filtros.municipio}
                onChange={() => onFiltrosChange({ municipio: '' })}
              />
              {MUNICIPIOS.map((m) => (
                <RadioOption
                  key={m}
                  name="municipio"
                  value={m}
                  label={m}
                  checked={filtros.municipio === m}
                  onChange={() => onFiltrosChange({ municipio: m })}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Categoría cosecha">
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_COSECHA.map((cat) => (
                <ChipOption key={cat} label={cat} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Categoría suministro">
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_SUMINISTRO.map((cat) => (
                <ChipOption key={cat} label={cat} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Vendedor">
            <label className="flex items-center gap-3 cursor-pointer bg-white rounded-xl px-3 py-3 border border-slate-200 hover:border-verde-300 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-verde-500 focus:ring-verde-400 accent-verde-500"
              />
              <span className="text-sm text-slate-700 font-medium">Solo vendedores verificados</span>
            </label>
          </FilterSection>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-btn transition-all"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-verde-400 hover:bg-verde-500 rounded-btn transition-all shadow-btn"
          >
            Aplicar
          </button>
        </div>
      </aside>
    </>
  )
}

function FilterSection({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">{title}</p>
      {children}
    </div>
  )
}

function RadioOption({ name, value, label, checked, onChange }) {
  return (
    <label className={`
      flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-all
      ${checked
        ? 'bg-verde-50 border-verde-300 text-verde-700'
        : 'bg-white border-slate-200 text-slate-700 hover:border-verde-200 hover:bg-slate-50'}
    `}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 border-slate-300 text-verde-500 focus:ring-verde-400 accent-verde-500"
      />
      <span className={`text-sm font-medium ${checked ? 'font-semibold text-verde-700' : 'text-slate-700'}`}>
        {label}
      </span>
      {checked && (
        <span className="ml-auto w-2 h-2 rounded-full bg-verde-500" />
      )}
    </label>
  )
}

function ChipOption({ label }) {
  return (
    <button
      type="button"
      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-chip hover:bg-verde-50 hover:border-verde-300 hover:text-verde-700 transition-all"
    >
      {label}
    </button>
  )
}
