/**
 * HarvestDetailPage — Página de detalle de producto del catálogo.
 * Ruta: /catalog/:id
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, BadgeCheck,
  ShoppingCart, Share2, Leaf, FlaskConical, Clock, Phone, MessageCircle,
  X, CheckCircle2, Star, Package, ChevronRight,
} from 'lucide-react'
import { productoService } from '../../services/productoService'
import { ROUTES }          from '../../routes/routeConfig'
import { useAuth }         from '../../hooks/useAuth'
import useOrderStore       from '../../store/orderStore'

const FONT = { fontFamily: '"Inter", system-ui, sans-serif' }

// ── Helpers
const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio)

const tiempoRelativo = (fecha) => {
  const diff = Date.now() - new Date(fecha).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1)  return 'Hace unos minutos'
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  return `Hace ${d} día${d !== 1 ? 's' : ''}`
}

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
  return '🌿'
}

const getGradient = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('jitomate') || n.includes('tomate') || n.includes('chile') || n.includes('fresa'))
    return 'from-red-950 via-red-900/60 to-transparent'
  if (n.includes('aguacate') || n.includes('brocoli') || n.includes('lechuga') || n.includes('repollo'))
    return 'from-green-950 via-green-900/60 to-transparent'
  if (n.includes('mango') || n.includes('naranja') || n.includes('zanahoria'))
    return 'from-orange-950 via-orange-900/60 to-transparent'
  if (n.includes('maiz') || n.includes('maíz') || n.includes('trigo'))
    return 'from-yellow-950 via-yellow-900/60 to-transparent'
  if (n.includes('calabaz'))
    return 'from-purple-950 via-purple-900/60 to-transparent'
  return 'from-campo-700 via-campo-700/60 to-transparent'
}

// ── Estrellas
const StarRating = ({ value }) => {
  const v = Math.min(5, Math.max(0, Number(value) || 0))
  const full = Math.round(v)
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="w-4 h-4"
          style={{ color: i <= full ? '#F5A623' : '#D0D8E4' }}
          fill={i <= full ? '#F5A623' : 'none'}
        />
      ))}
      <span className="ml-1 text-xs text-campo-400 font-semibold">
        {v > 0 ? v.toFixed(1) : 'Nuevo'}
      </span>
    </span>
  )
}

// ── Componente principal
export default function HarvestDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { isAuthenticated } = useAuth()

  const [producto,  setProducto]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [comprando, setComprando] = useState(false)
  const [ordenError, setOrdenError] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [cantidadPedido, setCantidadPedido] = useState(1)
  const { crearOrden, fetchMisPedidos } = useOrderStore()

  useEffect(() => {
    setLoading(true)
    setError(null)
    productoService.getById(id)
      .then(data => {
        if (!data) setError('Producto no encontrado.')
        else setProducto(data)
      })
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)            return <DetailSkeleton />
  if (error || !producto) return <NotFound message={error} />

  const isCosecha = producto.tipo === 'cosecha'
  const TipoIcon  = isCosecha ? Leaf : FlaskConical
  const emoji     = getEmoji(producto.nombre)
  const gradient  = getGradient(producto.nombre)
  const hayStock  = Number(producto.stock ?? 0) >= 1
  const stockMax  = Math.max(0, Number(producto.stock ?? 0))
  const subtotal  = isCosecha ? (producto.precio || 0) : (producto.precio || 0) * cantidadPedido
  const ubicacionText = [producto.ubicacion?.municipio, producto.ubicacion?.estado].filter(Boolean).join(', ') || 'Ubicación no especificada'

  const handleComprar = () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return }
    if (!hayStock) { setOrdenError('Este producto no tiene stock disponible.'); return }
    setOrdenError(null)
    setCantidadPedido(1)
    setMostrarModal(true)
  }

  const handleConfirmarPedido = async () => {
    const idVendedor = producto.vendedor?.id ? Number(producto.vendedor.id) : null
    const idProducto = Number(producto.id)
    if (!idVendedor || isNaN(idVendedor) || !idProducto || isNaN(idProducto)) {
      setOrdenError('Producto de demostración — conéctate al catálogo real para comprar')
      setMostrarModal(false)
      return
    }
    setComprando(true)
    setMostrarModal(false)
    setOrdenError(null)
    try {
      const tipoProducto = isCosecha ? 'COSECHA_LOTE' : 'SUMINISTRO'
      const orden = await crearOrden({
        idVendedor,
        items: [{ idProducto, tipoProducto, cantidad: isCosecha ? 1 : cantidadPedido }],
        metodoPago: 'STRIPE',
      })
      if (orden && orden.id) { navigate(`/pagar/${orden.id}`); return }
    } catch (err) {
      let msg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al procesar la compra'
      const status = err.response?.status
      if (status === 409 || /stock insuficiente|disponible/i.test(msg)) {
        const disponible = err.response?.data?.disponible ?? null
        msg = disponible != null
          ? `Stock insuficiente. Solo quedan ${disponible} ${producto?.unidad ?? 'unidades'} disponibles.`
          : 'Stock insuficiente para la cantidad solicitada.'
      } else if (/Exception|Stack|Error:|ECONN|Network|timeout|failed|axios|sql|database|unauthorized|forbidden|denied|invalid|token|jwt/i.test(msg)) {
        msg = null
      }
      try {
        await fetchMisPedidos()
        const ordenes = useOrderStore.getState().ordenes
        const ahora = Date.now()
        const ordenReciente = ordenes.find(o => o.fechaCreacion && ahora - new Date(o.fechaCreacion).getTime() < 90_000)
        if (ordenReciente?.id) { navigate(`/pagar/${ordenReciente.id}`); return }
      } catch { /* silent */ }
      setOrdenError(msg ?? 'No se pudo procesar la compra. Revisa "Mis Pedidos" antes de intentar de nuevo.')
    } finally {
      setComprando(false)
    }
  }

  const getWhatsappUrl = (contacto) => {
    if (!contacto) return null
    const digits = contacto.replace(/\D/g, '')
    if (digits.length < 8) return null
    const numero = digits.length === 10 ? `52${digits}` : digits
    const texto  = encodeURIComponent(`Hola, vi tu publicación "${producto.nombre}" en AgroFlex y me gustaría obtener más información.`)
    return `https://wa.me/${numero}?text=${texto}`
  }

  const whatsappUrl = getWhatsappUrl(producto?.contacto)

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: producto.nombre, url: window.location.href })
    else navigator.clipboard?.writeText(window.location.href)
  }

  return (
    <div className="min-h-screen bg-campo-50 flex flex-col" style={FONT}>

      {/* ══════════════════ MODAL DE CONFIRMACIÓN ══════════════════ */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-card w-full max-w-sm shadow-2xl overflow-hidden animate-fade-up">

            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-campo-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-btn bg-verde-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-verde-600" />
                </div>
                <h2 className="text-sm font-bold text-campo-700">Confirmar pedido</h2>
              </div>
              <button onClick={() => setMostrarModal(false)}
                className="w-8 h-8 rounded-btn hover:bg-campo-100 flex items-center justify-center text-campo-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-btn bg-campo-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                {producto.imagen
                  ? <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                  : <span>{emoji}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-campo-700 truncate">{producto.nombre}</p>
                <p className="text-xs text-campo-400 mt-0.5 truncate">{producto.vendedor?.nombre ?? 'Productor'}</p>
                <span className={`mt-1 inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-[10px] font-bold text-white ${isCosecha ? 'bg-verde-500' : 'bg-info-600'}`}>
                  {isCosecha ? <Leaf className="w-2.5 h-2.5" /> : <FlaskConical className="w-2.5 h-2.5" />}
                  {isCosecha ? 'Cosecha' : 'Suministro'}
                </span>
              </div>
            </div>

            <div className="mx-5 mb-4 rounded-btn bg-campo-50 border border-campo-100 divide-y divide-campo-100">
              {!isCosecha && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-campo-400 font-medium">Cantidad</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCantidadPedido(v => Math.max(1, v - 1))}
                      className="w-7 h-7 rounded-btn bg-campo-200 hover:bg-campo-300 flex items-center justify-center text-sm font-bold text-campo-600 transition-colors">−</button>
                    <input type="number" min={1} max={stockMax} value={cantidadPedido}
                      onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 1 && v <= stockMax) setCantidadPedido(Math.floor(v)) }}
                      className="w-14 text-center text-sm font-bold text-campo-700 border border-campo-200 rounded-btn py-1 focus:outline-none focus:ring-2 focus:ring-verde-400" />
                    <button type="button" onClick={() => setCantidadPedido(v => Math.min(stockMax, v + 1))}
                      className="w-7 h-7 rounded-btn bg-campo-200 hover:bg-campo-300 flex items-center justify-center text-sm font-bold text-campo-600 transition-colors">+</button>
                    <span className="text-xs text-campo-400">{producto.unidad}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-campo-400 font-medium">
                  {isCosecha ? 'Precio del lote' : `Precio por ${producto.unidad ?? 'unidad'}`}
                </span>
                <span className="text-sm font-semibold text-campo-600">{formatPrecio(producto.precio)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-bold text-campo-700">Total a pagar</span>
                <span className="text-lg font-black text-verde-600">{formatPrecio(subtotal)}</span>
              </div>
            </div>

            <p className="text-center text-[11px] text-campo-400 pb-4 px-5">
              🔒 Tu pago queda en garantía escrow hasta confirmar la entrega
            </p>

            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setMostrarModal(false)}
                className="flex-1 py-3 rounded-btn border border-campo-200 text-sm font-semibold text-campo-600 hover:bg-campo-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmarPedido}
                className="flex-1 py-3 rounded-btn bg-verde-400 hover:bg-verde-500 text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-btn">
                <ShoppingCart className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ BARRA SUPERIOR ══════════════════ */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-campo-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-btn hover:bg-campo-100 text-sm font-semibold text-campo-600 hover:text-campo-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-[11px] font-bold text-white ${isCosecha ? 'bg-verde-500' : 'bg-info-600'}`}>
            <TipoIcon className="w-3 h-3" />
            {isCosecha ? 'Cosecha del campo' : 'Suministro agrícola'}
          </span>
          <button onClick={handleShare}
            className="w-9 h-9 rounded-btn border border-campo-200 flex items-center justify-center text-campo-400 hover:bg-campo-100 transition-colors"
            aria-label="Compartir">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ══════════════════ CONTENIDO PRINCIPAL — 2 COLUMNAS ══════════════════ */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">

          {/* ── COLUMNA IZQUIERDA: Imagen ── */}
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* Imagen con proporción preservada */}
            <div className="relative rounded-card overflow-hidden bg-campo-100 shadow-card" style={{ aspectRatio: '4/3' }}>
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-campo-50 via-verde-50 to-campo-100">
                  <span className="text-[80px] select-none leading-none">{emoji}</span>
                </div>
              )}
              {/* Gradiente dinámico */}
              <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-50`} />
              {/* Badge stock — top right */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm ${hayStock ? 'bg-verde-400/90' : 'bg-campo-600/80'}`}>
                  <Package className="w-3 h-3" />
                  {hayStock ? 'Disponible' : 'Agotado'}
                </span>
              </div>
              {/* Precio — bottom left */}
              <div className="absolute bottom-4 left-4">
                <div className="rounded-btn bg-black/45 backdrop-blur-md px-4 py-2.5">
                  <p className="text-[10px] text-white/70 uppercase tracking-wide leading-none mb-0.5">
                    {isCosecha ? 'Precio del lote' : `Por ${producto.unidad ?? 'unidad'}`}
                  </p>
                  <p className="text-2xl font-black text-white leading-none">{formatPrecio(producto.precio || 0)}</p>
                </div>
              </div>
              {/* Tiempo — bottom right */}
              {producto.fechaPublicacion && (
                <div className="absolute bottom-4 right-3">
                  <div className="flex items-center gap-1.5 rounded-chip bg-black/35 backdrop-blur-sm px-2.5 py-2 text-[11px] text-white/80">
                    <Clock className="w-3 h-3" />
                    {tiempoRelativo(producto.fechaPublicacion)}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Desktop — bajo la imagen */}
            <div className="hidden lg:flex flex-col gap-3">
              {ordenError && (
                <div className="flex items-start gap-2 rounded-btn bg-red-50 border border-red-100 px-4 py-3">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 leading-snug">{ordenError}</p>
                </div>
              )}
              <div className="flex gap-3">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3.5 rounded-btn border-2 border-verde-200 text-sm font-bold text-verde-700 bg-verde-50 hover:bg-verde-100 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Contactar
                  </a>
                )}
                <button type="button" onClick={handleComprar}
                  disabled={comprando || !hayStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-btn bg-verde-400 hover:bg-verde-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors shadow-btn">
                  {comprando
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <ShoppingCart className="w-4 h-4" />}
                  {comprando ? 'Procesando…' : !hayStock ? 'Sin stock' : isCosecha ? 'Comprar lote' : 'Agregar al pedido'}
                </button>
              </div>
              <p className="text-center text-[11px] text-campo-400">
                🔒 Pago protegido con Escrow hasta confirmar entrega
              </p>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Info ── */}
          <div className="mt-6 lg:mt-0 space-y-4 pb-32 lg:pb-10">

            {/* Nombre */}
            <h1 className="text-2xl lg:text-3xl font-black text-campo-700 leading-tight">
              {producto.nombre}
            </h1>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="bg-white rounded-card border border-campo-100 shadow-card px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-campo-400 mb-2">Descripción</p>
                <p className="text-sm text-campo-600 leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* Detalles del lote */}
            <div className="bg-white rounded-card border border-campo-100 shadow-card px-5 py-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-campo-400">Detalles del lote</p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-btn bg-verde-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-verde-600" />
                </div>
                <div>
                  <p className="text-[10px] text-campo-400 uppercase tracking-wide">Ubicación</p>
                  <p className="text-sm font-semibold text-campo-700">{ubicacionText}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-btn bg-ambar-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-ambar-500" />
                </div>
                <div>
                  <p className="text-[10px] text-campo-400 uppercase tracking-wide">
                    {isCosecha ? 'Disponibilidad' : 'Stock disponible'}
                  </p>
                  <p className="text-sm font-semibold text-campo-700">
                    {isCosecha
                      ? (hayStock ? 'Lote disponible' : 'Lote agotado')
                      : `${Number(producto.stock ?? 0).toLocaleString('es-MX')} ${producto.unidad || ''}`}
                  </p>
                </div>
              </div>

              {producto.contacto && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-btn bg-info-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-info-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-campo-400 uppercase tracking-wide">Contacto</p>
                    <p className="text-sm font-semibold text-campo-700">{producto.contacto}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta del productor */}
            <Link
              to={producto.vendedor?.id ? `/vendedor/${producto.vendedor.id}` : '#'}
              className="group flex items-center gap-4 bg-white rounded-card border border-campo-100 shadow-card px-5 py-4 hover:border-verde-200 hover:shadow-card-hover transition-all"
            >
              <div className="w-12 h-12 rounded-btn bg-verde-600 flex items-center justify-center text-base font-black text-white flex-shrink-0 overflow-hidden">
                {producto.vendedor?.fotoPerfil
                  ? <img src={producto.vendedor.fotoPerfil} alt="" className="w-full h-full object-cover" />
                  : <span>{producto.vendedor?.nombre?.charAt(0)?.toUpperCase() ?? 'P'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold text-campo-700 truncate group-hover:text-verde-600 transition-colors">
                    {producto.vendedor?.nombre ?? 'Productor'}
                  </p>
                  {producto.vendedor?.verificado && (
                    <BadgeCheck className="w-4 h-4 text-info-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-campo-400 capitalize mb-1.5">
                  {producto.vendedor?.rol?.toLowerCase() ?? 'productor'}
                </p>
                <StarRating value={producto.reputacionProductor ?? producto.vendedor?.reputacion ?? 0} />
              </div>
              <ChevronRight className="w-4 h-4 text-campo-300 group-hover:text-verde-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            {/* Garantía escrow */}
            <div className="bg-verde-50 border border-verde-100 rounded-card px-5 py-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🔒</span>
              <div>
                <p className="text-xs font-bold text-verde-700 mb-0.5">Pago protegido con Escrow</p>
                <p className="text-xs text-verde-600 leading-relaxed">
                  Tu dinero queda en garantía hasta que confirmes la entrega del producto. Si algo falla, te lo devolvemos.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════ BARRA CTA MÓVIL ══════════════════ */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-white/95 backdrop-blur-md border-t border-campo-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {ordenError && (
          <p className="text-xs text-red-600 text-center mb-2 leading-snug">{ordenError}</p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-campo-400 uppercase tracking-wide leading-none mb-0.5">
              {isCosecha ? 'Precio del lote' : `Por ${producto.unidad ?? 'unidad'}`}
            </p>
            <p className="text-base font-black text-verde-600 leading-none">{formatPrecio(producto.precio || 0)}</p>
          </div>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-btn border border-verde-200 text-xs font-bold text-verde-700 bg-verde-50 hover:bg-verde-100 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          <button type="button" onClick={handleComprar}
            disabled={comprando || !hayStock}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-btn bg-verde-400 hover:bg-verde-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors shadow-btn">
            {comprando
              ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : <ShoppingCart className="w-4 h-4" />}
            {comprando ? '…' : !hayStock ? 'Sin stock' : isCosecha ? 'Comprar' : 'Pedir'}
          </button>
        </div>
      </div>

    </div>
  )
}


// ── Skeleton de carga
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-campo-50 flex flex-col" style={FONT}>
      {/* Hero skeleton */}
      <div className="w-full bg-campo-200 animate-pulse" style={{ height: 'clamp(280px, 52vw, 520px)' }} />
      {/* Card contenido */}
      <div className="relative -mt-6 z-10 bg-campo-50 rounded-t-[28px] flex-1">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-campo-200 animate-pulse" />
        </div>
        <div className="max-w-2xl mx-auto px-4 pt-2 space-y-4 animate-pulse">
          <div className="bg-white rounded-card border border-campo-100 px-5 py-4 space-y-2">
            <div className="h-3 bg-campo-200 rounded-full w-24" />
            <div className="h-4 bg-campo-200 rounded-full w-full" />
            <div className="h-4 bg-campo-200 rounded-full w-4/5" />
          </div>
          <div className="bg-white rounded-card border border-campo-100 px-5 py-4 space-y-4">
            <div className="h-3 bg-campo-200 rounded-full w-32" />
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-btn bg-campo-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-campo-200 rounded-full w-16" />
                  <div className="h-4 bg-campo-200 rounded-full w-40" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-card border border-campo-100 px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-btn bg-campo-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-campo-200 rounded-full w-36" />
              <div className="h-3 bg-campo-200 rounded-full w-20" />
              <div className="h-3 bg-campo-200 rounded-full w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Estado de error / no encontrado
function NotFound({ message }) {
  return (
    <div className="min-h-screen bg-campo-50 flex flex-col items-center justify-center gap-4 px-4" style={FONT}>
      <span className="text-5xl">🌾</span>
      <div className="text-center">
        <p className="text-campo-600 font-semibold mb-1">
          {message ?? 'Producto no encontrado.'}
        </p>
        <p className="text-sm text-campo-400">Quizás fue retirado o el enlace ya no es válido.</p>
      </div>
      <Link to={ROUTES.CATALOG}
        className="mt-2 px-5 py-2.5 rounded-btn bg-verde-400 hover:bg-verde-500 text-sm font-bold text-white shadow-btn transition-colors">
        Ver catálogo
      </Link>
    </div>
  )
}
