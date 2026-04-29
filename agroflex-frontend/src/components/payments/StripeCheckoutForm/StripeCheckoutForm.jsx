/**
 * StripeCheckoutForm — Formulario de tarjeta con Stripe Elements.
 *
 * Uso:
 *   <StripeCheckoutForm
 *     clientSecret="pi_xxx_secret_yyy"
 *     monto={2000}
 *     onSuccess={(paymentIntentId) => ...}
 *     onError={(msg) => ...}
 *   />
 *
 * Requiere estar envuelto en <Elements stripe={stripePromise} options={{ clientSecret }}>
 * (lo hace el padre — PagarOrdenPage).
 */
import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react'
import PropTypes from 'prop-types'

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0)

const StripeCheckoutForm = ({ monto, onSuccess, onError }) => {
  const stripe   = useStripe()
  const elements = useElements()

  const [procesando, setProcesando] = useState(false)
  const [errorLocal, setErrorLocal]  = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcesando(true)
    setErrorLocal(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // No redirigimos — manejamos el resultado aquí mismo
        return_url: window.location.href,
      },
      redirect: 'if_required',
    })

    if (error) {
      const msg = error.type === 'card_error' || error.type === 'validation_error'
        ? error.message
        : 'No se pudo procesar el pago. Intenta de nuevo.'
      setErrorLocal(msg)
      onError?.(msg)
      setProcesando(false)
      return
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onSuccess?.(paymentIntent.id)
    } else {
      const msg = 'El pago no fue completado. Verifica tu tarjeta e intenta de nuevo.'
      setErrorLocal(msg)
      onError?.(msg)
      setProcesando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Cabecera del monto */}
      <div className="rounded-2xl bg-gradient-to-br from-green-700 to-green-900 p-5 text-white text-center shadow-lg shadow-green-900/30">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
          Total a cobrar
        </p>
        <p className="text-3xl font-black">{fmt(monto)}</p>
      </div>

      {/* Stripe Elements — formulario de tarjeta */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">Datos de tu tarjeta</p>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: { address: { country: 'MX' } },
            },
          }}
        />

        {errorLocal && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{errorLocal}</p>
          </div>
        )}
      </div>

      {/* Aviso de seguridad */}
      <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
        Pago seguro procesado por Stripe. AgroFlex nunca almacena tus datos de tarjeta.
      </div>

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || procesando}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
          bg-green-600 hover:bg-green-700 text-white font-bold text-sm
          shadow-lg shadow-green-600/30 transition-all active:scale-[.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {procesando
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
          : <><CreditCard className="w-4 h-4" /> Pagar {fmt(monto)}</>
        }
      </button>
    </form>
  )
}

StripeCheckoutForm.propTypes = {
  monto:     PropTypes.number.isRequired,
  onSuccess: PropTypes.func,
  onError:   PropTypes.func,
}

StripeCheckoutForm.defaultProps = {
  onSuccess: null,
  onError:   null,
}

export default StripeCheckoutForm
