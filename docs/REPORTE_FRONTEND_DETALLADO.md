# 📊 REPORTE DETALLADO DEL FRONTEND - AGROFLEX

**Fecha de Generación:** 22 de marzo de 2026  
**Versión del Proyecto:** 0.0.1  
**Stack Principal:** React 18.2 + Vite + Tailwind CSS + Zustand

---

## 📑 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
4. [Sistema de Diseño (Design System)](#sistema-de-diseño)
5. [Configuración de Compilación](#configuración-de-compilación)
6. [Componentes Principales](#componentes-principales)
7. [Páginas y Rutas](#páginas-y-rutas)
8. [Estado Global (Zustand Stores)](#estado-global-zustand-stores)
9. [Custom Hooks](#custom-hooks)
10. [Servicios y API](#servicios-y-api)
11. [Contextos React](#contextos-react)
12. [Utilidades y Helpers](#utilidades-y-helpers)
13. [Estado de Implementación](#estado-de-implementación)
14. [Hallazgos y Recomendaciones](#hallazgos-y-recomendaciones)

---

## 1. VISIÓN GENERAL

**AgroFlex Frontend** es una aplicación React moderna diseñada como una plataforma de marketplace agrícola. Funciona como interfaz para tres tipos de usuarios principales:

- **Productores:** Publican y gestionan cosechas
- **Compradores:** Buscan lotes de productos agrícolas
- **Proveedores:** Operan tiendas de suministros
- **Administradores:** Gestionan la plataforma

### Objetivo Principal
Proporcionar una experiencia de usuario intuitiva y responsive para transacciones agrícolas, con enfoque en verificación de productos, escaneo de códigos QR y gestión de órdenes.

### Características Clave
- ✅ Autenticación con JWT + Firebase
- ✅ Catálogo de productos con filtros avanzados
- ✅ Escaneo de códigos QR
- ✅ Dashboard con rol específico
- ✅ Sistema de insignias/verificación
- ✅ Panel de administración
- ✅ Geolocalización
- ✅ Gestión de órdenes
- ✅ Pagos con Stripe
- ✅ Soporte para PWA

---

## 2. ESTRUCTURA DEL PROYECTO

```
agroflex-frontend/
├── src/
│   ├── api/                    # Clientes HTTP para microservicios
│   │   ├── axiosClient.js      # Configuración de Axios
│   │   ├── authApi.js          # Endpoints de autenticación
│   │   ├── catalogApi.js       # Endpoints de catálogo
│   │   └── ordersApi.js        # Endpoints de órdenes
│   ├── assets/                 # Imágenes, fuentes, recursos estáticos
│   ├── components/             # Componentes React reutilizables
│   │   ├── admin/              # Componentes específicos para administrador
│   │   ├── catalog/            # Componentes de catálogo
│   │   ├── catalogo/           # Componentes de catálogo (versión alternativa)
│   │   ├── common/             # Componentes compartidos
│   │   ├── feed/               # Componentes del feed social
│   │   ├── landing/            # Componentes de página de inicio
│   │   ├── layout/             # Layouts (App, Dashboard, Sidebar, etc.)
│   │   ├── pedidos/            # Componentes de gestión de órdenes
│   │   ├── qr/                 # Componentes de escaneo QR
│   │   └── shared/             # Componentes compartidos adicionales
│   ├── context/                # React Context
│   │   ├── AuthContext.jsx     # Contexto de autenticación (TODO)
│   │   ├── CartContext.jsx     # Contexto del carrito
│   │   └── NotificationContext.jsx  # Contexto de notificaciones
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.js          # Hook de autenticación
│   │   ├── useAdminCatalogo.js
│   │   ├── useAdminDisputas.js
│   │   ├── useAdminInsignias.js
│   │   ├── useAdminPedidos.js
│   │   ├── useAdminStats.js
│   │   ├── useAdminUsuarios.js
│   │   ├── useDebounce.js
│   │   ├── useGeolocation.js
│   │   ├── useImageUpload.js
│   │   ├── useMediaQuery.js
│   │   ├── usePagination.js
│   │   ├── usePedidos.js
│   │   ├── useProductos.js
│   │   ├── usePWAInstall.js
│   │   ├── useQRScanner.js
│   │   └── useScrollReveal.js
│   ├── pages/                  # Páginas/Vistas de la aplicación
│   │   ├── admin/              # Páginas de administrador
│   │   ├── auth/               # Páginas de autenticación
│   │   ├── buyer/              # Páginas del comprador
│   │   ├── catalog/            # Páginas del catálogo
│   │   ├── feed/               # Páginas del feed
│   │   ├── producer/           # Páginas del productor
│   │   ├── shared/             # Páginas compartidas
│   │   └── supplier/           # Páginas del proveedor
│   ├── routes/                 # Configuración de rutas
│   │   ├── AppRouter.jsx       # Router principal
│   │   └── routeConfig.js      # Configuración de rutas
│   ├── services/               # Servicios de negocio
│   │   ├── adminService.js
│   │   ├── authService.js
│   │   ├── firebaseAuthService.js
│   │   ├── firebase.js
│   │   ├── geolocationService.js
│   │   ├── pedidoService.js
│   │   ├── productoService.js
│   │   ├── qrService.js
│   │   └── stripeService.js
│   ├── store/                  # Zustand stores (Estado global)
│   │   ├── authStore.js        # Store de autenticación
│   │   ├── catalogStore.js     # Store del catálogo
│   │   └── orderStore.js       # Store de órdenes (TODO)
│   ├── utils/                  # Funciones de utilidad
│   │   ├── constants.js        # Constantes (colores, config)
│   │   ├── formatters.js       # Funciones de formateo
│   │   ├── geoUtils.js         # Utilidades de geolocalización
│   │   ├── menuConfig.js       # Configuración del menú
│   │   └── validators.js       # Validadores
│   ├── App.jsx                 # Componente raíz
│   ├── index.css               # Estilos globales
│   └── main.jsx                # Punto de entrada
├── public/                     # Archivos estáticos
│   └── images/                 # Imágenes públicas
├── package.json               # Dependencias del proyecto
├── vite.config.js             # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind CSS
├── postcss.config.js          # Configuración de PostCSS
├── DESIGN_SYSTEM.md           # Guía del sistema de diseño
└── index.html                 # HTML base
```

---

## 3. TECNOLOGÍAS Y DEPENDENCIAS

### Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|----------|
| **react** | 18.2.0 | Framework principal |
| **react-dom** | 18.2.0 | Renderizado DOM |
| **react-router-dom** | 6.20.0 | Enrutamiento |
| **zustand** | 4.4.0 | Gestión de estado global |
| **axios** | 1.6.0 | Cliente HTTP |
| **react-hook-form** | 7.50.0 | Gestión de formularios |
| **yup** | 1.3.0 | Validación de esquemas |
| **@hookform/resolvers** | 3.3.0 | Integración Yup + React Hook Form |
| **firebase** | 12.10.0 | Autenticación y servicios |
| **html5-qrcode** | 2.3.8 | Escaneo de códigos QR |
| **jwt-decode** | 4.0.0 | Decodificación de JWT |
| **lucide-react** | 0.577.0 | Iconos SVG |
| **swiper** | 12.1.2 | Carruseles |
| **date-fns** | 4.1.0 | Manipulación de fechas |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|----------|
| **vite** | 4.5.0 | Bundler y servidor de desarrollo |
| **@vitejs/plugin-react** | 4.2.0 | Plugin React para Vite |
| **tailwindcss** | 3.3.0 | Framework CSS utilitario |
| **postcss** | 8.4.0 | Procesador CSS |
| **autoprefixer** | 10.4.0 | Prefijos CSS automáticos |
| **vitest** | 0.34.0 | Framework de testing |
| **@testing-library/react** | 14.1.0 | Testing de componentes |
| **@testing-library/jest-dom** | 6.1.0 | Matchers para testing |

### Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor de desarrollo
  "build": "vite build",            // Compilación para producción
  "preview": "vite preview",        // Vista previa de build
  "test": "vitest"                  // Ejecutar tests
}
```

---

## 4. SISTEMA DE DISEÑO

### 🎨 Paleta de Colores Principal

El sistema de colores está basado en el logo oficial de AgroFlex:

#### **Verde Principal (#3BAF2A)**
- **Uso:** Botones CTA, links activos, navbar, hero background
- **Escala Tailwind:**
  - `verde-50`: `#F0FBEE` - Fondos sutiles
  - `verde-100`: `#D8F5D0` - Badges, tags
  - `verde-400`: `#3BAF2A` - **COLOR PRINCIPAL** - Botones, links
  - `verde-500`: `#2A8A1C` - Hover botones
  - `verde-600`: `#1F6B14` - Precios, texto activo
  - `verde-700`: `#174F0E` - Texto sobre fondos claros
  - `verde-900`: `#0D1F0A` - Navbar, footer, hero

#### **Tinta (Fondos Oscuros/Neutros)**
- **Uso:** Fondos oscuros, navbar, neutros del sistema
- **Escala Tailwind:**
  - `tinta-50`: `#F6FAF5` - Niebla, fondo página
  - `tinta-100`: `#EEF7EA` - Fondos cards suaves
  - `tinta-200`: `#E0EDD8` - Bordes, separadores
  - `tinta-300`: `#C0D8B8` - Hover states suaves
  - `tinta-400`: `#8AAE82` - Iconos secundarios
  - `tinta-500`: `#5A7E52` - Texto secundario
  - `tinta-900`: `#0D1F0A` - Navbar, fondos dark

#### **Ambar (Acento Cálido)**
- **Uso:** Highlights, acentos cálidos
- **Escalas:**
  - `ambar-50`: `#FFF4DC` - Fondos suaves
  - `ambar-100`: `#FFE5A8` - Acentos visibles
  - `ambar-400`: `#F5A623` - **ACENTO PRINCIPAL**
  - `ambar-500`: `#E09010` - Hover
  - `ambar-700`: `#A06408` - Texto sobre fondo claro

#### **Colores Semánticos**

| Estado | Fondo | Texto | Icono | Uso |
|--------|-------|-------|-------|-----|
| **Éxito** | `#D8F5D0` | `#174F0E` | `#3BAF2A` | Pago liberado, QR válido, usuario verificado |
| **Advertencia** | `#FFF4DC` | `#A06408` | `#F5A623` | Escrow retenido, pendiente, en tránsito |
| **Error** | `#FEE5E1` | `#7A2419` | `#E74C3C` | Transacción fallida, error validación |
| **Info** | `#E3F4FF` | `#1A567E` | `#3498DB` | Información general |

### 📐 Tipografía

- **Fuente Principal:** Sistema de fuentes del SO (Sans-serif)
- **Espaciado:** Escala Tailwind estándar
- **Tamaño de fuente:**
  - `text-xs`: 12px
  - `text-sm`: 14px
  - `text-base`: 16px
  - `text-lg`: 18px
  - `text-xl`: 20px
  - `text-2xl`: 24px
  - `text-3xl`: 30px

### 🔘 Componentes Estándar

#### Botones
```jsx
// Primario — verde
<button className="btn-primary">Publicar mi cosecha</button>

// Secundario — outline verde
<button className="btn-secondary">Más información</button>

// Ghost blanco — para fondos oscuros
<button className="btn-ghost-white">Buscar lotes</button>
```

#### Badges
```jsx
// Categoría (Hortalizas, Frutas)
<span className="badge-category">Hortalizas</span>

// Verificado
<span className="badge-verified">✓ Verificado</span>

// Estados de orden
<span className="badge-liberado">Pago Liberado</span>
<span className="badge-escrow">En escrow</span>
<span className="badge-en-ruta">En camino</span>
<span className="badge-disputa">En disputa</span>
```

#### Cards
- Cards con sombra suave (`shadow-sm`)
- Padding estándar (`p-4`)
- Radio de borde (`rounded-lg`)
- Fondo blanco o `tinta-50`

---

## 5. CONFIGURACIÓN DE COMPILACIÓN

### Vite Configuration

```javascript
// vite.config.js
- Puerto: 5173
- Host: 0.0.0.0 (accesible desde cualquier interfaz)
- Proxy: /api → http://localhost:8080
- Plugin React Hot Module Replacement (HMR)
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
- Extensión de tema con colores personalizados
- Content: './src/**/*.{js,jsx}'
- Plugins: Autoprefixer integrado
- Modo JIT habilitado
```

### PostCSS Configuration

```javascript
// postcss.config.js
- Plugins: Tailwind CSS, Autoprefixer
- Procesamiento automático de prefijos navegadores
```

---

## 6. COMPONENTES PRINCIPALES

### 6.1 Componentes de Landing Page

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **Navbar** | `components/landing/Navbar.jsx` | Navegación principal de la página de inicio |
| **HeroCarousel** | `components/landing/HeroCarousel.jsx` | Carrusel principal con Swiper |
| **HowItWorks** | `components/landing/HowItWorks.jsx` | Sección explicativa del proceso |
| **RolesSection** | `components/landing/RolesSection.jsx` | Descripción de roles (Productor, Comprador, Proveedor) |
| **TrustSignals** | `components/landing/TrustSignals.jsx` | Señales de confianza, testimonios |
| **Gallery** | `components/landing/Gallery.jsx` | Galería de imágenes |
| **Footer** | `components/landing/Footer.jsx` | Pie de página |
| **FinalCTA** | `components/landing/FinalCTA.jsx` | Llamada a la acción final |

### 6.2 Componentes de Layout

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **AppLayout** | `components/layout/AppLayout/AppLayout.jsx` | Layout gen principal de la aplicación |
| **DashboardLayout** | `components/layout/DashboardLayout/DashboardLayout.jsx` | Layout para dashboards |
| **LeftSidebar** | `components/layout/LeftSidebar/LeftSidebar.jsx` | Barra lateral izquierda |
| **MiniSidebar** | `components/layout/MiniSidebar/MiniSidebar.jsx` | Sidebar colapsable |
| **TopNavbar** | `components/layout/TopNavbar/TopNavbar.jsx` | Barra de navegación superior |
| **TabBar** | `components/layout/TabBar/TabBar.jsx` | Barra de pestañas (móvil) |
| **RightPanel** | `components/layout/RightPanel/RightPanel.jsx` | Panel derecho |
| **DrawerMenu** | `components/layout/DrawerMenu/DrawerMenu.jsx` | Menú desplegable |
| **PrivateRoute** | `components/layout/PrivateRoute/PrivateRoute.jsx` | Componente para rutas protegidas |

### 6.3 Componentes de Catálogo

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **NavbarPrincipal** | `components/catalogo/NavbarPrincipal.jsx` | Navbar accesible desde el catálogo |
| **CatalogoGrid** | `components/catalogo/CatalogoGrid.jsx` | Grid de productos |
| **ProductCard** | `components/catalogo/ProductCard.jsx` | Card individual de producto |
| **SkeletonCard** | `components/catalogo/SkeletonCard.jsx` | Skeleton loader para cards |
| **FiltrosAvanzados** | `components/catalogo/FiltrosAvanzados.jsx` | Panel de filtros avanzados |
| **BarraFiltros** | `components/catalogo/BarraFiltros.jsx` | Barra de filtros rápidos |
| **DestacadosCarrusel** | `components/catalogo/DestacadosCarrusel.jsx` | Carrusel de productos destacados |
| **CarruselInformativo** | `components/catalogo/CarruselInformativo.jsx` | Carrusel informativo |
| **BannerVendedor** | `components/catalogo/BannerVendedor.jsx` | Banner del vendedor |
| **FABPublicar** | `components/catalogo/FABPublicar.jsx` | Botón flotante para publicar |

### 6.4 Componentes de Código QR

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **EscanerVisor** | `components/qr/EscanerVisor/EscanerVisor.jsx` | Visor del escáner QR (html5-qrcode) |
| **PermisoCamara** | `components/qr/PermisoCamara/PermisoCamara.jsx` | Solicitud de permisos de cámara |
| **EntradaManual** | `components/qr/EntradaManual/EntradaManual.jsx` | Entrada manual de código QR |
| **ResultadoValidacion** | `components/qr/ResultadoValidacion/ResultadoValidacion.jsx` | Mostrar resultado de validación |

### 6.5 Componentes de Órdenes/Pedidos

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **TabsPedidos** | `components/pedidos/TabsPedidos.jsx` | Tabs de estados de órdenes |
| **OrdenCard** | `components/pedidos/OrdenCard.jsx` | Card de una orden |
| **FiltroPedidos** | `components/pedidos/FiltroPedidos.jsx` | Filtros para órdenes |

### 6.6 Componentes de Feed Social

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **FeedLoteCard** | `components/feed/FeedLoteCard/FeedLoteCard.jsx` | Card de lote en el feed |
| **FeedLoteCardSkeleton** | `components/feed/FeedLoteCard/FeedLoteCardSkeleton.jsx` | Skeleton del feed card |
| **LoteStory** | `components/feed/LoteStory/LoteStory.jsx` | Story de lote (similar a Instagram) |

### 6.7 Componentes de Admin

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **AdminLayout** | `components/admin/AdminLayout.jsx` | Layout del panel admin |
| **AdminSidebar** | `components/admin/AdminSidebar.jsx` | Sidebar específico del admin |
| **AdminRoute** | `components/admin/AdminRoute.jsx` | Ruta protegida para admin |
| **MetricaCard** | `components/admin/MetricaCard.jsx` | Card de métrica del dashboard |
| **ActividadReciente** | `components/admin/ActividadReciente.jsx` | Widget de actividad reciente |
| **ToastNotification** | `components/admin/ToastNotification.jsx` | Toast de notificaciones |
| **ConfirmModal** | `components/admin/ConfirmModal.jsx` | Modal de confirmación |
| **UsuarioRow** | `components/admin/UsuarioRow.jsx` | Fila de usuario en tabla |
| **UsuarioModal** | `components/admin/UsuarioModal.jsx` | Modal para gestionar usuario |
| **SolicitudInsigniaCard** | `components/admin/SolicitudInsigniaCard.jsx` | Card de solicitud de insignia |
| **DisputaCard** | `components/admin/DisputaCard.jsx` | Card de disputa |

### 6.8 Componentes Compartidos

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **AgroFlexLogo** | `components/common/Logo/AgroFlexLogo.jsx` | Logo de AgroFlex |
| **LogoutButton** | `components/common/LogoutButton/LogoutButton.jsx` | Botón de logout |
| **PasoCard** | `components/common/PasoCard/PasoCard.jsx` | Card de paso/sección |
| **LotePreviewCard** | `components/common/LotePreviewCard/LotePreviewCard.jsx` | Vista previa de lote |
| **TestimonioCard** | `components/common/TestimonioCard/TestimonioCard.jsx` | Card de testimonio |
| **ImageUploader** | `components/shared/ImageUploader.jsx` | Componente para subir imágenes |

---

## 7. PÁGINAS Y RUTAS

### 7.1 Páginas de Autenticación

| Página | Ruta | Propósito |
|--------|------|----------|
| **LoginPage** | `/login` | Formulario de inicio de sesión |
| **RegisterPage** | `/register` | Formulario de registro |
| **ForgotPasswordPage** | `/forgot-password` | Recuperación de contraseña |
| **ResetPasswordPage** | `/reset-password` | Cambio de contraseña |
| **VerifyBadgePage** | `/verify-badge` | Verificación de insignia |

### 7.2 Páginas Compartidas

| Página | Ruta | Propósito |
|--------|------|----------|
| **LandingPage** | `/` | Página de inicio principal |
| **ProfilePage** | `/profile` | Perfil del usuario |
| **ReputationPage** | `/reputation` | Página de reputación/calificaciones |

### 7.3 Páginas del Productor

| Página | Ruta | Propósito |
|--------|------|----------|
| **DashboardProducer** | `/dashboard/productor` | Dashboard del productor |
| **PublishHarvestPage** | `/productor/publicar-cosecha` | Publicar nueva cosecha |
| **MyHarvestsPage** | `/productor/mis-cosechas` | Ver mis cosechas |

### 7.4 Páginas del Comprador

| Página | Ruta | Propósito |
|--------|------|----------|
| **DashboardBuyer** | `/dashboard/comprador` | Dashboard del comprador |
| **MyOrdersPage** | `/comprador/mis-ordenes` | Ver mis órdenes |
| **MisPedidos** | `/comprador/mis-pedidos` | Alternativa de mis órdenes |
| **ScanQRPage** | `/comprador/escanear-qr` | Página de escaneo QR |
| **EscanearQR** | `/comprador/escanear` | Alternativa escaneo QR |

### 7.5 Páginas del Proveedor

| Página | Ruta | Propósito |
|--------|------|----------|
| **DashboardSupplier** | `/dashboard/proveedor` | Dashboard del proveedor |
| **ManageStorePage** | `/proveedor/gestionar-tienda` | Gestionar tienda de suministros |

### 7.6 Páginas del Catálogo

| Página | Ruta | Propósito |
|--------|------|----------|
| **CatalogPage** | `/catalogo` | Catálogo principal |
| **HarvestDetailPage** | `/catalogo/:id` | Detalle de un lote |
| **SupplyStorePage** | `/tienda/:id` | Página de tienda de suministros |

### 7.7 Páginas del Admin

| Página | Ruta | Propósito |
|--------|------|----------|
| **DashboardAdmin** | `/admin/dashboard` | Dashboard administrativo |
| **AdminPedidos** | `/admin/pedidos` | Gestión de órdenes |
| **AdminUsuarios** | `/admin/usuarios` | Gestión de usuarios |
| **AdminCatalogo** | `/admin/catalogo` | Gestión del catálogo |
| **AdminInsignias** | `/admin/insignias` | Gestión de insignias |
| **AdminDisputas** | `/admin/disputas` | Gestión de disputas |
| **TransactionsPage** | `/admin/transacciones` | Ver transacciones |

### 7.8 Páginas de Feed Social

| Página | Ruta | Propósito |
|--------|------|----------|
| **FeedPage** | `/feed` | Feed de lotes sociales |

---

## 8. ESTADO GLOBAL (ZUSTAND STORES)

### 8.1 AuthStore (`src/store/authStore.js`)

**Propósito:** Gestionar autenticación, tokens y datos del usuario

**Estado:**
```javascript
{
  user: null,                    // Datos del usuario autenticado
  accessToken: null,             // JWT access token
  refreshToken: null,            // JWT refresh token
  isAuthenticated: false,        // Bandera de autenticación
  isLoading: false,              // Estado de carga
  error: null,                   // Mensajes de error
}
```

**Acciones Principales:**
- `setTokens(accessToken, refreshToken)` - Establecer tokensJWT
- `login(correo, password)` - Iniciar sesión
- `register(data)` - Registro de nuevos usuarios
- `logout()` - Cerrar sesión
- `loginConGoogle()` - Login con Google (Firebase)
- `forgotPassword(correo)` - Solicitar cambio de contraseña
- `resetPassword(token, password)` - Resetear contraseña
- `solicitarInsignia()` - Solicitar insignia de verificación

**Middleware:** `persist` - Persiste en localStorage

### 8.2 CatalogStore (`src/store/catalogStore.js`)

**Propósito:** Gestionar el catálogo de lotes y filtros

**Estado:**
```javascript
{
  lotes: [],                     // Array de lotes con precio, productor, etc.
  loteActual: null,              // Lote seleccionado
  lotesCercanos: [],             // Lotes cercanos (geolocalización)
  tiposCultivo: [],              // Tipos de cultivos disponibles
  filtros: {
    idCultivo: null,
    estadoRepublica: '',
    municipio: '',
    precioMin: null,
    precioMax: null,
    unidadVenta: '',
    gradoCalidad: '',
    esOrganico: null,
    ordenarPor: 'fecha_desc',
    page: 0,
    size: 12,
  },
  busqueda: '',                  // Término de búsqueda
  totalPaginas: 0,
  totalElementos: 0,
  paginaActual: 0,
  hayMas: false,
  isLoading: false,
  error: null,
}
```

**Acciones Principales:**
- `fetchLotes()` - Cargar lotes con filtros aplicados
- `fetchDetalle(id)` - Cargar detalle de lote individual
- `buscar(query, page)` - Buscar lotes por término
- `setFiltros(nuevosFiltros)` - Actualizar filtros
- `limpiarFiltros()` - Reiniciar filtros
- `fetchTiposCultivo()` - Cargar tipos de cultivo
- `fetchLotesCercanos(lat, lng)` - Cargar lotes cercanos por geolocalización

### 8.3 OrderStore (`src/store/orderStore.js`)

**Estado:** ❌ TODO - No implementado aún

**Propósito Planeado:** Gestionar órdenes, carrito y transacciones

**Acciones Esperadas:**
- Crear orden
- Actualizar estado de orden
- Agregar/remover items del carrito
- Procesar pagos
- Obtener historial de órdenes

---

## 9. CUSTOM HOOKS

### Hooks de Autenticación

| Hook | Ubicación | Propósito |
|------|-----------|----------|
| **useAuth** | `hooks/useAuth.js` | Acceso al store de autenticación con helpers (`hasRole`, `isAdmin`) |

### Hooks de Administración

| Hook | Ubicación | Propósito |
|------|-----------|----------|
| **useAdminStats** | `hooks/useAdminStats.js` | Estadísticas del dashboard admin |
| **useAdminUsuarios** | `hooks/useAdminUsuarios.js` | Gestión de usuarios |
| **useAdminPedidos** | `hooks/useAdminPedidos.js` | Gestión de órdenes |
| **useAdminCatalogo** | `hooks/useAdminCatalogo.js` | Gestión del catálogo |
| **useAdminInsignias** | `hooks/useAdminInsignias.js` | Gestión de insignias |
| **useAdminDisputas** | `hooks/useAdminDisputas.js` | Gestión de disputas |

### Hooks de Funcionalidad

| Hook | Ubicación | Propósito |
|------|-----------|----------|
| **useDebounce** | `hooks/useDebounce.js` | Debouncing para búsquedas |
| **useGeolocation** | `hooks/useGeolocation.js` | Obtener geolocalización |
| **useGeolocalizacion** | `hooks/useGeolocalizacion.js` | Alternativa de geolocalización |
| **useImageUpload** | `hooks/useImageUpload.js` | Carga de imágenes |
| **useMediaQuery** | `hooks/useMediaQuery.js` | Consultas de media (responsive) |
| **usePagination** | `hooks/usePagination.js` | Lógica de paginación |
| **usePedidos** | `hooks/usePedidos.js` | Datos de pedidos |
| **useProductos** | `hooks/useProductos.js` | Datos de productos |
| **usePWAInstall** | `hooks/usePWAInstall.js` | Instalación de PWA |
| **useQRScanner** | `hooks/useQRScanner.js` | Escaneo de códigos QR |
| **useScrollReveal** | `hooks/useScrollReveal.js` | Animaciones al scroll |

---

## 10. SERVICIOS Y API

### 10.1 Clientes HTTP

| Archivo | Propósito |
|---------|----------|
| **axiosClient.js** | Instancia configurada de Axios con interceptores |
| **authApi.js** | Endpoints: login, registro, cambio de contraseña |
| **catalogApi.js** | Endpoints: listar lotes, filtros, búsqueda |
| **ordersApi.js** | Endpoints: crear orden, estado, historial |

### 10.2 Servicios de Negocio

| Servicio | Ubicación | Propósito |
|----------|-----------|----------|
| **authService** | `services/authService.js` | Lógica de autenticación |
| **firebaseAuthService** | `services/firebaseAuthService.js` | Integración con Firebase Auth |
| **firebase** | `services/firebase.js` | Configuración de Firebase |
| **productoService** | `services/productoService.js` | Operaciones con productos |
| **pedidoService** | `services/pedidoService.js` | Operaciones con pedidos |
| **adminService** | `services/adminService.js` | Operaciones administrativas |
| **qrService** | `services/qrService.js` | Generación y validación de QR |
| **geolocationService** | `services/geolocationService.js` | Servicios de geolocalización |
| **stripeService** | `services/stripeService.js` | Integración con Stripe para pagos |

---

## 11. CONTEXTOS REACT

### 11.1 AuthContext (`src/context/AuthContext.jsx`)

**Estado:** ❌ TODO - No implementado aún  
**Propósito Planeado:** Proporcionar contexto de autenticación (alternativa a Zustand)

### 11.2 CartContext (`src/context/CartContext.jsx`)

**Propósito:** Gestionar carrito de compras  
**Datos Típicos:**
- Items del carrito
- Total
- Métodos: agregar, remover, actualizar cantidad

### 11.3 NotificationContext (`src/context/NotificationContext.jsx`)

**Propósito:** Manejar notificaciones toast/snackbar  
**Datos Típicos:**
- Notificaciones activas
- Métodos: agregar, remover notificación

---

## 12. UTILIDADES Y HELPERS

### 12.1 constants.js

**Contenido:**
- `COLORS` - Paleta completa de colores del design system
- `ROLES` - Roles de usuario (ADMIN, PRODUCTOR, COMPRADOR, PROVEEDOR)
- `ESTADOS_ORDEN` - Estados posibles de una orden
- `GRADOS_CALIDAD` - Grados de calidad de productos
- `UNIDADES_VENTA` - Unidades de venta (kg, ton, doc, etc.)
- Constantes de la API gateway

### 12.2 formatters.js

**Funciones:**
- `formatearPrecio(valor)` - Formatea números a formato de moneda
- `formatearFecha(fecha, formato)` - Formatea fechas
- `formatearDistancia(metros)` - Convierte metros a km/m
- `truncarTexto(texto, longitud)` - Corta texto a longitud máxima
- `formatearEstado(estado)` - Traduce estados al español

### 12.3 validators.js

**Funciones:**
- `validarEmail(email)` - Valida formato de email
- `validarContraseña(password)` - Valida fortaleza de contraseña
- `validarTeléfono(telefono)` - Valida formato de teléfono
- `validarURL(url)` - Valida URL

### 12.4 geoUtils.js

**Funciones:**
- `calcularDistancia(lat1, lng1, lat2, lng2)` - Calcula distancia entre coordenadas
- `ordenarPorDistancia(puntos, latitud, longitud)` - Ordena puntos por proximidad
- `estarEnRadio(lat1, lng1, lat2, lng2, radio)` - Verifica si punto está en radio

### 12.5 menuConfig.js

**Contenido:**
- Configuración de elementos del menú
- Rutas y permisos según rol
- Labels y iconos

---

## 13. ESTADO DE IMPLEMENTACIÓN

### ✅ Componentes Implementados

| Componente | Estado | Notas |
|-----------|--------|-------|
| Landing Page | ✅ Implementado | Hero, secciones de rol, testimonios |
| Login/Register | ✅ Implementado | Con Firebase y validación Yup |
| AuthStore | ✅ Implementado | JWT + persistencia |
| CatalogStore | ✅ Implementado | Filtros avanzados |
| Catálogo | ✅ Implementado | Grid, filtros, búsqueda |
| Detalle Lote | ✅ Implementado | Información completa del lote |
| QR Scanner | ✅ Implementado | html5-qrcode integrado |
| Admin Panel | ✅ Implementado | Usuarios, órdenes, catálogo, disputas |
| Dashboard Roles | ✅ Implementado | Productor, comprador, proveedor |
| Layouts | ✅ Implementado | AppLayout, DashboardLayout, Admin |

### ⚠️ Parcialmente Implementados

| Componente | Estado | Falta |
|-----------|--------|-------|
| OrderStore | ⚠️ TODO | Lógica completa de órdenes |
| AuthContext | ⚠️ TODO | Contexto alternativo |
| Payment Integration | ⚠️ Básico | Completar integración Stripe |
| Geolocalización | ⚠️ Básico | Optimizar y expandir |

### 🔴 No Implementados

- [ ] PWA offline functionality
- [ ] Sincronización en tiempo real (WebSocket)
- [ ] Notificaciones push
- [ ] Caché avanzado
- [ ] Analytics
- [ ] A/B Testing

---

## 14. HALLAZGOS Y RECOMENDACIONES

### 🔍 Hallazgos Importantes

#### 1. **Arquitectura de Estado Mixta**
- **Hallazgo:** Se usa Zustand para estado global, pero hay contextos sin usar (AuthContext)
- **Recomendación:** Consolidar en Zustand o implementar Context adecuadamente

#### 2. **OrderStore Incompleto**
- **Hallazgo:** `src/store/orderStore.js` está vacío (TODO)
- **Impacto:** Funcionalidades de órdenes pueden carecer de estado global
- **Recomendación:** Implementar siguiendo patrón de `catalogStore.js`

#### 3. **Duplicación de Componentes**
- **Hallazgo:** Existe `components/catalogo/` y `components/catalog/`
- **Recomendación:** Consolidar en una sola carpeta (preferentemente en inglés)

#### 4. **Página de Órdenes Duplicada**
- **Hallazgo:** `MyOrdersPage` y `MisPedidos` parecen ser lo mismo
- **Recomendación:** Consolidar en una única página

#### 5. **Página de QR Duplicada**
- **Hallazgo:** `ScanQRPage` y `EscanearQR` parecen ser lo mismo
- **Recomendación:** Consolidar en una única página

### 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Número de Páginas | 29 |
| Número de Componentes | ~60+ |
| Hooks Personalizados | 14 |
| Stores Zustand | 3 (1 incompleto) |
| Servicios API | 3 + 4 servicios de negocio |
| Temas/Colores Principales | 4 (Verde, Tinta, Ambar, Semánticos) |

### 💡 Recomendaciones de Mejora

#### 1. **Completar OrderStore**
```javascript
// src/store/orderStore.js debe incluir:
- Crear orden
- Obtener órdenes del usuario
- Actualizar estado
- Procesar pago
- Manejo de errores
```

#### 2. **Implementar AuthContext**
```javascript
// Alternativa a Zustand para casos simples
// O eliminar y usar solo Zustand
```

#### 3. **Consolidar Rutas**
```javascript
// Unificar:
- /comprador/mis-ordenes vs /comprador/mis-pedidos
- /comprador/escanear-qr vs /comprador/escanear
- components/catalogo vs components/catalog
```

#### 4. **Implementar Error Boundaries**
```jsx
// Agregar componentes ErrorBoundary
// En AppRouter.jsx y dashboards
```

#### 5. **Mejorar Testing**
- Implementar tests unitarios con Vitest
- Agregar tests de integración
- Cobertura > 80%

#### 6. **Optimizar Rendimiento**
- Implementar Code Splitting con React.lazy()
- Lazy load de imágenes
- Memoización de componentes pesados
- Optimización de bundles

#### 7. **Seguridad**
- Validar todos los inputs en cliente
- Implementar CSRF protection
- Validar permisos en cada ruta
- Sanitizar outputs

#### 8. **Documentación**
- Crear storybook para componentes
- Documentar APIs principales
- Guía de contribución

### 🚀 Próximos Pasos Recomendados

1. **Completar OrderStore** - Crítico para funcionalidad de órdenes
2. **Consolidar rutas duplicadas** - Mejora mantenibilidad
3. **Implementar tests** - Asegurar calidad
4. **Optimizar bundle** - Mejorar velocidad de carga
5. **PWA offline** - Mejorar experiencia en móvil

---

## Resumen Ejecutivo

El frontend de AgroFlex es una **aplicación React moderna, bien estructurada y funcional** con:

✅ **Fortalezas:**
- Diseño system bien definido
- Componentes reutilizables
- Gestión de estado con Zustand
- Autenticación implementada
- Panel de administración completo
- Responsive design con Tailwind

⚠️ **Áreas a Mejorar:**
- Completar OrderStore
- Consolidar rutas duplicadas
- Implementar tests
- Mejorar documentación
- Optimizar rendimiento

📈 **Readiness:** 75% - Funcional pero requiere pulido antes de producción

---

**Generado:** 22 de marzo de 2026  
**Frontend Version:** 0.0.1
