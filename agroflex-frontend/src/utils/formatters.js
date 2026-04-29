// ─── Formateadores de datos para la UI de AgroFlex ───────────────────────────

// Precio en pesos mexicanos
export const formatPrecio = (amount) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)

// Peso/cantidad con unidad
export const formatCantidad = (cantidad, unidad) =>
  `${new Intl.NumberFormat('es-MX').format(cantidad)} ${unidad}`

// Fecha en formato mexicano
export const formatFecha = (dateString) =>
  new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))

// Estrellas como array para mapear en UI
export const formatEstrellas = (puntuacion) => {
  const llenas = Math.floor(puntuacion)
  const vacia = 5 - llenas
  return {
    llenas,
    vacia,
    puntuacion: puntuacion.toFixed(1),
  }
}

// Color de badge según estado de orden
export const getBadgeClase = (estado) => {
  const mapa = {
    PAGO_RETENIDO: 'badge-escrow',
    EN_TRANSITO: 'badge-en-ruta',
    LISTO_VALIDACION: 'badge-en-ruta',
    PAGO_LIBERADO: 'badge-liberado',
    DISPUTADO: 'badge-disputa',
    CANCELADO: 'badge-disputa',
    PENDIENTE_PAGO: 'badge-escrow',
  }
  return mapa[estado] || 'badge-escrow'
}

// Etiqueta legible del estado de orden
export const getLabelEstado = (estado) => {
  const mapa = {
    PENDIENTE_PAGO: 'Pendiente de pago',
    PAGO_RETENIDO: 'Pago retenido',
    EN_TRANSITO: 'En camino',
    LISTO_VALIDACION: 'Listo para entregar',
    PAGO_LIBERADO: 'Completado',
    DISPUTADO: 'En disputa',
    CANCELADO: 'Cancelado',
    REEMBOLSADO: 'Reembolsado',
  }
  return mapa[estado] || estado
}

// Iniciales para avatar (máximo 2 caracteres)
export const getIniciales = (nombre, apellidos = '') =>
  `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()

// Color de avatar determinístico por nombre
export const getColorAvatar = (nombre) => {
  const colores = [
    { bg: '#C8EDD4', text: '#0F4C2A' },
    { bg: '#DFF5BB', text: '#285212' },
    { bg: '#E8ECEE', text: '#1E2A30' },
    { bg: '#BFEA82', text: '#1A3A08' },
    { bg: '#91D9A8', text: '#14572F' },
  ]
  const index = nombre.charCodeAt(0) % colores.length
  return colores[index]
}
