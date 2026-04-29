/**
 * PagarOrdenPage — Selección de método de pago.
 *
 * Métodos:
 *   • OXXO Pay     — Voucher con código de barras y referencia de 18 dígitos
 *   • Stripe       — Tarjeta crédito/débito (Visa, Mastercard, AMEX)
 */
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import {
  ArrowLeft, ShieldCheck, AlertCircle,
  Loader2, CheckCircle2, Copy, Check,
  ChevronRight, Store, CreditCard,
} from 'lucide-react'
import { loadStripe }  from '@stripe/stripe-js'
import { Elements }    from '@stripe/react-stripe-js'
import ordersApi       from '../../api/ordersApi'
import paymentsApi     from '../../api/paymentsApi'
import useOrderStore   from '../../store/orderStore'
import { ROUTES }      from '../../routes/routeConfig'
import StripeCheckoutForm from '../../components/payments/StripeCheckoutForm/StripeCheckoutForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK)

// ─── Helpers ────────────────────────────────────────────────────────────────
const FONT  = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }
const fmt   = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0)

/** Genera una referencia de 18 dígitos estilo OXXO */
function generarRefOXXO(orderId) {
  const base = String(orderId ?? 1).padStart(6, '0')
  const rand = Math.floor(Math.random() * 1e12).toString().padStart(12, '0')
  const raw  = `${base}${rand}`
  // Formato: XXXX XXXX XXXX XXXX XX
  return raw.match(/.{1,4}/g).join(' ')
}

/** Fecha de vencimiento OXXO (+3 días) */
function fechaVencimiento() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Barcode visual CSS ──────────────────────────────────────────────────────
function Barcode({ value }) {
  // Genera patrón determinístico a partir del string
  const bars = Array.from(value.replace(/\s/g, '')).map((c, i) => {
    const code = c.charCodeAt(0)
    return {
      width: (code % 3) + 1,          // 1, 2 o 3 px
      gap:   (i % 4 === 0) ? 2 : 1,
    }
  })

  return (
    <div className="flex items-stretch h-16 justify-center gap-0 overflow-hidden px-2">
      {bars.map((b, i) => (
        <div key={i} className="flex gap-0" style={{ marginRight: b.gap }}>
          <div
            className="bg-slate-900"
            style={{ width: b.width, height: '100%' }}
          />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PANTALLA 1 — Selección de método
// ─────────────────────────────────────────────────────────────────────────────
function SeleccionMetodo({ orden, onElegir }) {
  const metodos = [
    {
      id:    'oxxo',
      label: 'OXXO Pay',
      sub:   'Paga en efectivo en cualquier OXXO',
      badge: 'Efectivo',
      color: 'from-[#DA0012] to-[#ff1a2e]',
      bg:    'bg-red-50 hover:bg-red-100 border-red-200',
      icon:  <Store className="w-5 h-5 text-red-500" />,
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
        Elige cómo pagar
      </p>

      {metodos.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onElegir(m.id)}
          className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all active:scale-[.98] ${m.bg}`}
        >
          {/* Logo */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0 shadow-md`}>
            <span className="text-white font-black text-xs tracking-tight">{m.badge}</span>
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <p className="font-bold text-slate-800 text-sm">{m.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      ))}

      <button
        key="stripe"
        type="button"
        onClick={() => onElegir('stripe')}
        className="w-full flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 hover:bg-green-100 p-4 transition-all active:scale-[.98]"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shrink-0 shadow-md">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-slate-800 text-sm">Tarjeta crédito/débito</p>
          <p className="text-xs text-slate-500 mt-0.5">Visa, Mastercard, AMEX — pago seguro con Stripe</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PANTALLA 2A — OXXO Pay
// ─────────────────────────────────────────────────────────────────────────────
function OXXOVoucher({ orden, onSimular, simulando }) {
  const referencia = useRef(generarRefOXXO(orden?.id)).current
  const vencimiento = useRef(fechaVencimiento()).current
  const [copiado, setCopiado] = useState(false)

  const copiarRef = () => {
    navigator.clipboard.writeText(referencia).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="space-y-4">

      {/* Voucher OXXO */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Header rojo OXXO */}
        <div className="bg-[#DA0012] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-black text-2xl tracking-tight">OXXO</p>
            <p className="text-white/70 text-xs">Pay · Pago en efectivo</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Monto a pagar</p>
            <p className="text-white font-black text-xl">{fmt(orden?.totalMonto)}</p>
          </div>
        </div>

        {/* Cuerpo del voucher */}
        <div className="px-5 py-4 space-y-4">

          {/* Referencia */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
              Número de referencia
            </p>
            <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
              <p className="font-mono font-bold text-slate-800 text-sm tracking-widest">
                {referencia}
              </p>
              <button
                type="button"
                onClick={copiarRef}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors shrink-0"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Código de barras */}
          <div className="bg-white border border-slate-100 rounded-xl p-3">
            <Barcode value={referencia} />
            <p className="text-center text-[10px] text-slate-400 font-mono mt-2 tracking-wider">
              {referencia.replace(/\s/g, '')}
            </p>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 mb-0.5">Orden</p>
              <p className="font-bold text-slate-700 truncate">{orden?.numeroOrden}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-slate-400 mb-0.5">Vence</p>
              <p className="font-bold text-red-600">{vencimiento}</p>
            </div>
          </div>

          {/* Separador punteado */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Instrucciones */}
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">¿Cómo pagar en OXXO?</p>
            <ol className="space-y-1.5 text-xs text-slate-500">
              {[
                'Ve a cualquier tienda OXXO',
                'Indica al cajero que quieres hacer un pago de servicio',
                'Proporciona el número de referencia',
                'Paga el monto exacto en efectivo',
                'Conserva tu ticket como comprobante',
              ].map((paso, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#DA0012] text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Aviso importante */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          El pago se confirma en <strong>hasta 2 horas</strong> después de realizar el pago en OXXO.
          La orden se liberará automáticamente.
        </p>
      </div>

      {/* Botón simulación */}
      <button
        type="button"
        onClick={onSimular}
        disabled={simulando}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
          bg-[#DA0012] hover:bg-[#b8000f] text-white font-bold text-sm
          shadow-lg shadow-red-500/20 transition-all active:scale-[.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {simulando
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
          : <><CheckCircle2 className="w-4 h-4" /> Confirmar pago</>
        }
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PANTALLA DE ÉXITO
// ─────────────────────────────────────────────────────────────────────────────
function PagoExitoso({ metodo }) {
  const config = metodo === 'oxxo'
    ? { color: 'bg-[#DA0012]', label: 'OXXO Pay' }
    : { color: 'bg-green-600', label: 'Stripe' }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className={`w-20 h-20 ${config.color} rounded-full flex items-center justify-center shadow-xl`}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-800">¡Pago confirmado!</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pagado con {config.label}
        </p>
      </div>
      <p className="text-sm text-slate-400">Redirigiendo a tus pedidos…</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function PagarOrdenPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()

  const { ordenActual, fetchDetalle } = useOrderStore()

  const [metodo,       setMetodo]       = useState(null)   // null | 'mercadopago' | 'oxxo' | 'stripe'
  const [simulando,    setSimulando]    = useState(false)
  const [exito,        setExito]        = useState(false)
  const [loadError,    setLoadError]    = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [stripeError,  setStripeError]  = useState(null)
  const [cargandoIntent, setCargandoIntent] = useState(false)

  // Cargar orden
  useEffect(() => {
    if (!orderId) return
    fetchDetalle(orderId).catch(err => {
      setLoadError(err.response?.data?.message || 'No se pudo cargar la orden.')
    })
  }, [orderId])

  // Redirigir si ya estaba pagada
  useEffect(() => {
    if (!ordenActual) return
    if (ordenActual.estadoPedido === 'PAGADO') {
      navigate(ROUTES.MIS_PEDIDOS_DETALLE.replace(':orderId', orderId), { replace: true })
    }
  }, [ordenActual])

  // Cuando elige Stripe, primero obtiene el clientSecret del backend
  const handleElegirMetodo = async (m) => {
    if (m === 'stripe') {
      if (clientSecret) {
        // Ya tenemos el intent — ir directo al formulario
        setMetodo('stripe')
        return
      }
      setCargandoIntent(true)
      setStripeError(null)
      try {
        const res = await paymentsApi.crearIntent({
          idOrden:    ordenActual.id,
          numeroOrden: ordenActual.numeroOrden,
          monto:      ordenActual.totalMonto,
          moneda:     'MXN',
          idComprador: ordenActual.idComprador,
          idVendedor:  ordenActual.idVendedor,
        })
        const data = res.data
        if (!data?.clientSecret) throw new Error('No se recibió clientSecret')
        setClientSecret(data.clientSecret)
        setMetodo('stripe')
      } catch (err) {
        const msg = err.response?.data?.mensaje
          || err.response?.data?.message
          || 'No se pudo iniciar el pago. Intenta de nuevo.'
        setStripeError(msg)
      } finally {
        setCargandoIntent(false)
      }
      return
    }
    setMetodo(m)
  }

  const handleStripeSuccess = async (paymentIntentId) => {
    // Marcar orden como PAGADO en el backend
    try {
      await ordersApi.actualizarEstado(ordenActual.id, 'PAGADO', `Stripe PI: ${paymentIntentId}`)
    } catch {
      // Si falla la actualización, el webhook lo hará eventualmente
    }
    setExito(true)
    setTimeout(() => {
      navigate(ROUTES.MIS_PEDIDOS_DETALLE.replace(':orderId', orderId))
    }, 2200)
  }

  const handleSimular = async () => {
    setSimulando(true)
    try {
      await ordersApi.actualizarEstado(orderId, 'PAGADO', `Pago confirmado: ${metodo}`)
      setExito(true)
      setTimeout(() => {
        navigate(ROUTES.MIS_PEDIDOS_DETALLE.replace(':orderId', orderId))
      }, 2200)
    } catch {
      setSimulando(false)
    }
  }

  const isLoading = !ordenActual && !loadError

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => metodo && !exito ? setMetodo(null) : navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800">
            {exito                  ? '¡Pago exitoso!'
             : metodo === 'oxxo'   ? 'Pagar en OXXO'
             : metodo === 'stripe' ? 'Pagar con tarjeta'
             : 'Elige cómo pagar'}
          </h1>
          {ordenActual?.numeroOrden && (
            <p className="text-xs text-slate-400">{ordenActual.numeroOrden}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Seguro
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            <p className="text-sm text-slate-500">Cargando orden…</p>
          </div>
        )}

        {/* Error de carga */}
        {loadError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{loadError}</p>
          </div>
        )}

        {/* Contenido principal */}
        {ordenActual && (

          <>
            {/* Resumen de orden — siempre visible */}
            {!exito && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Resumen del pedido
                </p>
                <div className="space-y-2">
                  {(ordenActual.items || []).map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {item.nombreProducto || `Producto #${item.idProducto}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {Number(item.cantidad).toLocaleString('es-MX')}{' '}
                          {item.unidadVenta || 'unidad'} × {fmt(item.precioUnitario)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-800 shrink-0">
                        {fmt(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Total</span>
                  <span className="text-xl font-black text-green-700">
                    {fmt(ordenActual.totalMonto)}
                  </span>
                </div>
              </div>
            )}

            {/* Pantalla de éxito */}
            {exito && <PagoExitoso metodo={metodo} />}

            {/* Error al crear PaymentIntent de Stripe */}
            {stripeError && !metodo && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{stripeError}</p>
              </div>
            )}

            {/* Cargando intent de Stripe */}
            {cargandoIntent && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
                <p className="text-sm text-slate-500">Iniciando pago seguro…</p>
              </div>
            )}

            {/* Selección de método */}
            {!metodo && !exito && !cargandoIntent && (
              <SeleccionMetodo orden={ordenActual} onElegir={handleElegirMetodo} />
            )}

            {/* OXXO */}
            {metodo === 'oxxo' && !exito && (
              <OXXOVoucher
                orden={ordenActual}
                onSimular={handleSimular}
                simulando={simulando}
              />
            )}

            {/* Stripe — tarjeta real */}
            {metodo === 'stripe' && !exito && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: 'es',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#16a34a',
                      colorBackground: '#ffffff',
                      borderRadius: '12px',
                      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    },
                  },
                }}
              >
                <StripeCheckoutForm
                  monto={ordenActual.totalMonto}
                  onSuccess={handleStripeSuccess}
                  onError={setStripeError}
                />
              </Elements>
            )}
          </>
        )}

      </div>
    </div>
  )
}
