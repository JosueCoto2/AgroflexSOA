import axiosClient from './axiosClient'

const notificationsApi = {
  // ── Notificaciones del usuario autenticado ────────────────────────────────

  getMisNotificaciones: (page = 0, size = 20) =>
    axiosClient.get('/api/notifications/mis-notificaciones', {
      params: { page, size },
    }),

  contarNoLeidas: () =>
    axiosClient.get('/api/notifications/no-leidas/count'),

  marcarLeida: (idNotif) =>
    axiosClient.patch(`/api/notifications/${idNotif}/leer`),

  marcarTodasLeidas: () =>
    axiosClient.patch('/api/notifications/leer-todas'),
}

export default notificationsApi
