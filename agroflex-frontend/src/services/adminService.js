/**
 * adminService.js — Capa de acceso al admin-service (puerto 8082).
 * JWT inyectado automáticamente por el interceptor de axiosClient.
 * NUNCA llamar desde componentes directamente — siempre via hooks.
 */
import axiosClient from '../api/axiosClient'

export const adminService = {
  // ── Dashboard
  getStats: () =>
    axiosClient.get('/api/admin/dashboard/stats').then(r => r.data),
  getActividadReciente: () =>
    axiosClient.get('/api/admin/dashboard/actividad-reciente').then(r => r.data),

  // ── Usuarios
  getUsuarios: (params) =>
    axiosClient.get('/api/admin/usuarios', { params }).then(r => r.data),
  getUsuarioById: (id) =>
    axiosClient.get(`/api/admin/usuarios/${id}`).then(r => r.data),
  suspenderUsuario: (id, motivo) =>
    axiosClient.patch(`/api/admin/usuarios/${id}/suspender`, { motivo }).then(r => r.data),
  activarUsuario: (id, motivo) =>
    axiosClient.patch(`/api/admin/usuarios/${id}/activar`, { motivo }).then(r => r.data),
  eliminarUsuario: (id) =>
    axiosClient.delete(`/api/admin/usuarios/${id}`).then(r => r.data),

  // ── Insignias
  getInsigniasPendientes: () =>
    axiosClient.get('/api/admin/insignias/pendientes').then(r => r.data),
  getInsignias: (params) =>
    axiosClient.get('/api/admin/insignias', { params }).then(r => r.data),
  getInsigniaById: (id) =>
    axiosClient.get(`/api/admin/insignias/${id}`).then(r => r.data),
  aprobarInsignia: (id, comentario) =>
    axiosClient.post(`/api/admin/insignias/${id}/aprobar`, { comentario }).then(r => r.data),
  rechazarInsignia: (id, motivoRechazo) =>
    axiosClient.post(`/api/admin/insignias/${id}/rechazar`, { motivoRechazo }).then(r => r.data),
  getInsigniasStats: () =>
    axiosClient.get('/api/admin/insignias/stats').then(r => r.data),

  // ── Catálogo
  getProductosAdmin: (params) =>
    axiosClient.get('/api/admin/catalogo/productos', { params }).then(r => r.data),
  getProductoAdminById: (id) =>
    axiosClient.get(`/api/admin/catalogo/productos/${id}`).then(r => r.data),
  eliminarProducto: (id, motivo) =>
    axiosClient.delete(`/api/admin/catalogo/productos/${id}`, { data: { motivo } }).then(r => r.data),
  suspenderProducto: (id, motivo) =>
    axiosClient.patch(`/api/admin/catalogo/productos/${id}/suspender`, { motivo }).then(r => r.data),
  restaurarProducto: (id) =>
    axiosClient.patch(`/api/admin/catalogo/productos/${id}/restaurar`).then(r => r.data),

  // ── Pedidos
  getPedidosAdmin: (params) =>
    axiosClient.get('/api/admin/pedidos', { params }).then(r => r.data),
  getPedidoAdminById: (id) =>
    axiosClient.get(`/api/admin/pedidos/${id}`).then(r => r.data),
  intervenirPedido: (id, payload) =>
    axiosClient.patch(`/api/admin/pedidos/${id}/intervenir`, payload).then(r => r.data),

  // ── Disputas
  getDisputas: (params) =>
    axiosClient.get('/api/admin/disputas', { params }).then(r => r.data),
  getDisputaById: (id) =>
    axiosClient.get(`/api/admin/disputas/${id}`).then(r => r.data),
  tomarDisputa: (id) =>
    axiosClient.post(`/api/admin/disputas/${id}/tomar`).then(r => r.data),
  resolverDisputa: (id, payload) =>
    axiosClient.post(`/api/admin/disputas/${id}/resolver`, payload).then(r => r.data),

  // ── Cambiar rol
  cambiarRolUsuario: (id, rol) =>
    axiosClient.patch(`/api/admin/usuarios/${id}/rol`, { rol }).then(r => r.data),

  // ── Exportar CSV
  exportarUsuariosCsv: () =>
    axiosClient.get('/api/admin/usuarios/export', { responseType: 'blob' }).then(r => r.data),
  exportarPedidosCsv: () =>
    axiosClient.get('/api/admin/pedidos/export', { responseType: 'blob' }).then(r => r.data),

  // ── Reembolso
  reembolsarPedido: (id, motivo) =>
    axiosClient.post(`/api/admin/pedidos/${id}/reembolsar`, { motivo }).then(r => r.data),

  // ── Health monitor
  getHealth: () =>
    axiosClient.get('/api/admin/health').then(r => r.data),

  // ── Broadcast notificaciones
  enviarBroadcast: (payload) =>
    axiosClient.post('/api/admin/broadcast', payload).then(r => r.data),
}
