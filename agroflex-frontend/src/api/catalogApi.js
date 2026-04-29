import axiosClient from './axiosClient'

// ─── Catálogo público ────────────────────────────────────────────────────────

export const getLotes = (filtros) =>
  axiosClient.get('/api/catalog/lotes', { params: filtros })

export const getLoteDetalle = (id) =>
  axiosClient.get(`/api/catalog/lotes/${id}`)

export const buscarLotes = (query, page = 0, size = 12) =>
  axiosClient.get('/api/catalog/lotes/buscar', { params: { query, page, size } })

export const getLotesCercanos = (lat, lng, radioKm = 50, limite = 20) =>
  axiosClient.post('/api/catalog/lotes/cercanos', {
    latitud: lat,
    longitud: lng,
    radioKm,
    limite,
  })

export const getTiposCultivo = (categoria) =>
  axiosClient.get('/api/catalog/cultivos', {
    params: categoria ? { categoria } : undefined,
  })

// ─── Operaciones de productor (requieren JWT) ────────────────────────────────

// Cosechas → POST /api/catalog/lotes  (LoteRequest: titulo, idCultivo, precioUnitario, cantidadTotal…)
export const publicarLote = (data) =>
  axiosClient.post('/api/catalog/lotes', data)

// Suministros → POST /api/productos  (CrearProductoRequest: nombre, precio, stock, unidad…)
export const crearProducto = (data) =>
  axiosClient.post('/api/productos', data)

export const actualizarLote = (id, data) =>
  axiosClient.put(`/api/catalog/lotes/${id}`, data)

export const cambiarEstadoLote = (id, estado) =>
  axiosClient.patch(`/api/catalog/lotes/${id}/estado`, { estado })

export const getMisLotes = () =>
  axiosClient.get('/api/catalog/mis-lotes')

export const eliminarLote = (id) =>
  axiosClient.delete(`/api/catalog/lotes/${id}`)
