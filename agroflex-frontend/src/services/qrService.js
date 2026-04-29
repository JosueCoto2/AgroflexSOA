/**
 * qrService.js — CAPA 1 (servicio de presentación)
 *
 * Conecta con el microservicio de validación QR.
 * JWT inyectado automáticamente por el interceptor de axiosClient.
 *
 * Flujo SOA: componentes → hooks → qrService → axiosClient → qr-service (Spring Boot)
 */
import axiosClient from '../api/axiosClient'

export const qrService = {
  /**
   * POST /api/qr/validar
   * Valida la entrega del producto mediante el token QR y coordenadas GPS.
   * @param {{ token: string, lat: number, lng: number }} payload
   */
  async validarEntrega({ token, lat, lng }) {
    const { data } = await axiosClient.post('/api/qr/validar', {
      token,
      lat: lat ?? null,
      lng: lng ?? null,
    })
    return data
  },

  /**
   * GET /api/qr/orden/:idOrden
   * Obtiene el estado del QR de una orden.
   */
  async getQrDeOrden(idOrden) {
    const { data } = await axiosClient.get(`/api/qr/orden/${idOrden}`)
    return data
  },
}
