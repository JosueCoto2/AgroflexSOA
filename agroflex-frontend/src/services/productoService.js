/**
 * productoService.js — CAPA 2/3 (Puente Frontend → catalog-service)
 *
 * Todas las llamadas a /api/productos pasan por aquí.
 * Apunta al catalog-service en http://localhost:8081 (VITE_CATALOG_URL).
 * Si el backend no responde, se devuelven datos mock para desarrollo.
 */

import axiosClient from '../api/axiosClient'

// catalogClient apunta al proxy de Vite → gateway (8080) → catalog-service (8082)
const catalogClient = axiosClient

// ── Mock data (región Puebla) — REEMPLAZAR cuando el backend esté listo
const MOCK_PRODUCTOS = [
  {
    id: 'mock-1',
    nombre: 'Chile Poblano — Lote #001',
    tipo: 'cosecha',
    precio: 8.50,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/1a7a45/ffffff?text=Chile+Poblano', // REEMPLAZAR
    ubicacion: { municipio: 'Tepeaca', estado: 'Puebla' },
    vendedor: { id: 'v1', nombre: 'Rancho San José', rol: 'PRODUCTOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 2500,
    fechaPublicacion: new Date(Date.now() - 1_800_000).toISOString(),
  },
  {
    id: 'mock-2',
    nombre: 'Jitomate Saladette — Lote #023',
    tipo: 'cosecha',
    precio: 12.00,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/c0392b/ffffff?text=Jitomate', // REEMPLAZAR
    ubicacion: { municipio: 'Acatzingo', estado: 'Puebla' },
    vendedor: { id: 'v2', nombre: 'Invernadero Flores', rol: 'INVERNADERO', verificado: true },
    disponibilidad: 'disponible',
    stock: 4800,
    fechaPublicacion: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'mock-3',
    nombre: 'Cebolla Blanca — Lote #089',
    tipo: 'cosecha',
    precio: 5.00,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/e8e0d0/555555?text=Cebolla', // REEMPLAZAR
    ubicacion: { municipio: 'Tepeaca', estado: 'Puebla' },
    vendedor: { id: 'v3', nombre: 'Rancho Las Flores', rol: 'PRODUCTOR', verificado: false },
    disponibilidad: 'disponible',
    stock: 1200,
    fechaPublicacion: new Date(Date.now() - 5_400_000).toISOString(),
  },
  {
    id: 'mock-4',
    nombre: 'Elote Tierno — Lote #045',
    tipo: 'cosecha',
    precio: 3.50,
    unidad: 'pieza',
    imagen: 'https://placehold.co/400x300/f0b429/1a1a1a?text=Elote', // REEMPLAZAR
    ubicacion: { municipio: 'Huixcolotla', estado: 'Puebla' },
    vendedor: { id: 'v4', nombre: 'Rancho El Roble', rol: 'PRODUCTOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 8000,
    fechaPublicacion: new Date(Date.now() - 7_200_000).toISOString(),
  },
  {
    id: 'mock-5',
    nombre: 'Calabaza Italiana — Lote #007',
    tipo: 'cosecha',
    precio: 7.00,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/27ae60/ffffff?text=Calabaza', // REEMPLAZAR
    ubicacion: { municipio: 'Tepeaca', estado: 'Puebla' },
    vendedor: { id: 'v5', nombre: 'Invernadero Verde', rol: 'INVERNADERO', verificado: true },
    disponibilidad: 'disponible',
    stock: 900,
    fechaPublicacion: new Date(Date.now() - 10_800_000).toISOString(),
  },
  {
    id: 'mock-6',
    nombre: 'Papa Alpha — Lote #012',
    tipo: 'cosecha',
    precio: 6.00,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/c9a84c/ffffff?text=Papa', // REEMPLAZAR
    ubicacion: { municipio: 'Acatzingo', estado: 'Puebla' },
    vendedor: { id: 'v6', nombre: 'Rancho Los Pinos', rol: 'PRODUCTOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 5000,
    fechaPublicacion: new Date(Date.now() - 14_400_000).toISOString(),
  },
  {
    id: 'mock-7',
    nombre: 'Fertilizante NPK 20-20-20',
    tipo: 'suministro',
    precio: 450.00,
    unidad: 'saco 25 kg',
    imagen: 'https://placehold.co/400x300/2980b9/ffffff?text=Fertilizante', // REEMPLAZAR
    ubicacion: { municipio: 'Tepeaca', estado: 'Puebla' },
    vendedor: { id: 'v7', nombre: 'Agroquímicos Puebla', rol: 'PROVEEDOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 200,
    fechaPublicacion: new Date(Date.now() - 18_000_000).toISOString(),
  },
  {
    id: 'mock-8',
    nombre: 'Semilla Jitomate Híbrido F1',
    tipo: 'suministro',
    precio: 320.00,
    unidad: 'sobre 500 sem.',
    imagen: 'https://placehold.co/400x300/8e44ad/ffffff?text=Semilla', // REEMPLAZAR
    ubicacion: { municipio: 'Acatzingo', estado: 'Puebla' },
    vendedor: { id: 'v8', nombre: 'Semillas del Campo', rol: 'PROVEEDOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 150,
    fechaPublicacion: new Date(Date.now() - 21_600_000).toISOString(),
  },
  {
    id: 'mock-9',
    nombre: 'Plaguicida Orgánico BioGuard',
    tipo: 'suministro',
    precio: 185.00,
    unidad: 'litro',
    imagen: 'https://placehold.co/400x300/16a085/ffffff?text=Plaguicida', // REEMPLAZAR
    ubicacion: { municipio: 'Tepeaca', estado: 'Puebla' },
    vendedor: { id: 'v9', nombre: 'BioAgro Tepeaca', rol: 'PROVEEDOR', verificado: false },
    disponibilidad: 'disponible',
    stock: 80,
    fechaPublicacion: new Date(Date.now() - 25_200_000).toISOString(),
  },
  {
    id: 'mock-10',
    nombre: 'Malla Sombra 50% — 100 m²',
    tipo: 'suministro',
    precio: 890.00,
    unidad: 'rollo',
    imagen: 'https://placehold.co/400x300/7f8c8d/ffffff?text=Malla+Sombra', // REEMPLAZAR
    ubicacion: { municipio: 'Huixcolotla', estado: 'Puebla' },
    vendedor: { id: 'v10', nombre: 'Insumos Agrícolas HX', rol: 'PROVEEDOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 35,
    fechaPublicacion: new Date(Date.now() - 28_800_000).toISOString(),
  },
  {
    id: 'mock-11',
    nombre: 'Brócoli Premium — Lote #033',
    tipo: 'cosecha',
    precio: 9.50,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/1e8449/ffffff?text=Br%C3%B3coli', // REEMPLAZAR
    ubicacion: { municipio: 'Huixcolotla', estado: 'Puebla' },
    vendedor: { id: 'v11', nombre: 'Invernadero La Sierra', rol: 'INVERNADERO', verificado: true },
    disponibilidad: 'disponible',
    stock: 3200,
    fechaPublicacion: new Date(Date.now() - 32_400_000).toISOString(),
  },
  {
    id: 'mock-12',
    nombre: 'Lechuga Orejona — Lote #019',
    tipo: 'cosecha',
    precio: 4.00,
    unidad: 'pieza',
    imagen: 'https://placehold.co/400x300/58d68d/1a1a1a?text=Lechuga', // REEMPLAZAR
    ubicacion: { municipio: 'Acatzingo', estado: 'Puebla' },
    vendedor: { id: 'v12', nombre: 'Rancho La Paloma', rol: 'PRODUCTOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 6500,
    fechaPublicacion: new Date(Date.now() - 36_000_000).toISOString(),
  },
  {
    id: 'mock-13',
    nombre: 'Aguacate Hass — Lote #057',
    tipo: 'cosecha',
    precio: 18.00,
    unidad: 'kg',
    imagen: 'https://placehold.co/400x300/2ecc71/ffffff?text=Aguacate',
    ubicacion: { municipio: 'Xicoténcatl', estado: 'San Luis Potosí' },
    vendedor: { id: 'v13', nombre: 'Finca La Palma', rol: 'PRODUCTOR', verificado: true },
    disponibilidad: 'disponible',
    stock: 1300,
    fechaPublicacion: new Date(Date.now() - 4_500_000).toISOString(),
  },
  {
    id: 'mock-14',
    nombre: 'Semillas de Maíz Amarillo — Lote #210',
    tipo: 'suministro',
    precio: 120.00,
    unidad: 'saco 25 kg',
    imagen: 'https://placehold.co/400x300/f39c12/ffffff?text=Semillas+Ma%C3%ADz',
    ubicacion: { municipio: 'Tlaxcala', estado: 'Tlaxcala' },
    vendedor: { id: 'v14', nombre: 'AgroSemillas MX', rol: 'PROVEEDOR', verificado: false },
    disponibilidad: 'disponible',
    stock: 320,
    fechaPublicacion: new Date(Date.now() - 9_000_000).toISOString(),
  },
]

// ── Helpers para filtrado mock local
const applyMockFilters = (productos, params) => {
  const { tipo, buscar, municipio } = params
  return productos.filter(p => {
    if (tipo && p.tipo !== tipo) return false
    if (municipio && !p.ubicacion.municipio.toLowerCase().includes(municipio.toLowerCase())) return false
    if (buscar) {
      const q = buscar.toLowerCase()
      const matchNombre   = p.nombre.toLowerCase().includes(q)
      const matchMunicipio = p.ubicacion.municipio.toLowerCase().includes(q)
      const matchVendedor = p.vendedor.nombre.toLowerCase().includes(q)
      if (!matchNombre && !matchMunicipio && !matchVendedor) return false
    }
    return true
  })
}

// ── Helper: normaliza LoteResponse del CosechaController al shape de HarvestCard + HarvestDetailPage
const normalizeLote = (l) => ({
  // Campos que usa HarvestCard
  idLote:              l.idLote,
  titulo:              l.nombreProducto,
  tipoCultivo:         null,
  categoriaCultivo:    null,
  precioUnitario:      l.precio,
  unidadVenta:         l.unidadVenta,
  gradoCalidad:        null,
  esOrganico:          false,
  municipio:           l.ubicacion ?? '',
  estadoRepublica:     '',
  nombreProductor:     l.nombreProductor ?? 'Productor',
  reputacionProductor: l.reputacionProductor ?? 0,
  fotoPerfilProductor: l.fotoPerfilProductor ?? null,
  imagenPrincipalUrl:  l.imagenUrl ?? null,
  // Campos que usa HarvestDetailPage
  id:               l.idLote,
  nombre:           l.nombreProducto,
  tipo:             'cosecha',
  precio:           l.precio,
  unidad:           l.unidadVenta,
  imagen:           l.imagenUrl ?? null,
  stock:            l.cantidadDisponible,
  descripcion:      l.descripcion ?? null,
  contacto:         l.contacto   ?? null,
  fechaPublicacion: l.createdAt,
  ubicacion:        { municipio: l.ubicacion ?? '', estado: '' },
  latitud:          l.latitud  ?? null,
  longitud:         l.longitud ?? null,
  vendedor: {
    id:         l.idProductor,
    nombre:     l.nombreProductor ?? 'Productor',
    rol:        'PRODUCTOR',
    verificado: false,
    fotoPerfil: l.fotoPerfilProductor ?? null,
  },
})

// ── Servicio público
export const productoService = {

  /**
   * Lista lotes con filtros y paginación.
   * Llama a GET /api/catalog/lotes (o /lotes/buscar si hay texto de búsqueda).
   * Normaliza la respuesta al shape { content, totalPages, totalElements, number, last }
   * que espera useProductos.
   */
  async getAll(params = {}) {
    try {
      const { page = 0, size = 12, buscar, orden, tipo, municipio, precioMin, precioMax, unidadVenta } = params

      let rawData
      if (buscar?.trim()) {
        const { data } = await catalogClient.get('/api/catalog/lotes/buscar', {
          params: { query: buscar.trim(), page, size },
        })
        rawData = data
      } else {
        const ordenarPor = orden === 'precio_asc'  ? 'precio_asc'
                         : orden === 'precio_desc' ? 'precio_desc'
                         : 'fecha_desc'
        const { data } = await catalogClient.get('/api/catalog/lotes', {
          params: {
            page, size, ordenarPor,
            ...(precioMin != null && { precioMin }),
            ...(precioMax != null && { precioMax }),
            ...(unidadVenta       && { unidadVenta }),
          },
        })
        rawData = data
      }

      // El CosechaController no filtra por tipo/municipio en servidor → filtro en cliente
      let content = (rawData.lotes ?? []).map(normalizeLote)
      if (tipo)      content = content.filter(p => p.tipo === tipo)
      if (municipio) content = content.filter(p =>
        (p.ubicacion?.municipio ?? '').toLowerCase().includes(municipio.toLowerCase())
      )

      return {
        content,
        totalPages:    rawData.totalPaginas   ?? 1,
        totalElements: rawData.totalElementos ?? content.length,
        number:        rawData.paginaActual   ?? page,
        last:          !rawData.hayMas,
      }
    } catch {
      // Backend no disponible → mock con filtrado y paginación local
      const { page = 0, size = 12, orden } = params
      let filtered = applyMockFilters(MOCK_PRODUCTOS, params)

      if (orden === 'precio_asc')  filtered = [...filtered].sort((a, b) => a.precio - b.precio)
      if (orden === 'precio_desc') filtered = [...filtered].sort((a, b) => b.precio - a.precio)

      filtered = filtered.filter(p => p.nombre && p.nombre.trim().length > 0)
      const start   = page * size
      const content = filtered.slice(start, start + size)
      return {
        content,
        totalPages:    Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        number:        page,
        last:          start + size >= filtered.length,
      }
    }
  },

  /** Detalle de un producto por ID. */
  async getById(id) {
    try {
      const { data } = await catalogClient.get(`/api/catalog/lotes/${id}`)
      return normalizeLote(data)
    } catch {
      return MOCK_PRODUCTOS.find(p => String(p.id) === String(id)) ?? null
    }
  },

  /** Productos destacados para el carrusel (más recientes o marcados). */
  async getDestacados() {
    try {
      const { data } = await catalogClient.get('/api/productos/destacados')
      return data
    } catch {
      return MOCK_PRODUCTOS.slice(0, 5)
    }
  },

  /**
   * Publica un nuevo producto (requiere JWT de PRODUCTOR/INVERNADERO/PROVEEDOR/ADMIN).
   * @param {object} data — campos de CrearProductoRequest
   */
  async crear(data) {
    const { data: created } = await catalogClient.post('/api/productos', data)
    return created
  },

  /** Búsqueda rápida (para el input del navbar). */
  async buscar(query) {
    if (!query?.trim()) return []
    try {
      const { data } = await catalogClient.get('/api/productos/buscar', { params: { q: query } })
      return data
    } catch {
      const q = query.toLowerCase()
      return MOCK_PRODUCTOS.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.ubicacion.municipio.toLowerCase().includes(q) ||
        p.vendedor.nombre.toLowerCase().includes(q)
      )
    }
  },
}
