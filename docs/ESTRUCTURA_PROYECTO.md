# Estructura del Proyecto AgroflexSOA

Plataforma de marketplace agrícola con arquitectura de microservicios SOA.

---

## Arquitectura General

```
Frontend (React, :5173) → API Gateway (:8080) → Microservicios → MySQL 8.0
                                                       ↕
                                               Eureka (:8761)
```

---

## Backend — Microservicios Spring Boot 3.2.3 / Java 21

### Servicios

| Servicio | Puerto | Descripción |
|---|---|---|
| `agroflex-eureka-server` | 8761 | Service Discovery |
| `agroflex-gateway` | 8080 | API Gateway (enrutamiento + JWT filter) |
| `agroflex-config-server` | 8888 | Configuración centralizada |
| `agroflex-auth-service` | 8081 | Auth, JWT, Firebase, Insignias |
| `agroflex-catalog-service` | 8082 | Cosechas, Productos, Suministros |
| `agroflex-admin-service` | 8089 | Dashboard, Usuarios, Disputas, Insignias |
| `agroflex-users-service` | 8083 | Perfiles de usuario (en desarrollo) |
| `agroflex-orders-service` | 8084 | Procesamiento de pedidos (en desarrollo) |
| `agroflex-payments-service` | 8085 | Pagos (en desarrollo) |
| `agroflex-qr-service` | 8086 | Generación/verificación QR (en desarrollo) |
| `agroflex-geolocation-service` | 8087 | Funciones de geolocalización (en desarrollo) |
| `agroflex-notifications-service` | 8088 | Notificaciones (en desarrollo) |
| `agroflex-ml-service` | - | Machine Learning (placeholder) |

---

### Auth Service (`agroflex-auth-service` — puerto 8081)

```
src/main/java/com/agroflex/auth/
├── controller/
│   ├── AuthController.java
│   └── FirebaseTokenController.java
├── service/
│   ├── AuthService.java
│   ├── JwtService.java
│   └── RolService.java
├── model/
│   ├── Usuario.java
│   ├── Rol.java
│   ├── SolicitudInsignia.java
│   └── InsigniaVendedor.java
├── repository/
│   ├── UsuarioRepository.java
│   ├── RolRepository.java
│   └── SolicitudInsigniaRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── SecurityConfig.java
│   └── UserDetailsServiceImpl.java
├── dto/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── AuthResponse.java
│   ├── RefreshTokenRequest.java
│   ├── GoogleLoginRequest.java
│   └── SolicitudInsigniaRequest.java
├── config/
│   └── FirebaseConfig.java
└── exception/
    └── GlobalExceptionHandler.java
```

**Funcionalidades:** Registro/login, tokens JWT, login con Google (Firebase), solicitud de insignias de vendedor.

---

### Catalog Service (`agroflex-catalog-service` — puerto 8082)

```
src/main/java/com/agroflex/catalog/
├── controller/
│   ├── CosechaController.java
│   ├── ProductoController.java
│   └── SuministroController.java
├── service/
│   ├── CosechaService.java
│   └── TipoCultivoService.java
├── model/
│   ├── CosechaLote.java
│   ├── Producto.java
│   ├── SuministroTienda.java
│   ├── ImagenGaleria.java
│   ├── TipoCultivo.java
│   └── InsigniaVendedorLite.java
├── repository/
│   ├── CosechaLoteRepository.java
│   ├── ImagenGaleriaRepository.java
│   ├── TipoCultivoRepository.java
│   └── InsigniaVendedorRepository.java
├── dto/
│   ├── LoteRequest.java
│   ├── LoteResponse.java
│   ├── LoteFiltrosRequest.java
│   ├── LoteCercanoRequest.java
│   └── CatalogoPageResponse.java
└── exception/
    └── LoteNoEncontradoException.java
```

**Funcionalidades:** Lotes de cosecha, productos, suministros, filtrado, búsqueda por geolocalización, galería de imágenes.

---

### Admin Service (`agroflex-admin-service` — puerto 8089)

```
src/main/java/com/agroflex/admin/
├── controller/
│   ├── AdminDashboardController.java
│   ├── AdminCatalogoController.java
│   ├── AdminPedidosController.java
│   ├── AdminDisputasController.java
│   ├── AdminInsigniasController.java
│   └── AdminUsuariosController.java
├── dto/
│   ├── DashboardStatsDTO.java
│   ├── DisputaDTO.java
│   ├── InsigniaDecisionDTO.java
│   ├── ProductoAdminDTO.java
│   └── UsuarioResumenDTO.java
└── model/
    ├── Disputa.java
    └── Producto.java
```

**Funcionalidades:** Estadísticas del dashboard, gestión de usuarios, resolución de disputas, aprobación de insignias, moderación del catálogo.

---

### API Gateway (`agroflex-gateway` — puerto 8080)

- Enrutamiento a todos los microservicios vía path predicates
- Filtro JWT para validar tokens entrantes
- Archivo clave: `JwtAuthFilter.java`

---

## Frontend — React 18 + Vite + TailwindCSS (puerto 5173)

```
agroflex-frontend/src/
├── api/
│   ├── axiosClient.js        # Axios config + interceptor JWT automático
│   ├── authApi.js
│   ├── catalogApi.js
│   ├── ordersApi.js
│   ├── paymentsApi.js
│   ├── qrApi.js
│   └── usersApi.js
│
├── store/                    # Estado global con Zustand
│   ├── authStore.js          # Usuario, tokens, roles
│   ├── catalogStore.js       # Productos y cosechas
│   └── orderStore.js         # Pedidos
│
├── hooks/                    # Custom hooks
│   ├── useAuth.js
│   ├── useDebounce.js
│   ├── useGeolocation.js
│   ├── useImageUpload.js     # Subida a Firebase Storage
│   ├── usePagination.js
│   ├── usePedidos.js
│   ├── useProductos.js
│   ├── usePWAInstall.js
│   ├── useQRScanner.js       # Escaneo QR con html5-qrcode
│   ├── useScrollReveal.js
│   ├── useAdminCatalogo.js
│   ├── useAdminDisputas.js
│   ├── useAdminInsignias.js
│   ├── useAdminPedidos.js
│   ├── useAdminStats.js
│   └── useAdminUsuarios.js
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── VerifyBadgePage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminCatalogo.jsx
│   │   ├── AdminDisputas.jsx
│   │   ├── AdminInsignias.jsx
│   │   ├── AdminPedidos.jsx
│   │   └── AdminUsuarios.jsx
│   ├── producer/
│   │   ├── PublishHarvestPage.jsx
│   │   └── DashboardProducer.jsx
│   ├── buyer/
│   │   ├── DashboardBuyer.jsx
│   │   ├── MisPedidos.jsx
│   │   └── EscanearQR.jsx
│   └── supplier/
│       └── (páginas de suministros)
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── MetricaCard.jsx
│   │   ├── SolicitudInsigniaCard.jsx
│   │   ├── DisputaCard.jsx
│   │   ├── ToastNotification.jsx
│   │   └── UsuarioModal.jsx
│   ├── catalog/
│   │   ├── HarvestCard/
│   │   ├── HarvestFilter/
│   │   └── MapView/
│   └── common/
│       ├── Button/
│       ├── Card/
│       ├── Input/
│       ├── Modal/
│       ├── Spinner/
│       └── Logo/
│
└── services/
    ├── firebase.js               # Configuración Firebase
    ├── firebaseAuthService.js    # Auth con Firebase
    ├── storageService.js         # Firebase Storage
    ├── authService.js
    ├── adminService.js
    ├── pedidoService.js
    ├── productoService.js
    └── geolocationService.js
```

---

## Base de Datos

- **Motor**: MySQL 8.0 (puerto 3306)
- **Base de datos**: `agroflexsoa` (dev) / `agroflex_db` (Docker)
- **ORM**: Hibernate/JPA con MySQL8Dialect
- **Patrón**: Base de datos compartida entre todos los microservicios

---

## Integraciones Externas

| Servicio | Uso |
|---|---|
| **Firebase Auth** | Login con Google, verificación de tokens |
| **Firebase Storage** | Subida y almacenamiento de imágenes |
| **Firebase Firestore** | Configurado (uso parcial) |
| **Cloudinary** | Hosting alternativo de imágenes |

---

## Roles del Sistema

| Rol | Acceso |
|---|---|
| `ADMIN` | Panel completo: usuarios, disputas, insignias, catálogo |
| `PRODUCTOR` | Publicar cosechas, gestionar productos |
| `COMPRADOR` | Catálogo, pedidos, escanear QR |
| `PROVEEDOR` | Gestión de suministros |

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje |
| Spring Boot | 3.2.3 | Framework principal |
| Spring Cloud | 2023.0.0 | Eureka, Gateway |
| Spring Security + JWT (jjwt) | 0.12.3 | Autenticación |
| Firebase Admin SDK | 9.2.0 | Integración Firebase |
| MySQL Connector | 8.3.0 | Base de datos |
| Hibernate/JPA | - | ORM |
| Lombok | - | Reducción de boilerplate |
| Maven | - | Build tool |
| Docker + Docker Compose | - | Contenedorización |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2.0 | UI Framework |
| Vite | 4.5.0 | Build tool |
| React Router | 6.20.0 | Enrutamiento |
| Zustand | 4.4.0 | Estado global |
| Axios | 1.6.0 | HTTP client |
| TailwindCSS | 3.3.0 | Estilos |
| React Hook Form | 7.50.0 | Formularios |
| Yup | 1.3.0 | Validación |
| Firebase | 12.10.0 | Auth & Storage |
| Lucide React | 0.577.0 | Iconos |
| date-fns | 4.1.0 | Fechas |
| html5-qrcode | 2.3.8 | Escaneo QR |
| Swiper | 12.1.2 | Carruseles |
| Vitest | 0.34.0 | Testing |

---

## Flujo de Comunicación

```
Usuario
  ↓
Frontend React (http://localhost:5173)
  ↓  [Vite proxy: /api → :8080]
API Gateway (http://localhost:8080)
  ↓  [Valida JWT + enruta]
  ├── /api/auth/**     → Auth Service    (:8081)
  ├── /api/catalog/**  → Catalog Service (:8082)
  ├── /api/admin/**    → Admin Service   (:8089)
  └── ...otros servicios
          ↓
      MySQL 8.0 (:3306)
```

---

## Infraestructura de Desarrollo

- **Entorno local**: XAMPP + Windows 11
- **Servidores dev**: Vite (:5173) + Spring Boot (:8080–8089)
- **Contenedores**: Docker Compose orquesta todos los servicios
- **VCS**: Git — rama principal `main`
- **Archivo Docker**: `agroflex-backend/docker/docker-compose.yml`

---

*Generado el 2026-03-20*
