/**
 * OrdenCard — Tarjeta de un pedido en la pantalla Mis Pedidos.
 * Muestra estado, producto, monto y CTA según el estado actual.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, ShieldCheck, Truck, MapPin, CheckCircle, XCircle,
  Copy, Check, Leaf, Package, Star,
} from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'
import ModalCalificar from './ModalCalificar'

// ── Configuración de estados (coincide con EstadoPedido del backend)
const ESTADO_CONFIG = {
  PENDIENTE:      { icon: Clock,       color: 'bg-amber-100 text-amber-700',   label: 'Pendiente de pago' },
  CONFIRMADO:     { icon: ShieldCheck, color: 'bg-blue-100  text-blue-700',    label: 'Pago retenido' },
  EN_TRANSITO:    { icon: Truck,       color: 'bg-orange-100 text-orange-700', label: 'En camino' },
  LISTO_ENTREGA:  { icon: MapPin,      color: 'bg-purple-100 text-purple-700', label: 'Entrega pendiente' },
  ENTREGADO:      { icon: MapPin,      color: 'bg-indigo-100 text-indigo-700', label: 'Entregado' },
  COMPLETADO:     { icon: CheckCircle, color: 'bg-green-100 text-green-700',   label: 'Completado' },
  CANCELADO:      { icon: XCircle,     color: 'bg-red-100   text-red-700',     label: 'Cancelado' },
  DISPUTADO:      { icon: XCircle,     color: 'bg-rose-100  text-rose-700',    label: 'En disputa' },
  REEMBOLSADO:    { icon: XCircle,     color: 'bg-slate-100 text-slate-600',   label: 'Reembolsado' },
}

export default function OrdenCard({ orden, tabActivo }) {
  const navigate = useNavigate()
  const [copiado,          setCopiado]          = useState(false)
  const [modalCalificar,   setModalCalificar]   = useState(false)

  // El backend devuelve estadoPedido (EstadoPedido enum)
  const estadoNorm = orden.estadoPedido ?? orden.estado ?? 'PENDIENTE'
  const config = ESTADO_CONFIG[estadoNorm] ?? ESTADO_CONFIG.PENDIENTE
  const EstadoIcon = config.icon

  // Nombre del producto: viene en items[0].nombreProducto
  const primerItem    = orden.items?.[0]
  const nombreProducto = primerItem?.nombreProducto ?? orden.nombreProducto ?? '—'
  const tipoProducto   = primerItem?.tipoProducto   ?? orden.tipoProducto  ?? ''
  const esCosecha      = tipoProducto.toUpperCase().includes('COSECHA')

  const copiarId = () => {
    navigator.clipboard.writeText(String(orden.id))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleCTA = () => {
    switch (estadoNorm) {
      case 'PENDIENTE':     navigate(`${ROUTES.MIS_PEDIDOS}/${orden.id}/pagar`); break
      case 'LISTO_ENTREGA':
      case 'ENTREGADO':     navigate(ROUTES.QR_SCANNER); break
      default:              navigate(`${ROUTES.MIS_PEDIDOS}/${orden.id}`)
    }
  }

  const ctaLabel = {
    PENDIENTE:     'Pagar ahora',
    CONFIRMADO:    'Ver detalle',
    EN_TRANSITO:   'Ver detalle',
    LISTO_ENTREGA: 'Escanear QR',
    ENTREGADO:     'Escanear QR',
    COMPLETADO:    'Ver comprobante',
    CANCELADO:     'Ver motivo',
    DISPUTADO:     'Ver disputa',
    REEMBOLSADO:   'Ver detalle',
  }[estadoNorm] ?? 'Ver detalle'

  const ctaColor = estadoNorm === 'PENDIENTE'
    ? 'bg-amber-500 hover:bg-amber-600 text-white'
    : (estadoNorm === 'LISTO_ENTREGA' || estadoNorm === 'ENTREGADO')
    ? 'bg-purple-600 hover:bg-purple-700 text-white'
    : 'bg-slate-800 hover:bg-slate-900 text-white'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* ── Header con ID y estado */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
        <button
          onClick={copiarId}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors group"
          title="Copiar ID"
        >
          <span className="font-mono">#{orden.id}</span>
          {copiado
            ? <Check className="w-3.5 h-3.5 text-green-500" />
            : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          }
        </button>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
          <EstadoIcon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>

      {/* ── Body */}
      <div className="p-4 flex gap-3">
        {/* Imagen */}
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
          {orden.imagenUrl
            ? <img src={orden.imagenUrl} alt={orden.nombreProducto} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center">
                {esCosecha
                  ? <Leaf className="w-7 h-7 text-green-300" />
                  : <Package className="w-7 h-7 text-blue-300" />
                }
              </div>
            )
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{nombreProducto}</p>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {esCosecha ? 'Cosecha' : (tipoProducto ? 'Suministro' : '')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {tabActivo === 'comprador' ? 'Vendedor: ' : 'Comprador: '}
            <span className="font-medium text-slate-700">
              {tabActivo === 'comprador' ? orden.nombreVendedor : orden.nombreComprador}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(orden.fechaCreacion ?? orden.fechaPedido).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>

        {/* Monto */}
        <div className="flex-shrink-0 text-right">
          <p className="text-base font-bold text-slate-900">
            ${Number(orden.totalMonto ?? orden.montoTotal ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">MXN</p>
        </div>
      </div>

      {/* ── Footer con CTA */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={handleCTA}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${ctaColor}`}
        >
          {ctaLabel}
        </button>

        {/* Botón calificar — solo para comprador en órdenes completadas */}
        {tabActivo === 'comprador' && estadoNorm === 'COMPLETADO' && (
          <button
            onClick={() => setModalCalificar(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-xl transition-colors active:scale-95"
          >
            <Star size={14} className="fill-amber-400 text-amber-400" />
            Calificar al vendedor
          </button>
        )}
      </div>

      {/* Modal calificación */}
      <ModalCalificar
        abierto={modalCalificar}
        onCerrar={() => setModalCalificar(false)}
        idOrden={orden.id}
        idVendedor={orden.idVendedor}
        nombreVendedor={orden.nombreVendedor}
      />
    </div>
  )
}
