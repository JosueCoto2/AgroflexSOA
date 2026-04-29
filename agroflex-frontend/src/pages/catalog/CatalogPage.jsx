/**
 * CatalogPage — Página principal del marketplace AgroFlex.
 */
import { useState, useCallback } from 'react'
import { useProductos }          from '../../hooks/useProductos'
import HarvestCard               from '../../components/catalog/HarvestCard/HarvestCard'
import HarvestCardSkeleton       from '../../components/catalog/HarvestCard/HarvestCardSkeleton'
import FiltrosAvanzados          from '../../components/catalogo/FiltrosAvanzados'
import FABPublicar               from '../../components/catalogo/FABPublicar'
import BannerVendedor            from '../../components/catalogo/BannerVendedor'
import useAuthStore              from '../../store/authStore'

// ── Filter chip definitions ──────────────────────────────────────────────────
const CHIPS_TIPO = [
  { label: 'Todos',       value: ''           },
  { label: 'Cosechas',    value: 'cosecha'    },
  { label: 'Suministros', value: 'suministro' },
]

const CHIPS_ORDEN = [
  { label: 'Recientes',    value: 'recientes'   },
  { label: 'Menor precio', value: 'precio_asc'  },
  { label: 'Mayor precio', value: 'precio_desc' },
]

export default function CatalogPage() {
  const [filtrosAvanzadosOpen, setFiltrosAvanzadosOpen] = useState(false)

  const { user, isAuthenticated } = useAuthStore()
  const hora = new Date().getHours()
  const saludo = hora < 12 ? '¡Buenos días' : hora < 19 ? '¡Buenas tardes' : '¡Buenas noches'
  const nombreUser = user?.nombre || ''

  const {
    productos,
    loading,
    loadingMore,
    error,
    hasMore,
    filtros,
    setFiltros,
    loadMore,
    retry,
  } = useProductos()

  const handleSearch = useCallback((query) => {
    setFiltros({ buscar: query })
  }, [setFiltros])

  const handleClearFilters = useCallback(() => {
    setFiltros({ tipo: '', buscar: '', municipio: '', orden: 'recientes' })
  }, [setFiltros])

  const hasFiltros = !!filtros.tipo || !!filtros.buscar || !!filtros.municipio

  // ── Skeleton placeholders ──────────────────────────────────────────────────
  const Skeletons = () => (
    <div className="productos-grid">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <HarvestCardSkeleton key={i} />
      ))}
    </div>
  )

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4 select-none">🌾</span>
      <h3
        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}
        className="text-campo-700 text-base mb-2"
      >
        Sin resultados
      </h3>
      <p className="text-campo-400 text-sm mb-6">
        No encontramos lotes con los filtros actuales.
      </p>
      {hasFiltros && (
        <button
          type="button"
          className="btn-verde-outline"
          onClick={handleClearFilters}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )

  // ── Error state ────────────────────────────────────────────────────────────
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-tinta-500 text-sm mb-4">{error}</p>
      <button type="button" className="btn-verde-outline" onClick={retry}>
        Reintentar
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-campo-50">

      {/* ── Greeting strip ────────────────────────────────────────────────── */}
      {isAuthenticated && (
        <div className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl px-0 pt-6">
          <div className="rounded-[18px] bg-verde-500/95 border border-verde-400/30 shadow-[0_12px_28px_rgba(31,107,20,0.14)] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">
                {saludo}, {nombreUser}! 👋
              </p>
              <p className="text-[12px] text-white/80 mt-1">
                Prioriza tus lotes y pedidos rápidos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { n: user?.totalLotes || 0, l: 'Mis lotes' },
                { n: user?.pedidosActivos || 0, l: 'Pedidos' },
                { n: user?.reputacion ?? '—', l: 'Reputación' },
              ].map((item) => (
                <button
                  key={item.l}
                  type="button"
                  className="inline-flex min-w-[96px] flex-col items-center rounded-btn border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/15"
                >
                  <span className="text-sm font-bold leading-none">{item.n}</span>
                  <span className="text-[10px] text-white/75 uppercase tracking-[0.2em] mt-0.5">{item.l}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-campo-100 bg-white px-4 py-3 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.24em] text-tinta-500">Lotes activos</p>
              <p className="mt-2 text-2xl font-bold text-[#333333]">{productos.length}</p>
            </div>
            <div className="rounded-[18px] border border-campo-100 bg-white px-4 py-3 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.24em] text-tinta-500">Filtros</p>
              <p className="mt-2 text-2xl font-bold text-[#333333]">{hasFiltros ? 'Sí' : 'No'}</p>
            </div>
            <div className="rounded-[18px] border border-campo-100 bg-white px-4 py-3 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.24em] text-tinta-500">Orden</p>
              <p className="mt-2 text-2xl font-bold text-[#333333]">
                {filtros.orden === 'precio_asc' ? 'Precio' : filtros.orden === 'precio_desc' ? 'Precio' : 'Recientes'}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] bg-white border border-campo-100 shadow-card px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {CHIPS_TIPO.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={filtros.tipo === chip.value ? 'chip-on' : 'chip-off'}
                  onClick={() => setFiltros({ tipo: chip.value })}
                >
                  {chip.label}
                </button>
              ))}
              {CHIPS_ORDEN.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={filtros.orden === chip.value ? 'chip-on' : 'chip-off'}
                  onClick={() => setFiltros({ orden: chip.value })}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFiltrosAvanzadosOpen(true)}
              >
                Más filtros
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl px-0 pb-10 pt-6">

        {/* Results count */}
        {!loading && !error && productos.length > 0 && (
          <p className="text-verde text-xs font-medium mb-3">
            {productos.length} lotes disponibles
          </p>
        )}

        {/* Loading skeletons */}
        {loading && <Skeletons />}

        {/* Error */}
        {!loading && error && <ErrorState />}

        {/* Empty */}
        {!loading && !error && productos.length === 0 && <EmptyState />}

        {/* Product grid */}
        {!loading && !error && productos.length > 0 && (
          <div className="productos-grid">
            {productos.map((lote) => (
              <HarvestCard
                key={lote.idLote}
                lote={lote}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loadingMore && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="btn-verde-outline"
              onClick={loadMore}
            >
              Cargar más
            </button>
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center mt-6">
            <div className="w-6 h-6 rounded-full border-2 border-verde-400 border-t-transparent animate-spin" />
          </div>
        )}
      </main>

      {/* ── Filtros avanzados drawer ──────────────────────────────────────── */}
      <FiltrosAvanzados
        open={filtrosAvanzadosOpen}
        onClose={() => setFiltrosAvanzadosOpen(false)}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {/* ── FAB publicar ─────────────────────────────────────────────────── */}
      <FABPublicar />
    </div>
  )
}
