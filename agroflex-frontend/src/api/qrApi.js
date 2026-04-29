/**
 * qrApi.js — HTTP client para qr-service (puerto 8086, vía gateway 8080).
 */
import axiosClient from './axiosClient'

const qrApi = {
  /**
   * POST /api/qr/generate
   * Genera un QR para una orden (llamado internamente por orders-service,
   * también expuesto para retry manual desde el frontend).
   */
  generarQr: (data) =>
    axiosClient.post('/api/qr/generate', data),

  /**
   * POST /api/qr/validar
   * Valida el QR escaneado. Payload: { token, lat, lng }
   * El idOrden se resuelve internamente en el servicio.
   */
  validarQr: (token, lat, lng) =>
    axiosClient.post('/api/qr/validar', { token, lat, lng }),

  /**
   * GET /api/qr/orden/:idOrden
   * Obtiene el estado del QR asociado a una orden.
   */
  qrDeOrden: (idOrden) =>
    axiosClient.get(`/api/qr/orden/${idOrden}`),
}

export default qrApi
