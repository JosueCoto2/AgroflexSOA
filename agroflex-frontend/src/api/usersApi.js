import axiosClient from './axiosClient'

const usersApi = {
  // ── Mi perfil ─────────────────────────────────────────────────────────────

  getMiPerfil: () =>
    axiosClient.get('/api/users/me'),

  actualizarMiPerfil: (data) =>
    axiosClient.put('/api/users/me', data),

  // ── Perfil público ────────────────────────────────────────────────────────

  getPerfilPublico: (idUsuario) =>
    axiosClient.get(`/api/users/${idUsuario}`),

  // ── Insignias ─────────────────────────────────────────────────────────────

  getInsignias: (idUsuario) =>
    axiosClient.get(`/api/users/${idUsuario}/insignias`),

  // ── Reseñas ───────────────────────────────────────────────────────────────

  getReseñas: (idUsuario, page = 0, size = 10) =>
    axiosClient.get(`/api/users/${idUsuario}/reseñas`, {
      params: { page, size },
    }),

  crearReseña: (data) =>
    axiosClient.post('/api/users/me/reseñas', data),

  // ── Admin ─────────────────────────────────────────────────────────────────

  listarUsuarios: (busqueda = '', page = 0, size = 20) =>
    axiosClient.get('/api/users', {
      params: { busqueda, page, size },
    }),

  cambiarEstadoUsuario: (idUsuario, activo) =>
    axiosClient.patch(`/api/users/${idUsuario}/estado`, null, { params: { activo } }),

  eliminarUsuario: (idUsuario) =>
    axiosClient.delete(`/api/users/${idUsuario}`),
}

export default usersApi
