/**
 * ordersApi.js — HTTP client para orders-service (puerto 8084, vía gateway 8080).
 * Flujo SOA: store/hooks → ordersApi → axiosClient → gateway → orders-service
 */
import axiosClient from './axiosClient'

const ordersApi = {
  /**
   * POST /api/orders
   * Crea una nueva orden. Body: CreateOrderRequest
   * {
   *   idVendedor: Long,
   *   items: [{ idProducto, tipoProducto, cantidad }],
   *   metodoPago?: string,
   *   observaciones?: string,
   *   latitudEntrega?: number,
   *   longitudEntrega?: number
   * }
   */
  crearOrden: (data) =>
    axiosClient.post('/api/orders', data),

  /**
   * GET /api/orders/mis-pedidos
   * Lista pedidos del usuario autenticado (comprador o vendedor según su rol JWT).
   */
  misPedidos: () =>
    axiosClient.get('/api/orders/mis-pedidos'),

  /**
   * GET /api/orders/:orderId
   * Detalle completo de una orden.
   */
  detalle: (orderId) =>
    axiosClient.get(`/api/orders/${orderId}`),

  /**
   * PUT /api/orders/:orderId/status
   * Actualiza el estado de una orden.
   * Body: { nuevoEstado: string, motivo?: string }
   */
  actualizarEstado: (orderId, nuevoEstado, motivo) =>
    axiosClient.put(`/api/orders/${orderId}/status`, { nuevoEstado, motivo }),

  /**
   * DELETE /api/orders/:orderId
   * Cancela una orden.
   */
  cancelar: (orderId, motivo = 'Cancelado por el usuario') =>
    axiosClient.delete(`/api/orders/${orderId}`, { params: { motivo } }),

  /**
   * GET /api/orders/stats  (solo ADMIN)
   */
  estadisticas: () =>
    axiosClient.get('/api/orders/stats'),

  /**
   * POST /api/orders/:orderId/release  (solo ADMIN)
   * Libera el pago manualmente.
   */
  liberarPago: (orderId) =>
    axiosClient.post(`/api/orders/${orderId}/release`),
}

export default ordersApi
