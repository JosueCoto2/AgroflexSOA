/**
 * CatalogoGrid — Grid principal del catálogo.
 * Maneja todos los estados: carga, vacío, error, sin resultados e infinite scroll.
 */
import { useEffect, useRef } from 'react'
import {
  PackageSearch, SearchX, AlertCircle, Loader2,
} from 'lucide-react'
import ProductCard  from './ProductCard'
import SkeletonCard from './SkeletonCard'

function EstadoCargando({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="w-16 h-16 bg-tinta-100 rounded-card flex items-center justify-center mb-5">
        <PackageSearch className="w-8 h-8 text-tinta-300" />
      </div>
      <p className="text-base font-bold text-tinta-600 mb-1">
        Aún no hay productos publicados
      </p>
      <p className="text-sm text-tinta-400 max-w-xs">
        Cuando un productor o proveedor publique un artículo, aparecerá aquí.
      </p>
    </div>
  )
}

function EstadoSinResultados({ onClearFilters }) {
  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="w-16 h-16 bg-tinta-100 rounded-card flex items-center justify-center mb-5">
        <SearchX className="w-8 h-8 text-tinta-300" />
      </div>
      <p className="text-base font-bold text-tinta-600 mb-1">
        Sin resultados
      </p>
      <p className="text-sm text-tinta-400 mb-5 max-w-xs">
        No encontramos productos que coincidan con tu búsqueda o filtros.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="px-4 py-2 text-sm font-semibold text-verde-700 border border-verde-200 rounded-btn hover:bg-verde-50 transition-all"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

function EstadoError({ onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="w-16 h-16 bg-red-50 rounded-card flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-base font-bold text-tinta-700 mb-1">
        No se pudo cargar el catálogo
      </p>
      <p className="text-sm text-tinta-400 mb-5 max-w-xs">
        Verifica tu conexión a internet e intenta de nuevo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-btn transition-all active:scale-95"
      >
        Reintentar
      </button>
    </div>
  )
}

function Grid({ productos, vista }) {
  const gridClass = vista === 'list'
    ? 'flex flex-col gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'

  return (
    <div className={gridClass}>
      {productos.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  )
}

function InfiniteScrollTrigger({ onLoadMore, loadingMore }) {
  const triggerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore()
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    const el = triggerRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore])

  return (
    <div ref={triggerRef} className="flex items-center justify-center py-8">
      {loadingMore && (
        <Loader2 className="w-6 h-6 text-verde-500 animate-spin" />
      )}
    </div>
  )
}

export default function CatalogoGrid({
  productos = [],
  loading,
  loadingMore,
  error,
  hasMore,
  vista = 'grid',
  hasFiltros = false,
  onLoadMore,
  onRetry,
  onClearFilters,
}) {
  if (loading) return <EstadoCargando />
  if (error)   return <EstadoError onRetry={onRetry} />
  if (!productos.length && hasFiltros) return <EstadoSinResultados onClearFilters={onClearFilters} />
  if (!productos.length) return <EstadoVacio />

  return (
    <div>
      <Grid productos={productos} vista={vista} />

      {hasMore && (
        <InfiniteScrollTrigger onLoadMore={onLoadMore} loadingMore={loadingMore} />
      )}

      {!hasMore && productos.length > 0 && (
        <p className="text-center text-xs text-tinta-400 py-8">
          Has visto todos los productos disponibles
        </p>
      )}
    </div>
  )
}
