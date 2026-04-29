import { useState, useEffect, useRef } from 'react'
import { ChevronDown, X, MapPin, Loader2 } from 'lucide-react'
import { getMunicipios } from '../../../api/geoApi'

/**
 * Combobox de búsqueda de municipios de Puebla.
 *
 * Props:
 *   value       {string}   - municipio seleccionado actualmente
 *   onChange    {fn}       - callback(nombreMunicipio)
 *   error       {string}   - mensaje de error a mostrar
 *   placeholder {string}   - texto de placeholder
 */
export default function MunicipioSelect({
  value,
  onChange,
  error,
  placeholder = 'Busca o elige un municipio…',
}) {
  const [query,      setQuery]      = useState('')
  const [options,    setOptions]    = useState([])
  const [allOptions, setAllOptions] = useState([])
  const [open,       setOpen]       = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const wrapperRef = useRef(null)
  const inputRef   = useRef(null)

  // Carga inicial de todos los municipios
  useEffect(() => {
    getMunicipios()
      .then(res => {
        const nombres = res.data.map(m => m.nombre)
        setAllOptions(nombres)
        setOptions(nombres)
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  // Filtrar localmente mientras se escribe
  useEffect(() => {
    if (!query.trim()) {
      setOptions(allOptions)
    } else {
      const q = query.toLowerCase()
      setOptions(allOptions.filter(n => n.toLowerCase().includes(q)))
    }
  }, [query, allOptions])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        // Si el usuario escribió algo pero no eligió, limpiar query
        if (query && !value) setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, value])

  const handleSelect = (nombre) => {
    onChange(nombre)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    onChange('')        // resetear selección si el usuario empieza a escribir de nuevo
    setOpen(true)
  }

  const displayValue = value || query

  const borderCls = error
    ? 'border-red-400 bg-red-50 focus-within:ring-2 focus-within:ring-red-200'
    : 'border-slate-200 bg-white focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100'

  return (
    <div ref={wrapperRef} className="relative">
      {/* Campo de entrada */}
      <div
        className={`flex items-center w-full px-3 py-2.5 rounded-lg border text-sm transition-colors cursor-text ${borderCls}`}
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={loading ? 'Cargando municipios…' : placeholder}
          disabled={loading}
          className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
        />

        {/* Ícono de estado */}
        {loading ? (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
        ) : value ? (
          <button type="button" onClick={handleClear} className="p-0.5 rounded hover:bg-slate-100 text-slate-400 shrink-0">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
        )}
      </div>

      {/* Dropdown */}
      {open && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {fetchError ? (
            <div className="px-3 py-3 text-sm text-red-500 text-center">
              Error al cargar municipios. Verifica que el servicio esté activo.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-400 text-center">
              Sin resultados para "{query}"
            </div>
          ) : (
            options.map((nombre) => (
              <button
                key={nombre}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // evitar blur antes del click
                onClick={() => handleSelect(nombre)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-green-50 hover:text-green-700
                  ${value === nombre ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'}`}
              >
                {nombre}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
