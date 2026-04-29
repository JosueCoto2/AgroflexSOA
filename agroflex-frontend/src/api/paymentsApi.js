/**
 * paymentsApi.js — HTTP client para payments-service (puerto 8085, vía gateway 8080).
 */
import axiosClient from './axiosClient'

const paymentsApi = {
  /**
   * POST /api/payments/create-intent
   * Crea un PaymentIntent en Stripe.
   * Body: { idOrden, numeroOrden, monto, moneda, idComprador, idVendedor }
   * Response: { clientSecret, paymentIntentId, estado }
   */
  crearIntent: (data) =>
    axiosClient.post('/api/payments/create-intent', data),

  /**
   * GET /api/payments/escrow-status/:orderId
   * Consulta el estado del escrow de una orden.
   */
  estadoEscrow: (orderId) =>
    axiosClient.get(`/api/payments/escrow-status/${orderId}`),
}

export default paymentsApi
