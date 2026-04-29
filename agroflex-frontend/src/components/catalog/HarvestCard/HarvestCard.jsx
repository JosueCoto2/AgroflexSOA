import { useNavigate } from 'react-router-dom'
import { MapPin, Star, Leaf, FlaskConical, ArrowRight, Package } from 'lucide-react'
import { formatPrecio } from '../../../utils/formatters'
import { ROUTES } from '../../../routes/routeConfig'

const FONT = { fontFamily: '"Inter", system-ui, sans-serif' }

// ── Smart emoji por nombre del producto ──────────────────────────────────────
const getEmoji = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('jitomate') || n.includes('tomate'))     return '🍅'
  if (n.includes('chile') || n.includes('jalap') || n.includes('serrano') || n.includes('habanero')) return '🌶️'
  if (n.includes('aguacate'))   return '🥑'
  if (n.includes('mango'))      return '🥭'
  if (n.includes('fresa'))      return '🍓'
  if (n.includes('maiz') || n.includes('maíz') || n.includes('elote')) return '🌽'
  if (n.includes('trigo'))      return '🌾'
  if (n.includes('lechuga'))    return '🥬'
  if (n.includes('zanahoria'))  return '🥕'
  if (n.includes('cebolla'))    return '🧅'
  if (n.includes('brocoli') || n.includes('brócoli')) return '🥦'
  if (n.includes('limón') || n.includes('limon'))     return '🍋'
  if (n.includes('naranja'))    return '🍊'
  if (n.includes('papa') || n.includes('patata'))     return '🥔'
  if (n.includes('repollo') || n.includes('col'))     return '🥬'
  if (n.includes('calabaz'))    return '🎃'
  if (n.includes('raban'))      return '🌱'
  if (n.includes('betabel'))    return '🫚'
  return '🌿'
}

// ── Color de acento por nombre ───────────────────────────────────────────────
const getAccentClass = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('jitomate') || n.includes('tomate') || n.includes('chile') || n.includes('fresa'))
    return { from: 'from-red-900/75', mid: 'via-red-900/30', accent: '#dc2626' }
  if (n.includes('aguacate') || n.includes('brocoli') || n.includes('lechuga') || n.includes('repollo'))
    return { from: 'from-green-900/75', mid: 'via-green-900/30', accent: '#16a34a' }
  if (n.includes('mango') || n.includes('naranja') || n.includes('zanahoria'))
    return { from: 'from-orange-900/75', mid: 'via-orange-900/30', accent: '#ea580c' }
  if (n.includes('maiz') || n.includes('maíz') || n.includes('trigo'))
    return { from: 'from-yellow-900/75', mid: 'via-yellow-900/30', accent: '#ca8a04' }
  if (n.includes('calabaz') || n.includes('betabel'))
    return { from: 'from-purple-900/75', mid: 'via-purple-900/30', accent: '#9333ea' }
  return { from: 'from-campo-700/85', mid: 'via-campo-600/40', accent: '#2A4828' }
}

// ── Estrellas de reputación ───────────────────────────────────────────────────
const StarRating = ({ value }) => {
  const v = Math.min(5, Math.max(0, Number(value) || 0))
  const full = Math.round(v)
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{ color: i <= full ? '#F5A623' : '#D0D8E4' }}
          fill={i <= full ? '#F5A623' : 'none'}
        />
      ))}
      <span className="ml-1 text-[10px] text-campo-400 font-semibold leading-none">
        {v > 0 ? v.toFixed(1) : 'Nuevo'}
      </span>
    </span>
  )
}

export default function HarvestCard({ lote, onVerDetalle }) {
  const navigate = useNavigate()

  if (!lote) return null

  const {
    idLote,
    titulo,
    precioUnitario,
    unidadVenta,
    municipio,
    estadoRepublica,
    nombreProductor,
    reputacionProductor,
    fotoPerfilProductor,
    imagenPrincipalUrl,
    stock,
    tipo,
  } = lote

  const emoji      = getEmoji(titulo)
  const accent     = getAccentClass(titulo)
  const isCosecha  = tipo !== 'suministro'
  const ubicacion  = [municipio, estadoRepublica].filter(Boolean).join(', ')
  const hayStock   = stock != null && Number(stock) >= 1
  const stockLabel = isCosecha
    ? (hayStock ? 'Disponible' : 'Agotado')
    : `${Number(stock ?? 0).toLocaleString('es-MX')} ${unidadVenta || ''}`

  const handlePress = () => {
    if (onVerDetalle) onVerDetalle(lote)
    else if (idLote) navigate(`${ROUTES.CATALOG}/${idLote}`)
  }

  return (
    <article
      style={FONT}
      className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover cursor-pointer border border-campo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-400"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${titulo}`}
      onClick={handlePress}
      onKeyDown={e => e.key === 'Enter' && handlePress()}
    >
      {/* ── Imagen ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/2] overflow-hidden bg-campo-100">

        {imagenPrincipalUrl ? (
          <img
            src={imagenPrincipalUrl}
            alt={titulo}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          /* Placeholder elegante cuando no hay imagen */
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-campo-50 via-verde-50 to-campo-100">
            <span
              className="text-6xl transition-transform duration-400 ease-out group-hover:scale-110 select-none"
              role="img"
              aria-label={titulo}
            >
              {emoji}
            </span>
          </div>
        )}

        {/* Gradiente sutil solo abajo para legibilidad de badges */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badge: tipo (top-left) */}
        <div className="absolute left-3 top-3">
          {isCosecha ? (
            <span className="inline-flex items-center gap-1 rounded-chip bg-verde-500/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              <Leaf className="w-3 h-3" />
              Cosecha
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-chip bg-info-600/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              <FlaskConical className="w-3 h-3" />
              Suministro
            </span>
          )}
        </div>

        {/* Emoji pill (top-right) */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-lg backdrop-blur-sm select-none">
          {emoji}
        </div>

        {/* Barra inferior del imagen: precio + stock ─────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-3 pt-6">

          {/* Precio en glassmorphism */}
          <div className="rounded-btn bg-black/40 backdrop-blur-md px-3 py-2 max-w-[65%]">
            <p className="text-[10px] font-medium text-white/70 leading-none mb-0.5 uppercase tracking-wide">
              {isCosecha ? 'Precio del lote' : `Por ${unidadVenta || 'unidad'}`}
            </p>
            <p className="text-xl font-black text-white leading-none tracking-tight">
              {precioUnitario != null ? formatPrecio(precioUnitario) : '—'}
            </p>
          </div>

          {/* Disponibilidad pill */}
          <div
            className={`flex items-center gap-1 rounded-chip px-2.5 py-1.5 text-[10px] font-bold backdrop-blur-sm ${
              hayStock
                ? 'bg-verde-400/90 text-white'
                : 'bg-campo-600/80 text-white/80'
            }`}
          >
            <Package className="w-3 h-3" />
            {stockLabel}
          </div>

        </div>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Nombre */}
        <h2 className="text-sm font-bold text-campo-700 leading-snug line-clamp-2 min-h-[2.5rem]">
          {titulo || 'Producto sin nombre'}
        </h2>

        {/* Ubicación */}
        {ubicacion ? (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-verde-400" />
            <span className="text-xs text-campo-400 truncate">{ubicacion}</span>
          </div>
        ) : null}

        {/* Separador + Productor + Rating ────────────────────────────────── */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-campo-100 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar productor */}
            <div className="w-7 h-7 rounded-btn bg-verde-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 overflow-hidden">
              {fotoPerfilProductor
                ? <img src={fotoPerfilProductor} alt={nombreProductor} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                : <span>{nombreProductor?.charAt(0)?.toUpperCase() ?? 'P'}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-campo-400 uppercase tracking-widest font-semibold leading-none mb-1">
                Productor
              </p>
              <p className="text-xs font-semibold text-campo-600 truncate leading-none">
                {nombreProductor || 'Productor'}
              </p>
            </div>
          </div>
          <StarRating value={reputacionProductor} />
        </div>

        {/* CTA ─────────────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); handlePress() }}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-btn bg-verde-400 py-2.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-verde-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde-400 focus-visible:ring-offset-1"
        >
          {isCosecha ? 'Ver lote' : 'Ver detalle'}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>

      </div>
    </article>
  )
}

