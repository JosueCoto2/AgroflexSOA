export const ROUTES = {
  // Auth
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
  UNAUTHORIZED:    '/unauthorized',
  NOT_FOUND:       '/404',

  // ── Rutas con nombres claros (sin "dashboard")
  MIS_COSECHAS:    '/mis-cosechas',
  PUBLICAR_LOTE:   '/publicar-lote',
  EDITAR_LOTE:     '/mis-cosechas/:id/editar',
  MIS_COMPRAS:     '/mis-compras',
  MI_TIENDA:       '/mi-tienda',
  MI_TIENDA_NUEVO: '/mi-tienda/nuevo',
  PERFIL:          '/perfil',

  // Dashboards legacy (mantener para compatibilidad)
  PRODUCER_DASHBOARD: '/producer/dashboard',
  BUYER_DASHBOARD:    '/buyer/dashboard',
  SUPPLIER_DASHBOARD: '/supplier/dashboard',
  ADMIN_DASHBOARD:        '/admin/dashboard',
  ADMIN_USUARIOS:         '/admin/usuarios',
  ADMIN_USUARIO_DETALLE:  '/admin/usuarios/:id',
  ADMIN_INSIGNIAS:        '/admin/insignias',
  ADMIN_CATALOGO:         '/admin/catalogo',
  ADMIN_PEDIDOS:          '/admin/pedidos',
  ADMIN_DISPUTAS:         '/admin/disputas',
  ADMIN_TRANSACCIONES:    '/admin/transacciones',
  ADMIN_HEALTH:           '/admin/health',
  ADMIN_BROADCAST:        '/admin/broadcast',

  // Catalog
  CATALOG:         '/catalog',
  CATALOG_DETAILS: '/catalog/:id',

  // Producer
  PRODUCER_LOTS:      '/producer/lots',
  PRODUCER_LOTS_NEW:  '/producer/lots/new',
  PRODUCER_ORDERS:    '/producer/orders',

  // Supplier
  SUPPLIER_LOTS:     '/supplier/store',
  SUPPLIER_LOTS_NEW: '/supplier/store/new',
  SUPPLIER_ORDERS:   '/supplier/orders',

  // Orders
  ORDERS:             '/buyer/orders',
  ORDER_DETAILS:      '/buyer/orders/:id',
  MIS_PEDIDOS:        '/mis-pedidos',
  MIS_PEDIDOS_DETALLE:'/mis-pedidos/:orderId',
  MI_QR:              '/mi-qr/:orderId',

  // QR
  QR_SCANNER: '/escanear-qr',

  // Payments
  PAYMENTS:    '/payments',
  PAGAR_ORDEN: '/pagar/:orderId',

  // Profile
  PROFILE: '/profile',

  // Perfil público de vendedor
  VENDEDOR_PERFIL: '/vendedor/:id',

  // Badge / seller verification
  VERIFY_BADGE: '/verify-badge',

  // Home
  HOME: '/',

  // Feed (experiencia social principal)
  FEED: '/feed',

  // Mapa
  MAPA: '/mapa',

  // Usuario autenticado
  NOTIFICACIONES: '/notificaciones',
  RESENAS:        '/resenas',
  CONFIGURACION:  '/configuracion',

  // Stats productor
  PRODUCER_STATS: '/producer/stats',
}
