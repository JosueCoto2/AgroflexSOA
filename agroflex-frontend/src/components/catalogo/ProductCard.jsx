/**
 * ProductCard — Tarjeta reutilizable del catálogo.
 *
 * Props: { id, nombre, tipo, precio, unidad, imagen, ubicacion,
 *          vendedor, disponibilidad, stock, fechaPublicacion }
 */
import { Link } from 'react-router-dom'
import {
  Leaf, FlaskConical, MapPin, BadgeCheck,
  Eye, ShoppingCart, Package,
} from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio)

const formatStock = (stock, unidad) => {
  if (stock >= 1000) return `${(stock / 1000).toFixed(1)} k ${unidad}`
  return `${stock} ${unidad}`
}

const tiempoRelativo = (fecha) => {
  const diff = Date.now() - new Date(fecha).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1)  return 'Hace unos minutos'
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  return `Hace ${d} día${d !== 1 ? 's' : ''}`
}

function TipoBadge({ tipo }) {
  if (tipo === 'cosecha') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-verde-500/90 text-white text-[10px] font-bold rounded-chip backdrop-blur-sm">
        <Leaf className="w-2.5 h-2.5" />
        Cosecha
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold rounded-chip backdrop-blur-sm">
      <FlaskConical className="w-2.5 h-2.5" />
      Suministro
    </span>
  )
}

function DisponibilidadBadge({ disponibilidad }) {
  if (disponibilidad === 'disponible') return null
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-ambar-500/90 text-white text-[10px] font-bold rounded-chip backdrop-blur-sm">
      Limitado
    </span>
  )
}

export default function ProductCard({
  id,
  nombre,
  tipo,
  precio,
  unidad,
  imagen,
  ubicacion,
  vendedor,
  disponibilidad,
  stock,
  fechaPublicacion,
}) {
  const detailUrl = `${ROUTES.CATALOG}/${id}`

  return (
    <article className="group relative bg-white rounded-card shadow-card hover:-translate-y-1 hover:shadow-card-hover border border-tinta-100 overflow-hidden transition-all duration-200 flex flex-col">

      {/* ── Imagen con overlay de acciones */}
      <div className="relative aspect-[4/3] overflow-hidden bg-tinta-100">
        <img
          src={imagen ?? `https://placehold.co/400x300?text=Producto`}
          alt={nombre}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Sin+imagen'
          }}
        />

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <TipoBadge tipo={tipo} />
          <DisponibilidadBadge disponibilidad={disponibilidad} />
        </div>

        {/* Overlay hover con acciones rápidas */}
        <div className="absolute inset-0 bg-tinta-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            to={detailUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-tinta-900 text-xs font-bold rounded-btn hover:bg-tinta-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver detalle
          </Link>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-2 bg-verde-400 text-white text-xs font-bold rounded-btn hover:bg-verde-500 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {tipo === 'cosecha' ? 'Comprar' : 'Contactar'}
          </button>
        </div>
      </div>

      {/* ── Cuerpo de la card */}
      <div className="p-4 flex flex-col flex-1">

        <h3 className="text-sm font-bold text-tinta-800 line-clamp-2 leading-snug mb-2">
          {nombre}
        </h3>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl font-black text-verde-600 font-display leading-tight">
            {formatPrecio(precio)}
          </span>
          <span className="text-xs text-tinta-400 font-medium">/ {unidad}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-tinta-500 mt-auto">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-tinta-400 flex-shrink-0" />
            <span>{ubicacion?.municipio}, {ubicacion?.estado}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="truncate">{vendedor?.nombre}</span>
            {vendedor?.verificado && (
              <BadgeCheck className="w-3.5 h-3.5 text-verde-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 text-tinta-400">
            <Package className="w-3 h-3 flex-shrink-0" />
            <span>Stock: {formatStock(stock, unidad)}</span>
          </div>
          <span className="text-tinta-400 mt-0.5">{tiempoRelativo(fechaPublicacion)}</span>
        </div>

        {/* Botones — visibles en mobile */}
        <div className="flex gap-2 mt-3 lg:hidden">
          <Link
            to={detailUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-tinta-600 border border-tinta-200 rounded-btn hover:bg-tinta-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Detalle
          </Link>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-verde-400 rounded-btn hover:bg-verde-500 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {tipo === 'cosecha' ? 'Comprar' : 'Contactar'}
          </button>
        </div>
      </div>
    </article>
  )
}
