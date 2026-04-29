import { useState } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'

const ESTADOS_MX = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas',
]

const GRADOS_CALIDAD = [
  { value: 'EXTRA', label: 'Extra' },
  { value: 'PRIMERA', label: 'Primera' },
  { value: 'SEGUNDA', label: 'Segunda' },
  { value: 'COMERCIAL', label: 'Comercial' },
]

const ORDENAR_POR = [
  { value: 'fecha_desc', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
]

const HarvestFilter = ({ filtros, tiposCultivo, onFiltroChange, onReset }) => {
  const [abierto, setAbierto] = useState(false)

  const filtrosActivos = Object.entries(filtros).filter(([k, v]) =>
    !['page', 'size', 'ordenarPor'].includes(k) && v !== null && v !== '' && v !== undefined
  ).length

  const handleChange = (campo, valor) => {
    onFiltroChange({ [campo]: valor || null })
  }

  // ─── Contenido del panel ────────────────────────────────────────────────

  const panelContent = (
    <div className="flex flex-col gap-4">
      {/* Tipo de cultivo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tipo de cultivo
        </label>
        <select
          value={filtros.idCultivo || ''}
          onChange={(e) => handleChange('idCultivo', e.target.value ? Number(e.target.value) : null)}
          className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
        >
          <option value="">Todos los cultivos</option>
          {tiposCultivo.map((c) => (
            <option key={c.idCultivo} value={c.idCultivo}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Estado de la república */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Estado
        </label>
        <select
          value={filtros.estadoRepublica || ''}
          onChange={(e) => handleChange('estadoRepublica', e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
        >
          <option value="">Todo México</option>
          {ESTADOS_MX.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Precio (MXN)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="Mín"
            value={filtros.precioMin || ''}
            onChange={(e) => handleChange('precioMin', e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
          />
          <input
            type="number"
            min="0"
            placeholder="Máx"
            value={filtros.precioMax || ''}
            onChange={(e) => handleChange('precioMax', e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Grado de calidad */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Calidad
        </label>
        <select
          value={filtros.gradoCalidad || ''}
          onChange={(e) => handleChange('gradoCalidad', e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
        >
          <option value="">Cualquier calidad</option>
          {GRADOS_CALIDAD.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Sólo orgánico */}
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={filtros.esOrganico === true}
          onChange={(e) => handleChange('esOrganico', e.target.checked ? true : null)}
          className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm text-slate-700">Solo productos orgánicos 🌿</span>
      </label>

      {/* Ordenar por */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Ordenar por
        </label>
        <select
          value={filtros.ordenarPor || 'fecha_desc'}
          onChange={(e) => onFiltroChange({ ordenarPor: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
        >
          {ORDENAR_POR.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Botón limpiar */}
      {filtrosActivos > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-sm text-slate-600 border border-slate-300 rounded-lg py-3 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          <X size={14} />
          Limpiar filtros ({filtrosActivos})
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ─── Mobile: botón acordeón ─────────────────────────────────── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto((prev) => !prev)}
          className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 min-h-[44px]"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-green-600" />
            Filtros
            {filtrosActivos > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </span>
          {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {abierto && (
          <div className="mt-2 bg-white border border-slate-200 rounded-xl p-4">
            {panelContent}
          </div>
        )}
      </div>

      {/* ─── Desktop: sidebar fija ───────────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-green-600" />
              Filtros
            </h3>
            {filtrosActivos > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </div>
          {panelContent}
        </div>
      </aside>
    </>
  )
}

HarvestFilter.propTypes = {
  filtros: PropTypes.object.isRequired,
  tiposCultivo: PropTypes.arrayOf(
    PropTypes.shape({
      idCultivo: PropTypes.number,
      nombre: PropTypes.string,
    })
  ),
  onFiltroChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
}

HarvestFilter.defaultProps = {
  tiposCultivo: [],
}

export default HarvestFilter
