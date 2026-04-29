/**
 * OrdenDetallePage — Detalle de una orden para el comprador.
 * Ruta: /mis-pedidos/:orderId
 * Muestra estado, items, monto y botón "Ver mi QR" cuando la orden está lista.
 */
import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, QrCode, CheckCircle,
  Clock, XCircle, Truck, AlertCircle, Star,
} from 'lucide-react'
import useOrderStore  from '../../store/orderStore'
import ReseñasWidget  from '../../components/shared/ReseñasWidget'
import { ROUTES }     from '../../routes/routeConfig'

const ESTADO_CONFIG = {
  PENDIENTE:     { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CONFIRMADO:    { label: 'Confirmado',        color: 'bg-blue-100 text-blue-700',     Icon: CheckCircle },
  EN_TRANSITO:   { label: 'En tránsito',       color: 'bg-indigo-100 text-indigo-700', Icon: Truck },
  LISTO_ENTREGA: { label: 'Listo para entrega',color: 'bg-green-100 text-green-700',   Icon: QrCode },
  ENTREGADO:     { label: 'Entregado',         color: 'bg-green-100 text-green-700',   Icon: CheckCircle },
  COMPLETADO:    { label: 'Completado',        color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle },
  CANCELADO:     { label: 'Cancelado',         color: 'bg-red-100 text-red-600',       Icon: XCircle },
  DISPUTADO:     { label: 'En disputa',        color: 'bg-orange-100 text-orange-700', Icon: AlertCircle },
  REEMBOLSADO:   { label: 'Reembolsado',       color: 'bg-slate-100 text-slate-600',   Icon: CheckCircle },
}

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0)

const fmtFecha = (d) =>
  d ? new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '—'

export default function OrdenDetallePage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { ordenActual, isLoading, error, fetchDetalle, cancelarOrden } = useOrderStore()

  useEffect(() => {
    if (orderId) fetchDetalle(orderId)
  }, [orderId])

  if (isLoading) return <Skeleton />
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600 mb-4">{error}</p>
        <Link to={ROUTES.MIS_PEDIDOS} className="text-green-600 font-semibold text-sm hover:underline">
          ← Mis pedidos
        </Link>
      </div>
    </div>
  )
  if (!ordenActual) return null

  const estado = ordenActual.estadoPedido || 'PENDIENTE'
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.PENDIENTE
  const Icon = cfg.Icon

  const puedeVerQR    = ['LISTO_ENTREGA', 'EN_TRANSITO'].includes(estado)
  const puedeCancelar = ['PENDIENTE', 'CONFIRMADO', 'EN_TRANSITO'].includes(estado)
  const puedeCalificar = ['ENTREGADO', 'COMPLETADO'].includes(estado) && ordenActual?.idVendedor

  const handleCancelar = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return
    try {
      await cancelarOrden(ordenActual.id, 'Cancelado por el comprador')
      navigate(ROUTES.MIS_PEDIDOS)
    } catch {
      // error ya en store
    }
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-10">
        <button onClick={() => navigate(ROUTES.MIS_PEDIDOS)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" />
          Mis pedidos
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-800">{ordenActual.numeroOrden}</h1>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-24">

        {/* Botón Ver QR — destacado cuando está listo */}
        {puedeVerQR && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-green-800 text-sm">¡Tu pedido está listo!</p>
              <p className="text-green-600 text-xs">Muéstrale el QR al productor para confirmar la entrega</p>
            </div>
            <button
              onClick={() => navigate(`/mi-qr/${ordenActual.id}`)}
              className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              Ver QR
            </button>
          </div>
        )}

        {/* Resumen monetario */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">Resumen del pedido</h2>
          <div className="space-y-2">
            {(ordenActual.items || []).map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {item.nombreProducto || `Producto #${item.idProducto}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {Number(item.cantidad).toLocaleString('es-MX')} {item.unidadVenta || 'unidad'} × {fmt(item.precioUnitario)}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-800 shrink-0">{fmt(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-700">Total</span>
            <span className="text-lg font-bold text-green-700">{fmt(ordenActual.totalMonto)}</span>
          </div>
          {ordenActual.montoEscrow > 0 && (
            <p className="text-xs text-slate-400 text-center">
              🔒 {fmt(ordenActual.montoEscrow)} retenido en escrow
            </p>
          )}
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">Información</h2>
          <Row label="Número de orden" value={ordenActual.numeroOrden} />
          <Row label="Método de pago" value={ordenActual.metodoPago} />
          <Row label="Fecha de creación" value={fmtFecha(ordenActual.fechaCreacion)} />
          <Row label="Última actualización" value={fmtFecha(ordenActual.fechaActualizacion)} />
          {ordenActual.observaciones && (
            <Row label="Notas" value={ordenActual.observaciones} />
          )}
        </div>

        {/* ── Calificación al vendedor */}
        {puedeCalificar && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Califica al vendedor</p>
                <p className="text-xs text-slate-400">Tu opinión ayuda a otros compradores</p>
              </div>
            </div>
            <ReseñasWidget
              idUsuario={ordenActual.idVendedor}
              idOrden={ordenActual.id}
              tipoReseña="VENDEDOR"
            />
          </div>
        )}

        {/* Acciones */}
        {puedeCancelar && (
          <button
            onClick={handleCancelar}
            className="w-full py-3 text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-700 text-right">{value}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse p-4 pt-20">
      <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="bg-white rounded-2xl p-4 space-y-3 mb-4">
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-14 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded w-1/3 ml-auto" />
      </div>
    </div>
  )
}
