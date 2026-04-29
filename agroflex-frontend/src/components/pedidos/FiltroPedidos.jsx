/**
 * FiltroPedidos — Barra de búsqueda y filtros para la pantalla Mis Pedidos.
 */
import { Search, X, SlidersHorizontal } from 'lucide-react'

const ESTADOS = [
  { value: '',           label: 'Todos los estados' },
  { value: 'PENDIENTE',  label: 'Pendiente de pago' },
  { value: 'RETENIDO',   label: 'Pago retenido' },
  { value: 'EN_CAMINO',  label: 'En camino' },
  { value: 'ENTREGA',    label: 'Entrega pendiente' },
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'CANCELADO',  label: 'Cancelado' },
]

const TIPOS = [
  { value: '',          label: 'Todos los tipos' },
  { value: 'cosecha',   label: 'Cosechas' },
  { value: 'suministro', label: 'Suministros' },
]

export default function FiltroPedidos({ filtros, onChange }) {
  const hasFiltros = filtros.estado || filtros.tipo || filtros.buscar

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por ID o producto…"
          value={filtros.buscar}
          onChange={e => onChange({ buscar: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
        />
      </div>

      {/* Estado */}
      <div className="relative">
        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={filtros.estado}
          onChange={e => onChange({ estado: e.target.value })}
          className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all appearance-none cursor-pointer"
        >
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {/* Tipo */}
      <select
        value={filtros.tipo}
        onChange={e => onChange({ tipo: e.target.value })}
        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all appearance-none cursor-pointer"
      >
        {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {/* Limpiar */}
      {hasFiltros && (
        <button
          onClick={() => onChange({ estado: '', tipo: '', buscar: '' })}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl bg-white transition-colors"
        >
          <X className="w-4 h-4" />
          Limpiar
        </button>
      )}
    </div>
  )
}
