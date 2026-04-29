/**
 * pedidoService.js — CAPA 1 (servicio de presentación)
 *
 * Conecta con el microservicio de pedidos (order-service).
 * JWT inyectado automáticamente por el interceptor de axiosClient.
 *
 * Flujo SOA: componentes → hooks → pedidoService → axiosClient → order-service
 */
import axiosClient from '../api/axiosClient'

export const pedidoService = {
  /**
   * GET /api/pedidos/mis-pedidos
   * Devuelve los pedidos del usuario autenticado (como comprador o vendedor).
   * @param {Object} filtros - { rol, estado, tipo, buscar, page, size }
   */
  async getMisPedidos(filtros = {}) {
    const params = {}
    if (filtros.rol)    params.rol    = filtros.rol
    if (filtros.estado) params.estado = filtros.estado
    if (filtros.tipo)   params.tipo   = filtros.tipo
    if (filtros.buscar) params.buscar = filtros.buscar
    params.page = filtros.page ?? 0
    params.size = filtros.size ?? 20
    const { data } = await axiosClient.get('/api/orders/mis-pedidos', { params })
    return data
  },

  /**
   * GET /api/pedidos/:id
   * Detalle completo de un pedido.
   */
  async getPedidoById(id) {
    const { data } = await axiosClient.get(`/api/orders/${id}`)
    return data
  },

  /**
   * POST /api/pedidos/:id/cancelar
   * Solicita la cancelación de un pedido.
   */
  async cancelarPedido(id, motivo) {
    const { data } = await axiosClient.delete(`/api/orders/${id}`, { params: { motivo } })
    return data
  },
}
