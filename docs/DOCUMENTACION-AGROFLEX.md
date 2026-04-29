# 📘 Documentación Técnica Completa — AgroFlex
### Última actualización: 16 de marzo de 2026
### Estado general del proyecto: ~38% completado

---

## 0. 📊 ESTADO ACTUAL DEL PROYECTO

> Esta sección es lo primero que debe leer cualquier persona que se una al equipo.

### Porcentaje general de avance

| Categoría | Módulos totales | Completados | En progreso | Sin iniciar |
|-----------|-----------------|-------------|-------------|-------------|
| Microservicios backend | 10 | 2 | 0 | 8 |
| Pantallas frontend | 18 | 10 | 3 | 5 |
| Integraciones externas | 5 | 0 | 1 | 4 |

```
Backend:  [████░░░░░░░░░░░░░░░░] 20%  (2/10 microservicios funcionales)
Frontend: [██████████░░░░░░░░░░] 55%  (10/18 pantallas funcionales)
General:  [██████░░░░░░░░░░░░░░] 38%
```

---

### Tabla de módulos y su estado

| Módulo | Backend | Frontend | Estado general |
|--------|---------|----------|----------------|
| Autenticación (login/registro/JWT) | ✅ Listo | ✅ Listo | ✅ **Completo** |
| Catálogo de productos | ✅ Listo | ✅ Listo | ✅ **Completo** |
| Publicar cosecha/suministro | ✅ Listo | ✅ Listo | ✅ **Completo** |
| Dashboard Productor | N/A | ✅ Listo | ✅ **Completo** |
| Dashboard Comprador | N/A | ✅ Listo | ✅ **Completo** |
| Dashboard Proveedor | N/A | ✅ Listo | ✅ **Completo** |
| Insignia de vendedor (UI) | ❌ Falta lógica | 🔄 UI lista | 🔄 **En progreso** |
| Mis Pedidos | ❌ Falta | ✅ UI lista | 🔄 **En progreso** |
| Escanear QR | ❌ Falta | ✅ UI lista | 🔄 **En progreso** |
| Sistema de pedidos (orders-service) | ❌ Stub | ❌ Falta | ❌ **Pendiente** |
| Pagos escrow (payments-service) | ❌ Stub | ❌ Falta | ❌ **Pendiente** |
| Validación QR + GPS (qr-service) | ❌ Stub | ✅ UI lista | ❌ **Pendiente** |
| Notificaciones SMS/Email | ❌ Stub | ❌ Falta | ❌ **Pendiente** |
| Geolocalización (geo-service) | ❌ Stub | 🔄 Hook listo | ❌ **Pendiente** |
| Gestión de usuarios (users-service) | ❌ Stub | ❌ Falta | ❌ **Pendiente** |
| Reseñas y calificaciones | ❌ Falta | ❌ Falta | ❌ **Pendiente** |
| Dashboard Admin | ❌ Falta | ❌ Stub | ❌ **Pendiente** |
| Inteligencia Artificial (ml-service) | ❌ Stub Python | ❌ Falta | ❌ **Pendiente** |

---

### ✅ Lo que YA funciona hoy (punta a punta)

1. **Login y registro de usuarios** — El frontend llama al auth-service, recibe un JWT válido con roles, y redirige al catálogo.
2. **Catálogo público** — Cualquier visitante puede ver los productos publicados (cosechas y suministros) con filtros, búsqueda y paginación.
3. **Publicar cosecha o suministro** — Un productor/proveedor autenticado puede publicar un producto que aparece en el catálogo inmediatamente.
4. **Dashboards por rol** — Productor, Comprador y Proveedor tienen su propio dashboard con acciones rápidas.
5. **Navegación con roles** — El sistema detecta el rol del JWT y muestra los menús y pantallas correctas.
6. **Detalle de producto** — Se puede ver el detalle completo de cualquier producto del catálogo.

### 🔄 Lo que está en progreso (UI lista, backend falta)

1. **Mis Pedidos** (`/mis-pedidos`) — Pantalla completa construida, espera que `orders-service` tenga el endpoint `GET /api/pedidos/mis-pedidos`.
2. **Escanear QR** (`/escanear-qr`) — Pantalla con escáner de cámara lista, espera que `qr-service` tenga `POST /api/qr/validar`.
3. **Insignia de vendedor** (`/verify-badge`) — UI construida, falta la lógica backend de verificación.

### ❌ Lo que FALTA por construir

**PRIORIDAD ALTA:**
- `orders-service` — Crear, listar y gestionar pedidos entre comprador y vendedor
- `payments-service` — Integración con Stripe/PayPal para cobros con escrow
- `qr-service` — Generación y validación de QR + liberación de pago

**PRIORIDAD MEDIA:**
- `notifications-service` — Twilio SMS + email al crear/completar pedidos
- `users-service` — Gestión de perfil, insignias y reputación
- Dashboard Admin — Panel de administración completo

**PRIORIDAD BAJA:**
- `ml-service` — Predicción de precios y recomendaciones con OpenAI
- Sistema de reseñas y calificaciones
- Reportes y analytics

### Estimado para completar el sistema

Para llegar a un MVP funcional (login → publicar → comprar → pagar → validar QR):
- `orders-service`: ~2 semanas de desarrollo
- `payments-service` (solo Stripe): ~1.5 semanas
- `qr-service`: ~1 semana
- Conectar frontend con los 3 servicios: ~1 semana
- **Total estimado MVP:** ~5-6 semanas de trabajo enfocado en el backend

---

## 1. ¿Qué es AgroFlex y qué hace?

AgroFlex es un **marketplace agrícola digital** pensado para la región Tepeaca-Acatzingo-Huixcolotla, Puebla, México. Su objetivo es eliminar a los **coyotes** (intermediarios que compran barato al productor y venden caro al comprador), conectando directamente a quien produce con quien compra.

### El problema que resuelve

En el campo mexicano, los productores venden su cosecha a intermediarios por precios muy bajos porque no tienen forma de llegar directamente a los compradores (centros de empaque, tiendas, restaurantes). AgroFlex crea ese canal directo con pagos seguros.

### ¿Quién usa AgroFlex y para qué?

| Rol | Quién es | Qué puede hacer |
|-----|----------|-----------------|
| **PRODUCTOR** | Agricultor con parcela | Publica sus cosechas, recibe pedidos, valida entregas con QR |
| **INVERNADERO** | Productor en invernadero | Igual que productor, para producción controlada |
| **EMPAQUE** | Centro de empaque o acopiador | Explora el catálogo, compra producto, hace pedidos |
| **COMPRADOR** | Cualquier comprador registrado | Busca productos, hace pedidos, paga con escrow |
| **PROVEEDOR** | Vendedor de agroinsumos | Publica semillas, fertilizantes, herramientas |
| **ADMIN** | Equipo AgroFlex | Gestiona toda la plataforma |

---

## 2. 🖥️ REQUISITOS E INSTALACIÓN DEL ENTORNO COMPLETO

### Requisitos previos

#### Java Development Kit (JDK)
- **Versión requerida: Java 21** (extraído del `pom.xml`: `<java.version>21</java.version>`)
- Descarga oficial: https://adoptium.net (elegir "Temurin 21 LTS")
- Verificar instalación:
  ```bash
  java --version
  # Debe mostrar: openjdk 21.x.x
  ```
- ⚠️ **AgroFlex NO funciona con Java 17 o inferior** — usa características de Java 21.

#### Apache Maven
- **Versión requerida: 3.9.x o superior**
- Descarga: https://maven.apache.org/download.cgi
- Verificar:
  ```bash
  mvn --version
  # Debe mostrar: Apache Maven 3.9.x
  ```
- 💡 Si no tienes Maven instalado globalmente, puedes usar la ruta absoluta del Maven que usa VS Code:
  ```
  C:/Users/TU_USUARIO/AppData/Roaming/Code/User/globalStorage/pleiades.java-extension-pack-jdk/maven/latest/bin/mvn.cmd
  ```

#### MySQL / MariaDB
- **Versión requerida: MySQL 8.0 o MariaDB 10.6+**
- Recomendado: usar **XAMPP** (ya incluye MySQL en `localhost:3306`)
- El nombre de la base de datos es: **`agroflexsoa`**
- Crear antes de iniciar cualquier servicio:
  ```sql
  CREATE DATABASE agroflexsoa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Credenciales por defecto del proyecto:
  - Usuario: `root`
  - Contraseña: *(vacía en desarrollo)*

#### Node.js y npm (para el frontend)
- **Versión requerida: Node.js 18.x LTS o superior**
- Descarga: https://nodejs.org
- Verificar:
  ```bash
  node --version   # v18.x.x o superior
  npm --version    # 9.x.x o superior
  ```

#### IDE Recomendado — Backend
- **IntelliJ IDEA Community** (gratis): https://www.jetbrains.com/idea/download/
- Plugins a instalar: Lombok Plugin, Spring Boot Assistant
- Alternativa: **VS Code** con la extensión "Extension Pack for Java" de Microsoft

#### IDE Recomendado — Frontend
- **Visual Studio Code**: https://code.visualstudio.com
- Extensiones recomendadas:
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux snippets
  - Prettier - Code formatter
  - ESLint

#### Herramientas adicionales
- **Postman** (para probar endpoints): https://www.postman.com/downloads/
- **Git**: https://git-scm.com/downloads

---

### Instalación del Backend — Auth Service

```bash
# 1. Entrar a la carpeta
cd agroflex-backend/agroflex-auth-service

# 2. Verificar que la base de datos 'agroflexsoa' existe en MySQL

# 3. Compilar
mvn clean compile

# 4. Ejecutar
mvn spring-boot:run

# El servicio estará disponible en: http://localhost:8080
# Verificar: POST http://localhost:8080/api/auth/login
```

### Instalación del Backend — Catalog Service

```bash
# 1. Entrar a la carpeta
cd agroflex-backend/agroflex-catalog-service

# 2. Ejecutar (las tablas se crean automáticamente con ddl-auto: update)
mvn spring-boot:run

# El servicio estará disponible en: http://localhost:8081
# Verificar: GET http://localhost:8081/api/productos
```

### Instalación del Frontend

```bash
# 1. Entrar a la carpeta
cd agroflex-frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# La app estará en: http://localhost:5173
```

> ⚠️ **Importante:** El frontend apunta por defecto a `http://localhost:8080`. Asegúrate de que el auth-service esté corriendo antes de abrir el frontend.

---

### Dependencias principales del Backend

Extraídas del `pom.xml` de auth-service y catalog-service:

| Dependencia | Versión | Para qué se usa |
|-------------|---------|-----------------|
| `spring-boot-starter-parent` | **3.2.3** | Base de Spring Boot |
| `spring-boot-starter-web` | 3.2.3 | API REST |
| `spring-boot-starter-security` | 3.2.3 | Seguridad y autenticación |
| `spring-boot-starter-data-jpa` | 3.2.3 | Acceso a base de datos |
| `spring-boot-starter-validation` | 3.2.3 | Validación de DTOs |
| `mysql-connector-j` | **8.3.0** | Conexión a MySQL |
| `jjwt-api` | **0.12.3** | Creación y validación de tokens JWT |
| `jjwt-impl` | **0.12.3** | Implementación interna del JWT |
| `jjwt-jackson` | **0.12.3** | Serialización JSON del JWT |
| `lombok` | (latest) | Generación de getters/setters/builders |
| `spring-cloud-starter-netflix-eureka-client` | 2023.0.0 | Registro de servicios (no activo en dev) |

### Dependencias principales del Frontend

Extraídas del `package.json`:

| Dependencia | Versión | Para qué se usa |
|-------------|---------|-----------------|
| `react` | 18.x | Framework de UI |
| `react-dom` | 18.x | Renderizado en el DOM |
| `react-router-dom` | 6.x | Navegación entre páginas |
| `tailwindcss` | 3.x | Estilos CSS utilitarios |
| `zustand` | 4.x | Manejo de estado global |
| `axios` | 1.x | Llamadas HTTP al backend |
| `lucide-react` | latest | Íconos |
| `swiper` | **12.1.2** | Carruseles (CarruselInformativo) |
| `html5-qrcode` | **2.3.8** | Escáner QR con cámara |
| `react-hook-form` | 7.x | Formularios con validación |
| `yup` | 1.x | Esquemas de validación |
| `jwt-decode` | 4.x | Decodificar JWT en el frontend |
| `firebase` | 10.x | Tiempo real e imágenes |

---

## 3. 🏗️ Arquitectura SOA — Cómo está organizado el sistema

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1 — FRONTEND (React.js PWA · puerto 5173)        │
│  Lo que ve y toca el usuario                            │
│  📁 agroflex-frontend/                                  │
│  Regla: CERO lógica de negocio. Solo presentación.      │
│  Todo fetch: services/ → hooks/ → componentes           │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP REST + JWT en Authorization header
┌──────────────────────────▼──────────────────────────────┐
│  CAPA 2 — GATEWAY / ORQUESTACIÓN (puerto 8080 futuro)  │
│  Punto de entrada único. Valida JWT y enruta.           │
│  📁 agroflex-gateway/ (scaffold listo, sin desplegar)   │
│  Regla: No tiene lógica propia, solo enruta.            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  CAPA 3 — MICROSERVICIOS Spring Boot (Java 21)         │
│                                                         │
│  ✅ auth-service        :8080  Autenticación + JWT      │
│  ✅ catalog-service      :8081  Productos y catálogo     │
│  ❌ users-service        :8083  Perfiles y reputación    │
│  ❌ orders-service       :8084  Pedidos y escrow         │
│  ❌ payments-service     :8085  Stripe / PayPal          │
│  ❌ qr-service           :8086  Validación QR + GPS      │
│  ❌ geolocation-service  :8087  Zonas de entrega         │
│  ❌ notifications-service:8088  Twilio SMS + Email       │
│  ❌ eureka-server         :8761  Registro de servicios    │
│  ❌ ml-service (Python)         Precios + Recomendaciones│
│                                                         │
│  Regla: Cada servicio es independiente. JWT en cada req.│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  CAPA 4 — INFRAESTRUCTURA                               │
│                                                         │
│  ✅ MySQL (XAMPP)    Base de datos principal             │
│  🔄 Firebase         Config. inicial lista, sin uso real │
│  ❌ Stripe           Pagos con tarjeta (pendiente)       │
│  ❌ PayPal           Pagos alternativos (pendiente)       │
│  ❌ Twilio           SMS de notificaciones (pendiente)   │
│  ❌ OpenAI           Predicciones de precio (pendiente)  │
└─────────────────────────────────────────────────────────┘
```

### Regla de oro por capa

| Capa | Puede hacer | NO puede hacer |
|------|-------------|----------------|
| Frontend | Mostrar datos, pedir al usuario, llamar services/ | Lógica de negocio, validar pagos, generar tokens |
| Gateway | Enrutar requests, validar JWT | Lógica de negocio |
| Microservicios | Toda la lógica del negocio | Llamar directamente a otro microservicio sin JWT |
| Infraestructura | Almacenar, enviar mensajes | Lógica de negocio |

---

## 4. ✅ Microservicios FUNCIONANDO

---

### Auth Service — Autenticación y JWT
- ✅ **Estado: FUNCIONANDO**
- 📁 **Ubicación:** `agroflex-backend/agroflex-auth-service/`
- 🌐 **Puerto:** `8080`
- 🎯 **Para qué sirve:** Registrar usuarios, iniciar sesión y generar tokens JWT firmados que identifican al usuario en todo el sistema.

#### 🔗 Endpoints

| Método | Ruta | Qué hace | JWT requerido |
|--------|------|----------|---------------|
| `POST` | `/api/auth/login` | Inicia sesión, devuelve JWT | ❌ No |
| `POST` | `/api/auth/register` | Registra nuevo usuario, devuelve JWT | ❌ No |
| `POST` | `/api/auth/refresh` | Renueva el access token con el refresh token | ❌ No |
| `POST` | `/api/auth/forgot-password` | Envía email de recuperación | ❌ No |
| `POST` | `/api/auth/reset-password` | Cambia la contraseña con el token del email | ❌ No |

#### 📥 Ejemplo de login

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "correo": "productor@agroflex.mx",
  "password": "TuPassword123"
}
```

**Response exitosa:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "id": 3,
  "nombre": "Carlos",
  "correo": "productor@agroflex.mx",
  "roles": ["PRODUCTOR"],
  "validado": true
}
```

#### ⚠️ Limitaciones conocidas
- El endpoint `forgot-password` aún no envía email real (falta conectar con notifications-service).
- El `reset-password` guarda el token en la DB pero no hay flujo de email funcional.

---

### Catalog Service — Catálogo de productos
- ✅ **Estado: FUNCIONANDO**
- 📁 **Ubicación:** `agroflex-backend/agroflex-catalog-service/`
- 🌐 **Puerto:** `8081`
- 🎯 **Para qué sirve:** Almacenar y servir todos los productos del marketplace (cosechas de productores y suministros de proveedores).

#### 🔗 Endpoints

| Método | Ruta | Qué hace | JWT requerido |
|--------|------|----------|---------------|
| `GET` | `/api/productos` | Lista productos con filtros y paginación | ❌ No |
| `GET` | `/api/productos/destacados` | Devuelve hasta 5 productos para el carrusel | ❌ No |
| `GET` | `/api/productos/{id}` | Detalle de un producto específico | ❌ No |
| `POST` | `/api/productos` | Publica un nuevo producto | ✅ Sí (rol vendedor) |

#### 📥 Ejemplo de publicar producto

**Request:**
```json
POST /api/productos
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "tipo": "cosecha",
  "nombre": "Jitomate Saladette",
  "descripcion": "Producción de jitomate recién cosechado",
  "precio": 8.50,
  "unidad": "kg",
  "stock": 500,
  "municipio": "Tepeaca",
  "estado": "Puebla",
  "imagenUrl": "https://..."
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "tipo": "cosecha",
  "nombre": "Jitomate Saladette",
  "precio": 8.50,
  "unidad": "kg",
  "stock": 500,
  "disponibilidad": "disponible",
  "vendedor": "Carlos García",
  "ubicacion": { "municipio": "Tepeaca", "estado": "Puebla" }
}
```

#### 📋 Parámetros de filtro (GET /api/productos)

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | int | 0 | Número de página |
| `size` | int | 12 | Productos por página |
| `tipo` | string | - | `cosecha` o `suministro` |
| `buscar` | string | - | Texto libre en nombre/descripción |
| `municipio` | string | - | Filtrar por municipio |
| `orden` | string | `recientes` | `recientes`, `precio_asc`, `precio_desc` |

#### ⚠️ Limitaciones conocidas
- El endpoint `GET /api/productos/mis-lotes` (para que el productor vea solo sus propios productos) aún no está implementado.
- Las imágenes se almacenan como URL texto, sin subida real a Firebase Storage.

---

## 5. ❌ Microservicios PENDIENTES

---

### Orders Service — Gestión de pedidos
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: ALTA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-orders-service/`
- 🌐 **Puerto planeado:** `8084`
- 🎯 **Para qué servirá:** Crear pedidos cuando un comprador elige un producto, mantener el estado del pedido y coordinar con payments-service el escrow.

#### 🔗 Endpoints que necesitará

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/pedidos` | Crea un nuevo pedido |
| `GET` | `/api/pedidos/mis-pedidos` | Lista pedidos del usuario (comprador o vendedor) |
| `GET` | `/api/pedidos/{id}` | Detalle de un pedido |
| `PATCH` | `/api/pedidos/{id}/estado` | Cambia el estado del pedido |
| `POST` | `/api/pedidos/{id}/cancelar` | Cancela un pedido |

#### 📦 Estados del pedido
```
PENDIENTE → RETENIDO → EN_CAMINO → ENTREGA_PENDIENTE → COMPLETADO
                                                      ↘ CANCELADO
```

#### 📦 Depende de
- `auth-service` (para validar JWT y obtener roles)
- `catalog-service` (para validar que el producto existe y tiene stock)
- `payments-service` (para retener el pago en escrow)
- `qr-service` (para validar la entrega física)

#### 💡 Notas para quien lo implemente
- La entidad `OrdenTransaccion` ya está definida en el modelo.
- La liberación del pago NUNCA debe hacerse sin pasar por `qr-service`.
- El estado `RETENIDO` significa que el dinero está retenido en escrow (Stripe) y aún no se liberó al vendedor.

---

### Payments Service — Pagos con escrow
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: ALTA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-payments-service/`
- 🌐 **Puerto planeado:** `8085`
- 🎯 **Para qué servirá:** Procesar pagos con tarjeta (Stripe) o PayPal. El dinero queda "retenido" (escrow) hasta que el comprador valide la entrega con QR.

#### 🔗 Endpoints que necesitará

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/pagos/iniciar` | Crea un PaymentIntent en Stripe y retiene el pago |
| `POST` | `/api/pagos/{id}/liberar` | Libera el dinero al vendedor (post-QR) |
| `POST` | `/api/pagos/{id}/reembolsar` | Devuelve el dinero al comprador (cancelación) |
| `POST` | `/api/pagos/webhook/stripe` | Recibe eventos de Stripe (pagos completados, etc.) |

#### 📦 Depende de
- Cuenta de Stripe con las credenciales `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`
- `orders-service` para actualizar el estado del pedido al liberar/reembolsar

#### 💡 Notas para quien lo implemente
- El flujo correcto es: comprador paga → dinero va a Stripe (retenido) → QR validado → dinero se transfiere al vendedor.
- **NUNCA** liberar el pago sin QR + GPS validados por `qr-service`.
- Usar `PaymentIntent` de Stripe para el escrow, no `Charge` directo.

---

### QR Service — Validación de entregas
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: ALTA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-qr-service/`
- 🌐 **Puerto planeado:** `8086`
- 🎯 **Para qué servirá:** Generar un código QR único por transacción (lo muestra el vendedor). Cuando el comprador lo escanea físicamente, valida las coordenadas GPS y libera el pago.

#### 🔗 Endpoints que necesitará

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/qr/generar` | Genera QR único para un pedido (llama el vendedor) |
| `POST` | `/api/qr/validar` | Valida el QR escaneado + GPS del comprador |
| `GET` | `/api/qr/{token}` | Info del QR (producto, monto) antes de validar |

#### 📥 Request de validación (desde frontend)
```json
POST /api/qr/validar
Authorization: Bearer eyJhbGci...

{
  "token": "TXN-2024-ABCD1234",
  "lat": 18.5956,
  "lng": -97.3714
}
```

#### 📤 Response esperada
```json
{
  "ok": true,
  "nombreProducto": "Jitomate Saladette",
  "montoLiberado": 4250.00,
  "fechaValidacion": "2026-03-16T21:30:00"
}
```

#### ❌ Códigos de error esperados
| Código | Significado |
|--------|-------------|
| `INVALID_TOKEN` | El QR no corresponde a ninguna transacción |
| `ALREADY_USED` | El QR ya fue escaneado previamente |
| `WRONG_LOCATION` | Las coordenadas GPS están muy lejos del punto de entrega |
| `EXPIRED` | El QR expiró (más de 24 horas) |

#### 📦 Depende de
- `orders-service` para verificar que el pedido existe y está en estado `ENTREGA_PENDIENTE`
- `payments-service` para liberar el pago al confirmar el QR

---

### Notifications Service — SMS y Email
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: MEDIA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-notifications-service/`
- 🌐 **Puerto planeado:** `8088`
- 🎯 **Para qué servirá:** Enviar SMS a través de Twilio y emails cuando ocurran eventos importantes (nuevo pedido, pago recibido, entrega completada).

#### Eventos que disparan notificaciones
- Nuevo pedido recibido → SMS al vendedor
- Pago retenido → Email al comprador con instrucciones
- Entrega validada → SMS al vendedor indicando que el pago fue liberado
- Solicitud de insignia → Email al admin

---

### Users Service — Perfiles y reputación
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: MEDIA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-users-service/`
- 🌐 **Puerto planeado:** `8083`
- 🎯 **Para qué servirá:** Gestión del perfil del usuario, insignias de verificación, puntuación de reputación y reseñas.

---

### Geolocation Service — Zonas de entrega
- ❌ **Estado: PENDIENTE (estructura creada, sin implementar)**
- 🚨 **Prioridad: MEDIA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-geolocation-service/`
- 🌐 **Puerto planeado:** `8087`
- 🎯 **Para qué servirá:** Calcular zonas de entrega, validar que el comprador esté en el rango correcto al escanear el QR, y mostrar productores cercanos.

---

### ML Service — Inteligencia Artificial
- ❌ **Estado: PENDIENTE (estructura Python creada, sin implementar)**
- 🚨 **Prioridad: BAJA**
- 📁 **Ubicación:** `agroflex-backend/agroflex-ml-service/` (FastAPI + Python)
- 🎯 **Para qué servirá:** Predecir precios de mercado basados en historial, recomendar productos similares al comprador, detectar precios anómalos.
- 📦 **Depende de:** OpenAI API key + historial de transacciones de `orders-service`

---

## 6. 🔐 Seguridad y JWT

### ¿Cómo funciona el JWT en AgroFlex?

JWT (JSON Web Token) es como una **credencial digital firmada**. Cuando un usuario inicia sesión, el servidor le da un JWT. En cada petición siguiente, el usuario presenta ese JWT para demostrar que es quien dice ser.

```
1. Usuario hace login                    → envía correo + contraseña
2. auth-service verifica credenciales    → contraseña BCrypt en MySQL
3. auth-service genera JWT firmado       → incluye roles, nombre, idUsuario
4. Frontend guarda el JWT en Zustand/localStorage
5. En cada request al backend            → envía: Authorization: Bearer [jwt]
6. catalog-service valida el JWT         → verifica firma con la misma clave secreta
7. Si el JWT es válido                   → procesa el request
8. Si el JWT expiró                      → devuelve 401, el frontend renueva el token
```

### Contenido del JWT (payload decodificado)

```json
{
  "sub": "productor@agroflex.mx",
  "roles": ["PRODUCTOR"],
  "idUsuario": 3,
  "nombre": "Carlos",
  "iat": 1773717496,
  "exp": 1773803896
}
```

### Configuración del JWT

- **Clave secreta:** `agroflex_dev_secret_256bits_cambiar_en_prod_agroflex_secret`
- **Duración del access token:** 24 horas (`86400000` ms)
- **Duración del refresh token:** 7 días (`604800000` ms)
- **Algoritmo:** HMAC SHA-384

> ⚠️ **IMPORTANTE:** Cambiar la clave secreta antes de producción. Definirla como variable de entorno `JWT_SECRET`.

### Roles y permisos

| Rol | Puede publicar | Puede comprar | Puede ver catálogo | Dashboard |
|-----|---------------|---------------|--------------------|-----------|
| `PRODUCTOR` | ✅ Cosechas | ✅ Sí | ✅ Sí | `/producer/dashboard` |
| `INVERNADERO` | ✅ Cosechas | ✅ Sí | ✅ Sí | `/producer/dashboard` |
| `PROVEEDOR` | ✅ Suministros | ✅ Sí | ✅ Sí | `/supplier/dashboard` |
| `COMPRADOR` | ❌ No | ✅ Sí | ✅ Sí | `/buyer/dashboard` |
| `EMPAQUE` | ❌ No | ✅ Sí | ✅ Sí | `/buyer/dashboard` |
| `ADMIN` | ✅ Todo | ✅ Sí | ✅ Sí | `/admin/dashboard` |

### Cómo probar endpoints en Postman

1. Primero hacer login: `POST http://localhost:8080/api/auth/login`
2. Copiar el `accessToken` de la respuesta
3. En cualquier endpoint protegido, agregar el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzM4NClJ...
   ```

### ¿Qué pasa cuando el token expira?

El frontend detecta el error 401 en el interceptor de Axios (`axiosClient.js`) y automáticamente intenta renovar el token usando el `refreshToken`. Si el refresh también falla, redirige al usuario a `/login`.

---

## 7. 🗄️ Base de datos

### Base de datos: `agroflexsoa`

La base de datos es compartida entre `auth-service` y `catalog-service` en desarrollo. En producción cada servicio tendría su propia BD.

### Tablas existentes

#### `usuarios` — Todos los usuarios del sistema
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_usuario` | BIGINT PK | Identificador único |
| `nombre` | VARCHAR(120) | Nombre del usuario |
| `apellidos` | VARCHAR(120) | Apellidos |
| `correo` | VARCHAR(180) UNIQUE | Email (se usa para login) |
| `password_hash` | VARCHAR(255) | Contraseña encriptada con BCrypt |
| `telefono` | VARCHAR(20) | Teléfono opcional |
| `latitud` / `longitud` | DECIMAL(10,7) | Ubicación GPS del usuario |
| `estado_republica` | VARCHAR(80) | Estado de México |
| `municipio` | VARCHAR(80) | Municipio |
| `puntuacion_rep` | DECIMAL(3,2) | Calificación promedio (0-5) |
| `total_reseñas` | INT | Número de calificaciones recibidas |
| `validado` | TINYINT | 1 = tiene insignia verificada |
| `activo` | TINYINT | 1 = cuenta activa |
| `firebase_uid` | VARCHAR(128) | ID de Firebase (notificaciones push) |
| `created_at` / `updated_at` | DATETIME | Timestamps automáticos |
| `reset_token` | VARCHAR(255) | Token de recuperación de contraseña |
| `reset_token_expiry` | DATETIME | Expiración del token de reset |

#### `roles` — Roles disponibles en el sistema
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_rol` | INT PK | Identificador |
| `nombre` | VARCHAR(50) | PRODUCTOR, INVERNADERO, PROVEEDOR, etc. |

#### `usuarios_roles` — Relación muchos a muchos usuarios-roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_usuario` | FK → usuarios | |
| `id_rol` | FK → roles | |

#### `productos` — Todos los productos del catálogo
(Creada automáticamente por catalog-service con `ddl-auto: update`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT PK | Identificador |
| `tipo` | VARCHAR(20) | `cosecha` o `suministro` |
| `nombre` | VARCHAR(200) | Nombre del producto |
| `descripcion` | TEXT | Descripción detallada |
| `precio` | DECIMAL(12,2) | Precio por unidad |
| `unidad` | VARCHAR(30) | `kg`, `tonelada`, `pieza`, etc. |
| `stock` | INT | Cantidad disponible |
| `disponibilidad` | VARCHAR(20) | `disponible` o `agotado` |
| `id_vendedor` | BIGINT | ID del usuario vendedor |
| `nombre_vendedor` | VARCHAR(200) | Nombre del vendedor |
| `rol_vendedor` | VARCHAR(50) | Rol del vendedor |
| `municipio` / `estado` | VARCHAR(80) | Ubicación del producto |
| `imagen_url` | TEXT | URL de la imagen principal |
| `created_at` | DATETIME | Fecha de publicación |

### Relaciones entre tablas

```
usuarios  ←──── usuarios_roles ────→  roles
    │
    │ (id_vendedor)
    ▼
productos
    │
    │ (futuro: id_producto)
    ▼
ordenes_transacciones  (orders-service, aún no creada)
    │
    ▼
pagos  (payments-service, aún no creada)
```

---

## 8. 🔌 Integraciones externas

### Firebase
- **¿Para qué lo usamos?** Notificaciones push en tiempo real (cuando llega un pedido, el vendedor recibe una alerta instantánea sin recargar la página).
- **Estado actual:** El archivo de configuración `firebase.js` existe en `src/services/firebase.js` pero no está conectado a ningún flujo real todavía.
- **Variables que necesita:**
  ```env
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=agroflex.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=agroflex
  VITE_FIREBASE_STORAGE_BUCKET=agroflex.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123:web:abc
  ```

### Stripe
- **¿Para qué lo usamos?** Procesar pagos con tarjeta de crédito/débito. El dinero queda en "escrow" (retenido) hasta que se valide la entrega con QR.
- **Estado actual:** La dependencia `stripe-java` está listada pero el `payments-service` aún no está implementado.
- **Variables que necesita:**
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- **Cuándo se activa:** Al hacer click en "Pagar ahora" en la pantalla de Mis Pedidos.

### PayPal
- **¿Para qué lo usamos?** Alternativa de pago para usuarios que prefieren PayPal sobre tarjeta.
- **Estado actual:** Pendiente de implementación junto con `payments-service`.
- **Variables que necesita:**
  ```env
  PAYPAL_CLIENT_ID=AXt...
  PAYPAL_CLIENT_SECRET=EJk...
  PAYPAL_MODE=sandbox  # o 'live' en producción
  ```

### Twilio
- **¿Para qué lo usamos?** Enviar SMS de confirmación cuando se crea un pedido, cuando el pago es recibido, y cuando la entrega es validada.
- **Estado actual:** `TwilioSmsService.java` existe en notifications-service pero sin implementar.
- **Variables que necesita:**
  ```env
  TWILIO_ACCOUNT_SID=ACxxxx...
  TWILIO_AUTH_TOKEN=xxxx...
  TWILIO_PHONE_NUMBER=+1234567890
  ```

### OpenAI
- **¿Para qué lo usamos?** Predicción de precios justos de mercado y recomendaciones de productos similares.
- **Estado actual:** El `ml-service` (Python/FastAPI) tiene la estructura pero sin implementar.
- **Variables que necesita:**
  ```env
  OPENAI_API_KEY=sk-...
  ```

---

## 9. ➕ Cómo agregar un nuevo microservicio

Guía paso a paso usando `catalog-service` como referencia real del proyecto.

### Paso 1: Crear el Modelo (`@Entity`)

📁 Ubicación: `src/main/java/com/agroflex/[servicio]/model/`

```java
// Ejemplo real: como está Producto.java en catalog-service
@Entity
@Table(name = "mi_tabla")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

### Paso 2: Crear el Repositorio (`@Repository`)

📁 Ubicación: `src/main/java/com/agroflex/[servicio]/repository/`

```java
// Igual que ProductoRepository.java
@Repository
public interface MiEntidadRepository extends JpaRepository<MiEntidad, Long>,
                                               JpaSpecificationExecutor<MiEntidad> {

    // Spring genera el SQL automáticamente con el nombre del método:
    List<MiEntidad> findByNombreContainingIgnoreCase(String nombre);
    Optional<MiEntidad> findByCorreo(String correo);
}
```

### Paso 3: Crear el Servicio (`@Service`)

📁 Ubicación: `src/main/java/com/agroflex/[servicio]/service/`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MiServicio {

    private final MiEntidadRepository repo;

    public MiEntidad crear(CrearRequest request) {
        log.info("Creando nueva entidad: {}", request.getNombre());
        MiEntidad entidad = MiEntidad.builder()
                .nombre(request.getNombre())
                .build();
        return repo.save(entidad);
    }

    public MiEntidad obtenerPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("No encontrado: " + id));
    }
}
```

### Paso 4: Crear el Controlador (`@RestController`)

📁 Ubicación: `src/main/java/com/agroflex/[servicio]/controller/`

```java
// Igual que ProductoController.java
@RestController
@RequestMapping("/api/mi-recurso")
@RequiredArgsConstructor
public class MiControlador {

    private final MiServicio servicio;

    @GetMapping("/{id}")
    public ResponseEntity<MiEntidad> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PRODUCTOR','ADMIN')")
    public ResponseEntity<MiEntidad> crear(@Valid @RequestBody CrearRequest req,
                                           Authentication auth) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(req));
    }
}
```

### Paso 5: Proteger con JWT

Copiar exactamente el filtro JWT de `catalog-service`:
- `security/JwtAuthFilter.java` — lee el token del header y lo valida
- `security/JwtService.java` — verifica la firma con la misma clave
- `config/SecurityConfig.java` — define qué rutas son públicas

```java
// En SecurityConfig.java, las rutas públicas se declaran así:
.requestMatchers("/api/mi-recurso/publico/**").permitAll()
.anyRequest().authenticated()
```

### Paso 6: Probar en Postman

```
1. POST http://localhost:8080/api/auth/login
   → Copia el accessToken

2. POST http://localhost:[TU_PUERTO]/api/mi-recurso
   Header: Authorization: Bearer [accessToken]
   Body: { "nombre": "prueba" }

3. GET http://localhost:[TU_PUERTO]/api/mi-recurso/1
   (sin JWT si es ruta pública)
```

### Paso 7: Conectar con el frontend

📁 Crear en: `agroflex-frontend/src/services/miServicio.js`

```javascript
// Igual que productoService.js y pedidoService.js
import axiosClient from '../api/axiosClient'

export const miServicio = {
  async crear(data) {
    const { data: result } = await axiosClient.post('/api/mi-recurso', data)
    return result
  },

  async obtenerTodos(filtros = {}) {
    const { data } = await axiosClient.get('/api/mi-recurso', { params: filtros })
    return data
  },
}
```

Luego crear el hook en `src/hooks/useMiRecurso.js` que use el servicio y exporte el estado al componente.

---

## 10. 🌐 Variables de entorno

### Backend (application.yml)

Actualmente las variables están hardcodeadas para desarrollo. En producción usar variables de entorno con `${VARIABLE:valor_default}`.

| Variable | Para qué sirve | Valor en desarrollo | Obligatoria |
|----------|----------------|---------------------|-------------|
| `DB_URL` | URL de MySQL | `jdbc:mysql://localhost:3306/agroflexsoa` | ✅ Sí |
| `DB_USERNAME` | Usuario MySQL | `root` | ✅ Sí |
| `DB_PASSWORD` | Contraseña MySQL | *(vacía)* | ✅ Sí |
| `JWT_SECRET` | Clave para firmar JWT | `agroflex_dev_secret_256bits_cambiar_en_prod_agroflex_secret` | ✅ Sí |
| `JWT_EXPIRATION` | Duración del access token (ms) | `86400000` (24h) | ✅ Sí |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_test_...` | 🟡 Pagos |
| `STRIPE_WEBHOOK_SECRET` | Verificar webhooks Stripe | `whsec_...` | 🟡 Pagos |
| `PAYPAL_CLIENT_ID` | ID de app PayPal | `AXt...` | 🟡 Pagos |
| `PAYPAL_CLIENT_SECRET` | Secreto PayPal | `EJk...` | 🟡 Pagos |
| `TWILIO_ACCOUNT_SID` | Cuenta Twilio para SMS | `ACxxx...` | 🟡 SMS |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Twilio | `xxx...` | 🟡 SMS |
| `TWILIO_PHONE_NUMBER` | Número de teléfono Twilio | `+1234567890` | 🟡 SMS |
| `OPENAI_API_KEY` | API de OpenAI para ML | `sk-...` | ⚪ Opcional |

### Frontend (.env)

Crear un archivo `.env` en la raíz de `agroflex-frontend/`:

| Variable | Para qué sirve | Valor en desarrollo | Obligatoria |
|----------|----------------|---------------------|-------------|
| `VITE_API_URL` | URL base del backend | `http://localhost:8080` | ✅ Sí |
| `VITE_FIREBASE_API_KEY` | Clave de Firebase | `AIzaSy...` | 🟡 Push notifications |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio Firebase | `agroflex.firebaseapp.com` | 🟡 Push notifications |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `agroflex` | 🟡 Push notifications |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública Stripe (frontend) | `pk_test_...` | 🟡 Pagos |

---

## 11. 📋 Lo que todo el equipo debe saber

### 🔴 REGLAS QUE NO SE ROMPEN

1. **El frontend NO tiene lógica de negocio.** Si necesitas calcular algo o tomar una decisión de negocio, va en el backend.
2. **Todo fetch sigue el flujo:** `services/` → `hooks/` → componentes. Nunca llamar a la API directamente desde un componente JSX.
3. **JWT en CADA request al backend** sin excepción. El interceptor en `axiosClient.js` lo hace automáticamente.
4. **El pago NUNCA se libera sin QR + GPS validados.** Es la promesa de seguridad de AgroFlex.
5. **No hacer commits directamente a `main`/`master`.** Crear una rama, hacer PR.
6. **Los passwords nunca se almacenan en texto plano.** Siempre BCrypt.

### 🟡 DECISIONES DE ARQUITECTURA Y POR QUÉ

| Decisión | Por qué se tomó |
|----------|-----------------|
| **SOA en lugar de monolito** | Cada microservicio puede desarrollarse, desplegarse y escalarse independientemente. Si payments-service falla, el catálogo sigue funcionando. |
| **Spring Boot** | Es el estándar de la industria en Java enterprise. Gran ecosistema, seguridad robusta, y el equipo ya lo conoce. |
| **React PWA en lugar de app nativa** | Una sola codebase para web y móvil. Los agricultores pueden instalarlo como app sin pasar por Play Store. |
| **Escrow para pagos** | El productor no tiene motivo para engañar si sabe que el pago ya está retenido. El comprador no pierde dinero si el producto no llega. Es la confianza del sistema. |
| **QR + GPS para validar entregas** | Evita fraudes donde alguien dice "ya entregué" sin haberlo hecho. El QR debe escanearse físicamente en el lugar de entrega. |
| **JWT compartido entre servicios** | La misma clave secreta permite que catalog-service valide el JWT sin llamar a auth-service en cada request. Más rápido y sin dependencia síncrona. |
| **Zustand para estado global** | Más simple que Redux para este proyecto. El store de autenticación (`authStore.js`) persiste el JWT en localStorage automáticamente. |

### 🟢 BUENAS PRÁCTICAS DEL EQUIPO

#### Cómo nombrar archivos y carpetas
```
Componentes React:     PascalCase → OrdenCard.jsx, MisPedidos.jsx
Hooks:                 camelCase con use → usePedidos.js, useQRScanner.js
Servicios:             camelCase → pedidoService.js, qrService.js
Clases Java:           PascalCase → ProductoController.java
Carpetas:              kebab-case → agroflex-auth-service/
```

#### Cómo escribir commits de git
```bash
# Formato: tipo: descripción en minúsculas

feat: agrega pantalla de mis pedidos
fix: corrige validación de JWT en catalog-service
docs: actualiza documentación de endpoints
style: ajusta colores del dashboard productor
refactor: extrae lógica de filtros a useFiltros hook
test: agrega pruebas de LoginPage
chore: actualiza dependencias de npm
```

#### Cómo documentar código nuevo en el backend
```java
/**
 * Valida la entrega física de un pedido usando el token QR y las coordenadas GPS.
 *
 * @param token  Token único del QR generado para esta transacción
 * @param lat    Latitud del comprador al momento del escaneo
 * @param lng    Longitud del comprador al momento del escaneo
 * @return       QrValidateResponse con el resultado y monto liberado
 * @throws QrInvalidException  Si el token no existe o ya fue utilizado
 * @throws LocationException   Si las coordenadas están fuera del rango permitido
 */
public QrValidateResponse validarEntrega(String token, Double lat, Double lng) { ... }
```

#### Cómo reportar un bug
Incluir siempre:
1. ¿Qué intentabas hacer?
2. ¿Qué esperabas que pasara?
3. ¿Qué pasó en realidad?
4. Capturas de pantalla o logs del error
5. Navegador/dispositivo (para bugs de frontend)

---

## 12. 📖 Glosario

| Término | Definición simple |
|---------|-------------------|
| **SOA** | "Service Oriented Architecture" — El sistema se divide en servicios pequeños e independientes que se comunican entre sí. Cada servicio hace una sola cosa y la hace bien. |
| **Microservicio** | Un servicio pequeño con una responsabilidad específica. En AgroFlex: `auth-service` solo maneja autenticación, `catalog-service` solo maneja productos. |
| **JWT** | "JSON Web Token" — Una credencial digital firmada. Es como un ticket de concierto: si la firma es válida, el usuario puede entrar sin que el backend consulte la base de datos. |
| **Escrow** | Sistema donde el dinero del comprador queda retenido en una cuenta neutral (Stripe) hasta que se confirme la entrega. Ni el comprador ni el vendedor tienen el dinero mientras está "en escrow". |
| **PWA** | "Progressive Web App" — Una página web que se comporta como una app nativa. Puede instalarse en el celular, funcionar sin internet (parcialmente) y recibir notificaciones push. |
| **QR Token** | Un código QR único generado para cada transacción de entrega. El vendedor lo muestra; el comprador lo escanea al recibir físicamente el producto. |
| **Cosecha / Lote** | Producto publicado por un productor o invernadero. Por ejemplo: "500 kg de jitomate saladette a $8.50/kg". |
| **Suministro / Tienda** | Producto publicado por un proveedor de agroinsumos. Por ejemplo: "Fertilizante NPK 20kg a $350/bolsa". |
| **Insignia de verificación** | Badge que distingue a un vendedor verificado por el equipo de AgroFlex. Solo los vendedores con insignia pueden publicar en el catálogo. |
| **Coyotaje** | Práctica donde un intermediario (coyote) compra la cosecha al productor a precio muy bajo y la revende muy caro. AgroFlex elimina este eslabón. |
| **Spring Boot** | Framework de Java que facilita crear APIs REST robustas y seguras sin configuración manual. |
| **Maven** | Herramienta que maneja las dependencias (librerías) del proyecto Java y lo compila. Usa el archivo `pom.xml`. |
| **JPA / Hibernate** | Herramientas que convierten automáticamente las clases Java (`@Entity`) en tablas de base de datos y viceversa. No hay que escribir SQL manual. |
| **Firebase onSnapshot** | Función de Firebase que escucha cambios en tiempo real. Cuando un vendedor recibe un pedido, aparece instantáneamente sin recargar la página. |
| **Endpoint** | Una URL específica del backend que responde a un tipo de petición. Por ejemplo: `POST /api/auth/login` es un endpoint. |
| **API REST** | Forma estándar de comunicar el frontend con el backend usando HTTP (GET para leer, POST para crear, PUT/PATCH para actualizar, DELETE para eliminar). |
| **BCrypt** | Algoritmo para encriptar contraseñas. La misma contraseña genera un hash diferente cada vez, lo que hace imposible descifrarla incluso si alguien roba la base de datos. |
| **Zustand** | Librería del frontend para guardar estado global (como el usuario autenticado) que todos los componentes pueden leer. |
| **Eureka Server** | Servicio de "directorio telefónico" para los microservicios. Cada servicio se registra ahí y puede encontrar a los demás por nombre en lugar de IP. (No activo en desarrollo local) |

---

💬 ¿Dudas sobre alguna sección? Contacta al equipo técnico de AgroFlex.
