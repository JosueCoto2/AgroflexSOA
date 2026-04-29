# 📊 REPORTE ESTADO COMPLETO DEL SISTEMA AGROFLEX
**Generado:** 23 de marzo de 2026  
**Estado General:** 38% completado (MVP próximo: 6-8 semanas)

---

## 📋 TABLA DE CONTENIDOS
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Backend](#estado-backend)
3. [Estado Frontend](#estado-frontend)
4. [Servicios Principales](#servicios-principales)
5. [Matriz de Integraciones Pendientes](#matriz-de-integraciones-pendientes)
6. [Plan de Prioridades](#plan-de-prioridades)
7. [Estimado de Esfuerzo](#estimado-de-esfuerzo)

---

## 🎯 RESUMEN EJECUTIVO

### Panorama General

```
┌─────────────────────────────────────────┐
│ AGROFLEX SOA - ESTADO MARZO 2026        │
├─────────────────────────────────────────┤
│ Microservicios: 2/10 funcionales        │ ████░░░░░░░░░░░░░░░░ 20%
│ Pantallas Frontend: 10/18 completas     │ ██████████░░░░░░░░░░ 55%
│ Integraciones API: 0/5 activas          │ ░░░░░░░░░░░░░░░░░░░░░░░░ 0%
│ Estado General: 38%                     │ ██████░░░░░░░░░░░░░░░░░ 38%
└─────────────────────────────────────────┘
```

### Qué funciona AHORA (Producción-Ready)
✅ **Login y Registro** — Autenticación completa con JWT + Firebase  
✅ **Catálogo** — Visualizar productos (cosechas, suministros) con filtros  
✅ **Publicar Producto** — Productores pueden publicar cosechas/suministros  
✅ **Dashboards por Rol** — Interfaces diferenciadas para productor/comprador/proveedor  
✅ **Gestión Usuarios** — Creación, roles y perfiles básicos  

### Qué está en progreso (Interfaz lista, backend incompleto)
🔄 **Mis Pedidos** — UI construida, espera orders-service  
🔄 **Escanear QR** — UI lista, espera qr-service  
🔄 **Insignias de Vendedor** — UI construida, falta lógica backend  

### Qué FALTA COMPLETAMENTE (Crítico para MVP)
❌ **Sistema de Pedidos (orders-service)** — Core de la plataforma  
❌ **Pagos con Escrow (payments-service)** — Seguridad de transacciones  
❌ **Validación y QR (qr-service)** — Garantía de productos  
❌ **Notificaciones (notifications-service)** — Alertas a usuarios  
❌ **Gestión de Usuarios (users-service)** — Perfiles y reputación  
❌ **Dashboard Admin** — Supervisión de la plataforma  
❌ **Inteligencia Artificial (ml-service)** — Recomendaciones  

---

## 🔧 ESTADO BACKEND

### Microservicios Implementados ✅

#### 1. **agroflex-auth-service** (Puerto 8081) ✅ COMPLETO
**Estado:** Producción-Ready  
**Funcionalidades:**
- ✅ Login con email/password + JWT  
- ✅ Registro de usuarios con validación  
- ✅ Refresh tokens  
- ✅ Recuperación de contraseña  
- ✅ Integración con Firebase (Google OAuth)  
- ✅ 6 roles implementados (PRODUCTOR, INVERNADERO, PROVEEDOR, EMPAQUE, COMPRADOR, ADMIN)  

**Endpoints Principales:**
```
POST   /api/auth/login              # Autenticar usuario
POST   /api/auth/register           # Crear cuenta
POST   /api/auth/refresh            # Renovar JWT
POST   /api/auth/forgot-password    # Iniciar reset
POST   /api/auth/reset-password     # Completar reset
```

**Tecnologías:** Spring Security 3.2.3, JWT (HS256), BCrypt, Firebase Admin SDK

---

#### 2. **agroflex-catalog-service** (Puerto 8082) ✅ COMPLETO
**Estado:** Producción-Ready  
**Funcionalidades:**
- ✅ CRUD de Cosechas (Lote)  
- ✅ CRUD de Productos (Suministros)  
- ✅ Imagen Gallery para productos  
- ✅ Tipos de cultivo (catálogo)  
- ✅ Búsqueda y filtrado  
- ✅ Paginación  

**Endpoints Principales:**
```
GET    /api/cosechas                # Listar cosechas (filtrado)
GET    /api/cosechas/{id}           # Detalle cosecha
POST   /api/cosechas                # Crear cosecha (requiere JWT)
PUT    /api/cosechas/{id}           # Editar cosecha
DELETE /api/cosechas/{id}           # Eliminar cosecha

GET    /api/productos               # Listar suministros
POST   /api/productos               # Crear suministro
GET    /api/tipos-cultivo          # Catálogo de cultivos
```

**Tecnologías:** Spring Data JPA, MySQL, Cloudinary (imágenes)

---

#### 3. **agroflex-gateway** (Puerto 8080) ✅ COMPLETO
**Estado:** Producción-Ready  
**Funcionalidades:**
- ✅ Enrutamiento de requests a microservicios  
- ✅ Filtro JWT validado  
- ✅ CORS configurado  
- ✅ Balanceo de carga  

**Rutas:**
```
/api/auth/**      → agroflex-auth-service:8081
/api/cosechas/**  → agroflex-catalog-service:8082
/api/productos/** → agroflex-catalog-service:8082
```

---

#### 4. **agroflex-eureka-server** (Puerto 8761) ✅ COMPLETO
**Estado:** Producción-Ready  
**Funcionalidades:**
- ✅ Service Discovery  
- ✅ Registro automático de microservicios  

---

### Microservicios NO Implementados ❌

#### 5. **agroflex-orders-service** (Puerto 8084) ❌ FALTA
**Prioridad:** 🔴 CRÍTICA  
**Estado:** No iniciado (solo pom.xml vacío)  

**Funcionalidades Requeridas:**
- Crear pedidos (comprador → vendedor)  
- Consultar "Mis Pedidos" (filtrado por rol)  
- Cambiar estado de pedido (PENDIENTE → CONFIRMADO → EN_TRANSITO → ENTREGADO → COMPLETADO)  
- Validar stock contra catálogo  
- Retener pago en escrow  
- Notificar cambios de estado  
- Historial de transacciones  

**Tabla de Base de Datos Requerida:**
```sql
CREATE TABLE ordenes_transaccion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  id_comprador BIGINT NOT NULL,
  id_vendedor BIGINT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  total_monto DECIMAL(10,2) NOT NULL,
  monto_escrow DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(50),
  id_transaccion_pago VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_comprador) REFERENCES usuarios(id),
  FOREIGN KEY (id_vendedor) REFERENCES usuarios(id)
);

CREATE TABLE items_pedido (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_orden BIGINT NOT NULL,
  id_producto BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);
```

**Endpoints Principales:**
```
POST   /api/orders                   # Crear nueva orden
GET    /api/orders/{orderId}         # Detalle
GET    /api/orders/mis-pedidos       # Listar órdenes del usuario
PUT    /api/orders/{orderId}/status  # Cambiar estado
DELETE /api/orders/{orderId}         # Cancelar
GET    /api/orders/estadisticas     # Stats del vendedor
```

**Dependencias Internas:**
- `PaymentServiceClient` → Crear transacción en payments-service  
- `QrServiceClient` → Generar código de validación  
- `CatalogServiceClient` → Validar producto y stock  
- `NotificationServiceClient` → Enviar alertas  

---

#### 6. **agroflex-payments-service** (Puerto 8085) ❌ FALTA
**Prioridad:** 🔴 CRÍTICA  
**Estado:** No iniciado (solo pom.xml vacío)  

**Funcionalidades Requeridas:**
- Integración con Stripe (API Key)  
- Crear transacción de pago  
- Retener en escrow (no transferir hasta validación QR)  
- Liberar pago una vez validado QR  
- Procesar reembolsos  
- Historial de transacciones  
- Webhooks de Stripe (confirmación de pago)  

**Tabla de Base de Datos Requerida:**
```sql
CREATE TABLE pagos_transaccion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_orden BIGINT NOT NULL,
  referencia_stripe VARCHAR(100) UNIQUE,
  monto DECIMAL(10,2) NOT NULL,
  estado VARCHAR(30) NOT NULL,  -- PENDIENTE, COMPLETADO, REEMBOLSADO
  metodo VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id)
);
```

**Endpoints Principales:**
```
POST   /api/payments/crear           # Crear pago en Stripe
GET    /api/payments/{paymentId}     # Estado de pago
PUT    /api/payments/{paymentId}/liberar # Liberar escrow
POST   /api/payments/webhook         # Webhook de Stripe
```

---

#### 7. **agroflex-qr-service** (Puerto 8086) ❌ FALTA
**Prioridad:** 🔴 CRÍTICA  
**Estado:** No iniciado  

**Funcionalidades Requeridas:**
- Generar código QR único por orden  
- Validar QR con GPS (verificar entrega en ubicación correcta)  
- Liberar pago en escrow tras validación  
- Marcar orden como ENTREGADA  

**Tabla de Base de Datos Requerida:**
```sql
CREATE TABLE qr_validacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_orden BIGINT NOT NULL UNIQUE,
  codigo_qr VARCHAR(255) UNIQUE NOT NULL,
  latitud DECIMAL(10,8),
  longitud DECIMAL(10,8),
  rango_permitido_metros INT DEFAULT 500,
  validado BOOLEAN DEFAULT FALSE,
  fecha_validacion TIMESTAMP,
  FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id)
);
```

**Endpoints Principales:**
```
POST   /api/qr/generar               # Generar QR para orden
POST   /api/qr/validar               # Validar QR + GPS
GET    /api/qr/{codigoQr}            # Obtener validación
```

---

#### 8. **agroflex-notifications-service** (Puerto 8088) ❌ FALTA
**Prioridad:** 🟡 MEDIA  
**Estado:** No iniciado  

**Funcionalidades Requeridas:**
- Notificaciones SMS (Twilio)  
- Email (SendGrid o SMTP)  
- Push notifications (FCM)  
- Alertas en tiempo real de:
  - Cambios de estado de orden  
  - Solicitud de insignia  
  - Nuevos pedidos recibidos  
  - Pagos confirmados  

**Endpoints Principales:**
```
POST   /api/notifications/email      # Enviar email
POST   /api/notifications/sms        # Enviar SMS
POST   /api/notifications/push       # Enviar push via FCM
```

---

#### 9. **agroflex-users-service** (Puerto 8083) ❌ FALTA
**Prioridad:** 🟡 MEDIA  
**Estado:** No iniciado  

**Funcionalidades Requeridas:**
- Perfil extendido de usuario  
- Insignias y reputación  
- Historial de transacciones  
- Reseñas y calificaciones  
- Wishlist/favoritos  

**Endpoints Principales:**
```
GET    /api/users/{userId}           # Perfil
PUT    /api/users/{userId}           # Actualizar perfil
GET    /api/users/{userId}/insignias # Insignias ganadas
GET    /api/users/{userId}/resenas   # Reseñas recibidas
POST   /api/users/{userId}/resena    # Dejar reseña
```

---

#### 10. **agroflex-admin-service** (Puerto 8089) ⚠️ INCOMPLETO
**Prioridad:** 🟡 MEDIA  
**Estado:** Estructura básica, falta lógica  

**Funcionalidades Requeridas:**
- Dashboard con KPIs  
- Gestión de usuarios  
- Gestión de disputas  
- Gestión de insignias  
- Reportes y analytics  
- Moderación de productos  

---

#### 11. **agroflex-ml-service** 🐍 PYTHON ❌ FALTA
**Prioridad:** 🟢 BAJA  
**Estado:** Solo requirements.txt, sin código  

**Funcionalidades Requeridas:**
- Recomendaciones de productos  
- Predicción de precios  
- Detección de fraude  
- Análisis de tendencias  

---

## 💻 ESTADO FRONTEND

### Pantallas Completadas ✅ (10/18)

| Pantalla | Ruta | Estado | Notas |
|----------|------|--------|-------|
| **Login** | `/login` | ✅ Completa | JWT + Firebase integrado |
| **Registro** | `/register` | ✅ Completa | Validación completa |
| **Catálogo Público** | `/catalogo` | ✅ Completa | Filtros y búsqueda funcionales |
| **Detalle Producto** | `/producto/:id` | ✅ Completa | Imágenes y descripción |
| **Dashboard Productor** | `/dashboard/productor` | ✅ Completa | Acciones rápidas |
| **Publicar Cosecha** | `/publicar-cosecha` | ✅ Completa | Integrado con catalog-service |
| **Dashboard Comprador** | `/dashboard/comprador` | ✅ Completa | Ver ordenes pendientes |
| **Dashboard Proveedor** | `/dashboard/proveedor` | ✅ Completa | Gestionar inventario |
| **Landing Page** | `/` | ✅ Completa | Marketing y features |
| **Perfil de Usuario** | `/profile` | ✅ Completa | Datos básicos |

### Pantallas Parcialmente Completas 🔄 (3/18)

| Pantalla | Ruta | Estado | Falta |
|----------|------|--------|-------|
| **Mis Pedidos** | `/mis-pedidos` | 🔄 UI lista | Backend: orders-service |
| **Escanear QR** | `/escanear-qr` | 🔄 UI lista | Backend: qr-service |
| **Insignias** | `/verify-badge` | 🔄 UI lista | Lógica de validación |

### Pantallas NO Iniciadas ❌ (5/18)

| Pantalla | Ruta | Prioridad | Dependencia |
|----------|------|-----------|------------|
| **Carrito de Compra** | `/carrito` | 🟡 Media | orders-service |
| **Checkout** | `/checkout` | 🔴 Crítica | payments-service |
| **Dashboard Admin** | `/admin` | 🟡 Media | admin-service |
| **Gestión Usuarios (Admin)** | `/admin/usuarios` | 🟡 Media | users-service |
| **Reportes** | `/admin/reportes` | 🟢 Baja | analytics |

### Estructura de Componentes

**Componentes Reutilizables** ✅
- `Navbar` — Navegación principal  
- `Card` — Tarjeta de producto  
- `Button` — Botones estándar  
- `Modal` — Diálogos  
- `Loading` — Spinners  
- `Alert` — Notificaciones  

**Custom Hooks** ✅
- `useAuth()` — Contexto de autenticación  
- `useGeolocation()` — GPS  
- `useQRScanner()` — Cámara QR  
- `useProductos()` — Catálogo  
- `usePedidos()` — Órdenes (parcial)  
- `useAdminCatalogo()` — Admin catálogo  

**Contextos React** ✅
- `AuthContext` — Usuario autenticado + JWT  
- `CartContext` — Carrito de compras  
- `NotificationContext` — Alertas  

**Zustand Stores** ✅
- `authStore.js` — Datos de usuario  
- `catalogStore.js` — Productos  
- `orderStore.js` — Pedidos (TODO)  

---

## 🌐 SERVICIOS (APIs) PRINCIPALES

### Integraciones Externas Pendientes

| Servicio | Estado | Prioridad | Costo | Documentación |
|----------|--------|-----------|-------|---------------|
| **Stripe** (Pagos) | ❌ Falta | 🔴 Crítica | $0.29/transacción | https://stripe.com/docs |
| **Twilio** (SMS) | ❌ Falta | 🟡 Media | $0.0075/SMS | https://twilio.com/docs |
| **SendGrid** (Email) | ❌ Falta | 🟡 Media | $0.10/1000 | https://sendgrid.com/docs |
| **Firebase** (FCM) | ✅ Usado | ✅ Listo | Gratis | https://firebase.google.com |
| **Cloudinary** (Imágenes) | ✅ Usado | ✅ Listo | $0.10-1.00/imagen | https://cloudinary.com |
| **Google Maps API** | ❌ Falta | 🟡 Media | $7/1000 requests | https://developers.google.com/maps |
| **OpenAI** (ML) | ❌ Falta | 🟢 Baja | $0.002/1K tokens | https://openai.com/api |

---

## 📊 MATRIZ DE INTEGRACIONES PENDIENTES

```
┌──────────────────────────────────────────────────────────────┐
│ DEPENDENCIAS ENTRE SERVICIOS                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React + Zustand)                                  │
│       ↓     ↓       ↓        ↓                                │
│  ┌────────────────────────────────────────────┐              │
│  │  API Gateway (puerto 8080)                 │              │
│  │  - JWT Validation Filter                   │              │
│  │  - CORS Configurado                        │              │
│  └────────────────────────────────────────────┘              │
│       ↓     ↓       ↓        ↓        ↓                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Eureka Service Discovery (puerto 8761)                 │ │
│  │ Registra dinámicamente todos los microservicios        │ │
│  └─────────────────────────────────────────────────────────┘ │
│       ↓     ↓       ↓        ↓        ↓                       │
│   [Auth]  [Cat]   [Ord]   [Pay]   [QR]   [Not]  [User]       │
│   ✅      ✅      ❌      ❌      ❌       ❌     ❌           │
│  8081    8082    8084    8085    8086    8088   8083          │
│                                                               │
│  FLUJO CRÍTICO DE COMPRA:                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Usuario autentica (Auth: 8081)                    │   │
│  │ 2. Navega catálogo (Catalog: 8082)                   │   │
│  │ 3. Crea orden (Orders: 8084) ← FALTA               │   │
│  │ 4. Paga (Payments: 8085) ← FALTA                    │   │
│  │ 5. Valida con QR (QR: 8086) ← FALTA                │   │
│  │ 6. Libera pago (Payments: 8085) ← FALTA             │   │
│  │ 7. Notifica (Notifications: 8088) ← FALTA          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 PLAN DE PRIORIDADES

### FASE 1: MVP (Semanas 1-6) — Permitir Compra Básica

**Objetivo:** Login → Catálogo → Comprar → Pagar → Validar → Completar

**Tareas:**

#### Semana 1-2: **orders-service** 🔴
- [ ] Crear estructura base Spring Boot  
- [ ] Implementar modelo `OrdenTransaccion` y `ItemPedido`  
- [ ] Endpoints CRUD  
- [ ] Validación de stock contra catalog-service  
- [ ] Estado de pedido (máquina de estados)  
- [ ] Tests unitarios  

#### Semana 2-3: **payments-service** 🔴
- [ ] Integración Stripe API  
- [ ] Crear transacción + escrow  
- [ ] Webhooks de confirmación  
- [ ] Liberar/reembolsar pago  
- [ ] Historial de transacciones  

#### Semana 3-4: **qr-service** 🔴
- [ ] Generar código QR por orden  
- [ ] Validar GPS + QR  
- [ ] Marcar como entregada  
- [ ] Liberar pago tras validación  

#### Semana 4-5: **Integración Frontend**
- [ ] Conectar carrito → orders-service  
- [ ] Pantalla checkout + Stripe.js  
- [ ] Flujo escáner QR completo  
- [ ] Testing E2E  

#### Semana 5-6: **Testing + Deployment**
- [ ] Tests de carga  
- [ ] Documentación API (Swagger)  
- [ ] Deploy a producción  

---

### FASE 2: Funcionalidades Secundarias (Semanas 7-10)

#### **notifications-service** 🟡
- SMS con Twilio  
- Email con SendGrid  
- Push via Firebase Cloud Messaging  

#### **users-service** 🟡
- Perfiles extendidos  
- Sistema de insignias  
- Reseñas y calificaciones  
- Wishlist  

#### **Dashboard Admin** 🟡
- KPIs principales  
- Gestión de usuarios  
- Moderación  

---

### FASE 3: Optimización (Semanas 11+)

#### **ml-service** 🟢
- Recomendaciones  
- Predicción de precios  

#### **Analytics & Reportes**
- Dashboards detallados  
- Exportación de datos  

---

## 📈 ESTIMADO DE ESFUERZO

### Por Componente

| Componente | Horas | Complejidad | Sprint |
|------------|-------|-------------|--------|
| orders-service (backend) | 80 | 🔴 Alta | 2 semanas |
| payments-service (backend) | 60 | 🔴 Alta | 1.5 semanas |
| qr-service (backend) | 40 | 🟡 Media | 1 semana |
| Integración Frontend | 40 | 🟡 Media | 1 semana |
| notifications-service | 30 | 🟡 Media | 1 semana |
| users-service | 50 | 🟡 Media | 1.5 semanas |
| Dashboard Admin | 40 | 🟡 Media | 1 semana |
| ml-service | 60 | 🔴 Alta | 2 semanas |
| **TOTAL MVP** | **310 horas** | - | **6-8 semanas** |

### Velocidad de Equipo

- **1 developer:** 8 semanas MVP  
- **2 developers:** 4-5 semanas MVP (1 backend, 1 frontend)  
- **3 developers:** 3-4 semanas MVP (2 backend, 1 frontend)  

---

## 🔗 CHECKLIST DE INTEGRACIONES

### Backend → Backend (Feign Clients)

- [ ] orders-service → catalog-service (validar stock)  
- [ ] orders-service → payments-service (crear transacción)  
- [ ] orders-service → qr-service (generar QR)  
- [ ] orders-service → notifications-service (alertas)  
- [ ] payments-service → orders-service (actualizar estado)  
- [ ] qr-service → payments-service (liberar escrow)  
- [ ] qr-service → orders-service (validar entrega)  

### Frontend → Backend (API Calls)

- [ ] AuthStore → auth-service (login/registro)  
- [ ] CatalogStore → catalog-service (productos)  
- [ ] OrderStore → orders-service (crear/listar)  
- [ ] Checkout → payments-service (pagar)  
- [ ] QRScanner → qr-service (validar QR)  
- [ ] NotificationContext → notifications-service (pushes)  
- [ ] UserProfile → users-service (perfil)  

### Integraciones Externas

- [ ] Firebase Auth SDK (OAuth Google)  
- [ ] Stripe.js (formulario de pago)  
- [ ] Twilio SDK (envío SMS)  
- [ ] SendGrid SDK (envío email)  
- [ ] Cloudinary (carga de imágenes)  
- [ ] Google Maps API (geolocalización)  

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|--------|-----------|
| Stripe API delay | 🟡 Media | 🔴 Alto | Implementar reintentos + async |
| GPS inaccuración (QR) | 🔴 Alta | 🟡 Media | Aumentar rango a 1km |
| Pérdida de datos en escrow | 🟢 Baja | 🔴 Crítico | Transacciones ACID + audit log |
| Sobrecargar catalog-service | 🟡 Media | 🟡 Media | Caché con Redis |
| Spam de pedidos | 🟡 Media | 🟡 Media | Rate limiting en Gateway |

---

## 📝 NOTAS FINALES

### Para Iniciar Fase 1

1. **Revisar tablas de BD** — Ejecutar scripts SQL en `agroflexsoa`  
2. **Bootstrapear orders-service** — Copiar estructura de auth-service  
3. **Crear Feign clients** — Plantillas en dependency examples  
4. **Testing en Postman** — Antes de integración frontend  
5. **Documentación API** — Swagger/OpenAPI en cada service  

### Stack Confirmado

**Backend:**
- Java 21 + Spring Boot 3.2.3  
- MySQL 8.0  
- Spring Cloud (Eureka, Feign, Gateway)  
- JWT (HS256)  

**Frontend:**
- React 18.2 + Vite  
- Tailwind CSS  
- Zustand (state management)  
- Axios (HTTP client)  

**Externo:**
- Stripe (pagos)  
- Firebase (auth + FCM)  
- Cloudinary (imágenes)  

---

**Última actualización:** 23 de marzo de 2026  
**Próxima revisión:** Semanalmente durante MVP  
**Responsable:** Tech Lead
