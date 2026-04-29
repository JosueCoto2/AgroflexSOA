# AgroFlex API — Documentación Completa (OpenAPI 3.x)

> **Versión:** 1.0.0  
> **Formato base:** OpenAPI 3.x (descripción en Markdown compatible con Swagger UI / conversión a YAML/JSON)  
> **Servidor base (producción):** `http://localhost:8080` (API Gateway)  
> **Content-Type:** `application/json` (salvo donde se indique)

---

## Tabla de Contenidos

1. [Información General](#1-información-general)
2. [Autenticación](#2-autenticación)
3. [Tags / Categorías](#3-tags--categorías)
4. [Endpoints — Autenticación](#4-endpoints--autenticación)
5. [Endpoints — Catálogo (Cosechas/Lotes)](#5-endpoints--catálogo-cosechaslotes)
6. [Endpoints — Catálogo (Productos)](#6-endpoints--catálogo-productos)
7. [Endpoints — Pedidos (Orders)](#7-endpoints--pedidos-orders)
8. [Endpoints — Pagos (Payments)](#8-endpoints--pagos-payments)
9. [Endpoints — Validación QR](#9-endpoints--validación-qr)
10. [Endpoints — Usuarios](#10-endpoints--usuarios)
11. [Endpoints — Notificaciones](#11-endpoints--notificaciones)
12. [Endpoints — Geolocalización](#12-endpoints--geolocalización)
13. [Endpoints — Administración](#13-endpoints--administración)
14. [Schemas de Componentes](#14-schemas-de-componentes)
15. [Códigos de Error Estándar](#15-códigos-de-error-estándar)
16. [Notas Adicionales](#16-notas-adicionales)

---

## 1. Información General

### Descripción del Sistema

**AgroFlex** es un marketplace agrícola SOA (Service-Oriented Architecture) diseñado para la región Tepeaca-Acatzingo-Huixcolotla, Puebla, México. Conecta productores, invernaderos, proveedores, empresas de empaque y compradores en un ecosistema digital de comercio agrícola.

### Arquitectura de Capas (Spring Boot)

Cada microservicio sigue el patrón estándar de capas:

```
HTTP Request → API Gateway (:8080)
                     ↓
              [Microservicio destino]
                     ↓
           Controller (@RestController)
                     ↓
            Service (@Service)  ← lógica de negocio
                     ↓
          Repository (JPA/Spring Data) ← acceso a datos
                     ↓
             MySQL 8.0 (agroflexsoa)
```

El Gateway actúa como punto de entrada único, aplica el filtro JWT y enruta las peticiones a los microservicios correspondientes a través de **Eureka Service Discovery**.

### Microservicios y Puertos

| Microservicio            | Puerto | Prefijo de ruta         |
|--------------------------|--------|-------------------------|
| agroflex-gateway         | 8080   | (todos los `/api/*`)    |
| agroflex-auth-service    | 8081   | `/api/auth/**`          |
| agroflex-catalog-service | 8082   | `/api/catalog/**`, `/api/productos/**`, `/api/cosechas/**`, `/api/suministros/**` |
| agroflex-users-service   | 8083   | `/api/users/**`         |
| agroflex-orders-service  | 8084   | `/api/orders/**`        |
| agroflex-payments-service| 8085   | `/api/payments/**`, `/api/webhooks/**` |
| agroflex-qr-service      | 8086   | `/api/qr/**`            |
| agroflex-geolocation-service | 8087 | `/api/geolocation/**` |
| agroflex-notifications-service | 8088 | `/api/notifications/**` |
| agroflex-admin-service   | 8089   | `/api/admin/**`         |

### Servidores

```yaml
servers:
  - url: http://localhost:8080
    description: Desarrollo local (vía API Gateway)
  - url: http://localhost:8081
    description: Auth Service directo (desarrollo)
  - url: http://localhost:8082
    description: Catalog Service directo (desarrollo)
```

---

## 2. Autenticación

### Esquema JWT Bearer

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <accessToken>
```

### Estructura del Token JWT

```json
{
  "sub": "usuario@correo.com",
  "roles": ["COMPRADOR"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

| Campo    | Tipo     | Descripción                              |
|----------|----------|------------------------------------------|
| `sub`    | string   | Correo electrónico del usuario           |
| `roles`  | string[] | Lista de roles RBAC del usuario          |
| `iat`    | number   | Timestamp de emisión (Unix epoch)        |
| `exp`    | number   | Timestamp de expiración (Unix epoch)     |

### Ciclo de Vida de Tokens

| Token         | Duración  | Renovación                      |
|---------------|-----------|---------------------------------|
| `accessToken` | 24 horas  | Via `POST /api/auth/refresh`    |
| `refreshToken`| 7 días    | Emisión nueva en cada refresh   |

### Roles RBAC

| ID  | Rol           | Descripción                              |
|-----|---------------|------------------------------------------|
| 1   | `PRODUCTOR`   | Agricultor que vende cosechas en lote    |
| 2   | `INVERNADERO` | Productor bajo invernadero               |
| 3   | `PROVEEDOR`   | Proveedor de suministros agrícolas       |
| 4   | `EMPAQUE`     | Empresa de empaque y procesamiento       |
| 5   | `COMPRADOR`   | Rol por defecto al registrarse           |
| 6   | `ADMIN`       | Administrador con acceso total           |

---

## 3. Tags / Categorías

| Tag                | Descripción                                                  |
|--------------------|--------------------------------------------------------------|
| `Authentication`   | Login, registro, tokens, OAuth con Google, badges de vendedor |
| `Catalog - Lotes`  | Cosechas y lotes agrícolas para venta al mayoreo             |
| `Catalog - Productos` | Productos generales (cosechas + suministros) para el catálogo frontend |
| `Orders`           | Creación y gestión de pedidos con escrow                     |
| `Payments`         | Intents de Stripe, escrow, reembolsos, historial             |
| `QR Validation`    | Generación y escaneo de QR para confirmar entregas           |
| `Users`            | Perfil personal, insignias, reseñas                          |
| `Notifications`    | Notificaciones in-app, conteo de no leídas, SSE streaming    |
| `Geolocation`      | Catálogo de municipios de Puebla                             |
| `Admin`            | Panel de administración: dashboard, usuarios, pedidos, catálogo, insignias, disputas |

---

## 4. Endpoints — Autenticación

**Base URL:** `/api/auth`  
**Microservicio:** `agroflex-auth-service` (:8081)

---

### POST /api/auth/enviar-codigo

**Tag:** `Authentication`  
**Auth requerida:** No  
**Summary:** Enviar código de verificación al correo

**Descripción de negocio:**  
Paso previo al registro. Envía un código numérico de 6 dígitos al correo indicado. El código tiene vigencia limitada y debe incluirse en el body del registro. Esto previene el registro de correos falsos.

**Request Body:**

```json
{
  "correo": "juan.perez@correo.com"
}
```

| Campo    | Tipo   | Requerido | Validación            |
|----------|--------|-----------|-----------------------|
| `correo` | string | Sí        | Formato email válido  |

**Responses:**

| Código | Descripción                                         |
|--------|-----------------------------------------------------|
| `200`  | Código enviado. Body: `"Código enviado al correo indicado"` |
| `400`  | Correo con formato inválido                         |
| `409`  | El correo ya está registrado en el sistema          |

---

### POST /api/auth/register

**Tag:** `Authentication`  
**Auth requerida:** No  
**Summary:** Registrar nuevo usuario

**Descripción de negocio:**  
Registra un nuevo usuario en el sistema. El rol por defecto es `COMPRADOR`. Para obtener un rol de vendedor (PRODUCTOR, INVERNADERO, etc.) se puede incluir `rolSolicitado`, o solicitarlo después con `/api/auth/solicitar-insignia`. Requiere el código de verificación enviado previamente por correo.

**Request Body:**

```json
{
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "correo": "juan.perez@correo.com",
  "password": "MiPassword1",
  "telefono": "+5222123456789",
  "rolSolicitado": "PRODUCTOR",
  "codigoVerificacion": "482931"
}
```

| Campo                | Tipo   | Requerido | Validación                                          |
|----------------------|--------|-----------|-----------------------------------------------------|
| `nombre`             | string | Sí        | No vacío                                            |
| `apellidos`          | string | Sí        | No vacío                                            |
| `correo`             | string | Sí        | Formato email válido                                |
| `password`           | string | Sí        | Mínimo 8 caracteres, al menos 1 mayúscula y 1 número |
| `telefono`           | string | No        | Formato `+?[0-9]{7,20}`                             |
| `rolSolicitado`      | string | No        | Uno de los 6 roles RBAC válidos                     |
| `codigoVerificacion` | string | Sí        | Exactamente 6 dígitos                               |

**Response 201 Created:**

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "id": 42,
  "nombre": "Juan",
  "correo": "juan.perez@correo.com",
  "roles": ["COMPRADOR"],
  "validado": true,
  "fotoPerfil": null
}
```

| Código | Descripción                                   |
|--------|-----------------------------------------------|
| `201`  | Usuario creado exitosamente                   |
| `400`  | Validación fallida (campos inválidos)         |
| `409`  | El correo ya está registrado                  |
| `422`  | Código de verificación incorrecto o expirado  |

---

### POST /api/auth/login

**Tag:** `Authentication`  
**Auth requerida:** No  
**Summary:** Iniciar sesión con correo y contraseña

**Request Body:**

```json
{
  "correo": "juan.perez@correo.com",
  "password": "MiPassword1"
}
```

| Campo      | Tipo   | Requerido | Validación           |
|------------|--------|-----------|----------------------|
| `correo`   | string | Sí        | Formato email válido |
| `password` | string | Sí        | No vacío             |

**Response 200 OK:**

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "id": 42,
  "nombre": "Juan",
  "correo": "juan.perez@correo.com",
  "roles": ["PRODUCTOR", "COMPRADOR"],
  "validado": true,
  "fotoPerfil": "https://res.cloudinary.com/do5jln6yw/image/upload/v1/perfil/42.jpg"
}
```

| Código | Descripción                           |
|--------|---------------------------------------|
| `200`  | Login exitoso                         |
| `401`  | Credenciales incorrectas              |
| `403`  | Cuenta suspendida o inactiva          |
| `400`  | Campos faltantes o formato inválido   |

---

### POST /api/auth/refresh

**Tag:** `Authentication`  
**Auth requerida:** No (se usa el `refreshToken`)  
**Summary:** Renovar el access token usando un refresh token válido

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response 200 OK:** → mismo schema que `AuthResponse` (ver schema en [Sección 14](#14-schemas-de-componentes))

| Código | Descripción                            |
|--------|----------------------------------------|
| `200`  | Tokens renovados exitosamente          |
| `401`  | Refresh token inválido o expirado      |

---

### POST /api/auth/forgot-password

**Tag:** `Authentication`  
**Auth requerida:** No  
**Summary:** Solicitar email de recuperación de contraseña

**Descripción de negocio:**  
Por seguridad, este endpoint siempre retorna éxito sin revelar si el correo existe en el sistema (prevención de enumeración de usuarios — OWASP A07).

**Request Body:**

```json
{
  "correo": "juan.perez@correo.com"
}
```

**Response 200 OK:**
```
"Si el correo existe, recibirás instrucciones para resetear tu contraseña"
```

> **Nota de seguridad:** La respuesta es idéntica independientemente de si el correo existe.

---

### POST /api/auth/reset-password

**Tag:** `Authentication`  
**Auth requerida:** No (usa token UUID del enlace enviado por email)  
**Summary:** Establecer nueva contraseña usando token de recuperación

**Request Body:**

```json
{
  "token": "a3f2c1d4-e5b6-7890-abcd-ef1234567890",
  "newPassword": "NuevaPassword2"
}
```

| Campo         | Tipo   | Requerido | Descripción                                    |
|---------------|--------|-----------|------------------------------------------------|
| `token`       | string | Sí        | UUID recibido en el email de recuperación       |
| `newPassword` | string | Sí        | Nueva contraseña (mismas reglas que `password`) |

| Código | Descripción                                        |
|--------|----------------------------------------------------|
| `200`  | `"Contraseña actualizada exitosamente"`            |
| `400`  | Token inválido, expirado o contraseña no válida    |

---

### POST /api/auth/google

**Tag:** `Authentication`  
**Auth requerida:** No (usa Firebase ID Token)  
**Summary:** Iniciar sesión / registrarse con cuenta de Google (OAuth via Firebase)

**Descripción de negocio:**  
El frontend obtiene el ID token de Firebase tras la autenticación con Google, y lo envía a este endpoint. El backend lo verifica con Firebase Admin SDK, extrae el correo y nombre del perfil de Google, crea el usuario si no existe (con rol COMPRADOR por defecto), y retorna el JWT de AgroFlex.

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

| Campo     | Tipo   | Requerido | Descripción                             |
|-----------|--------|-----------|-----------------------------------------|
| `idToken` | string | Sí        | Firebase ID Token obtenido en el cliente |

**Response 200 OK:** → schema `AuthResponse`

| Código | Descripción                                          |
|--------|------------------------------------------------------|
| `200`  | Login/registro con Google exitoso                    |
| `401`  | ID token de Firebase inválido o expirado             |
| `503`  | Firebase Admin SDK no configurado en el servidor     |

---

### POST /api/auth/solicitar-insignia

**Tag:** `Authentication`  
**Auth requerida:** **Sí** (JWT Bearer)  
**Summary:** Solicitar upgrade de rol de vendedor (autoaprobado)

**Descripción de negocio:**  
Permite al usuario autenticado solicitar un rol de vendedor. En la implementación actual, la aprobación es automática: el sistema agrega el nuevo rol al usuario, regenera el JWT con el rol adicional, y retorna el nuevo `AuthResponse`. El Admin puede gestionar insignias manualmente desde el panel `/api/admin/insignias`.

**Request Body:**

```json
{
  "rol": "PRODUCTOR"
}
```

| Campo | Tipo   | Requerido | Valores posibles                              |
|-------|--------|-----------|-----------------------------------------------|
| `rol` | string | Sí        | `PRODUCTOR`, `INVERNADERO`, `PROVEEDOR`, `EMPAQUE` |

**Response 200 OK:** → schema `AuthResponse` (con el nuevo rol incluido en `roles[]`)

| Código | Descripción                                        |
|--------|----------------------------------------------------|
| `200`  | Rol asignado, nuevo JWT emitido                    |
| `400`  | Rol inválido o ya posee ese rol                    |
| `401`  | JWT no proporcionado o expirado                    |

---

### POST /api/auth/firebase-token

**Tag:** `Authentication`  
**Auth requerida:** **Sí** (JWT Bearer)  
**Summary:** Obtener Firebase Custom Token para autenticar al usuario en Firebase Storage

**Descripción de negocio:**  
Flujo de autenticación dual: el usuario ya está autenticado en Spring Boot (JWT). Este endpoint genera un Custom Token de Firebase con `uid = String(idUsuario)`. El frontend usa este token para autenticarse en Firebase Auth y luego puede acceder a Firebase Storage bajo la ruta `productos/{userId}/archivo.jpg` según las reglas de seguridad de Storage.

**Response 200 OK:**

```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

| Código | Descripción                                                  |
|--------|--------------------------------------------------------------|
| `200`  | Firebase Custom Token generado                               |
| `401`  | JWT de AgroFlex no proporcionado o inválido                  |
| `500`  | Error al generar el token de Firebase                        |
| `503`  | Firebase Admin SDK no inicializado (falta `firebase-service-account.json`) |

---

## 5. Endpoints — Catálogo (Cosechas/Lotes)

**Base URL:** `/api/catalog`  
**Microservicio:** `agroflex-catalog-service` (:8082)

Los lotes representan cosechas agrícolas vendidas en cantidad y unidad definidas (kg, tonelada, caja, etc.). Son el producto principal del marketplace.

---

### GET /api/catalog/lotes

**Tag:** `Catalog - Lotes`  
**Auth requerida:** No  
**Summary:** Obtener catálogo de lotes con filtros y paginación

**Query Parameters:**

| Parámetro    | Tipo       | Default       | Descripción                                              |
|--------------|------------|---------------|----------------------------------------------------------|
| `precioMin`  | number     | —             | Precio mínimo (BigDecimal, mayor a 0)                    |
| `precioMax`  | number     | —             | Precio máximo (BigDecimal)                               |
| `unidadVenta`| string     | —             | Ej: `"kg"`, `"tonelada"`, `"caja"`                      |
| `ordenarPor` | string     | `"fecha_desc"`| Opciones: `"fecha_desc"`, `"precio_asc"`, `"precio_desc"` |
| `page`       | integer    | `0`           | Página (base 0)                                          |
| `size`       | integer    | `12`          | Elementos por página                                     |

**Response 200 OK:**

```json
{
  "content": [
    {
      "idLote": 15,
      "nombreProducto": "Tomate Saladette",
      "descripcion": "Tomate de primera calidad, cosecha del día",
      "precio": 8.50,
      "imagenUrl": "https://res.cloudinary.com/do5jln6yw/image/upload/v1/lotes/15.jpg",
      "ubicacion": "Tepeaca, Puebla",
      "cantidadDisponible": 500.000,
      "unidadVenta": "kg",
      "contacto": "+52 222 123 4567",
      "estadoLote": "DISPONIBLE",
      "idProductor": 7,
      "nombreProductor": "Don Roberto",
      "fotoPerfilProductor": "https://res.cloudinary.com/do5jln6yw/...",
      "reputacionProductor": 4.8,
      "createdAt": "2024-11-15T10:30:00",
      "latitud": 18.9854,
      "longitud": -97.9155
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 12
  },
  "totalElements": 47,
  "totalPages": 4,
  "last": false
}
```

---

### GET /api/catalog/lotes/buscar

**Tag:** `Catalog - Lotes`  
**Auth requerida:** No  
**Summary:** Búsqueda de lotes por texto libre

**Query Parameters:**

| Parámetro | Tipo    | Requerido | Descripción                          |
|-----------|---------|-----------|--------------------------------------|
| `query`   | string  | Sí        | Texto a buscar en nombre/descripción |
| `page`    | integer | No (0)    | Página                               |
| `size`    | integer | No (12)   | Tamaño de página                     |

**Response 200 OK:** → mismo schema que `CatalogoPageResponse`

---

### GET /api/catalog/lotes/{id}

**Tag:** `Catalog - Lotes`  
**Auth requerida:** No  
**Summary:** Obtener detalle de un lote específico

**Path Parameters:**

| Parámetro | Tipo   | Descripción          |
|-----------|--------|----------------------|
| `id`      | Long   | ID del lote (idLote) |

**Response 200 OK:** → schema `LoteResponse`

| Código | Descripción         |
|--------|---------------------|
| `200`  | Detalle del lote    |
| `404`  | Lote no encontrado  |

---

### POST /api/catalog/lotes

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`  
**Summary:** Publicar un nuevo lote de cosecha

**Descripción de negocio:**  
El vendedor publica un lote con cantidad, precio y ubicación. Los datos del productor (id, nombre, foto de perfil) se extraen del JWT para garantizar la integridad — el cliente no puede falsificarlos.

**Request Body:**

```json
{
  "nombreProducto": "Tomate Saladette Premium",
  "descripcion": "Cosecha de invernadero, seleccionada y lista para empaque",
  "precio": 9.50,
  "imagenUrl": "https://res.cloudinary.com/do5jln6yw/image/upload/v1/...",
  "ubicacion": "Tepeaca, Puebla",
  "cantidadDisponible": 1000.000,
  "unidadVenta": "kg",
  "contacto": "+52 222 123 4567",
  "latitud": 18.9854,
  "longitud": -97.9155
}
```

| Campo                | Tipo       | Requerido | Validación                              |
|----------------------|------------|-----------|-----------------------------------------|
| `nombreProducto`     | string     | Sí        | Máx 200 caracteres                      |
| `descripcion`        | string     | No        | Máx 5000 caracteres                     |
| `precio`             | number     | Sí        | `>= 0.01`                               |
| `imagenUrl`          | string     | No        | URL Cloudinary                          |
| `ubicacion`          | string     | Sí        | Máx 500 caracteres                      |
| `cantidadDisponible` | number     | Sí        | `>= 0.001`                              |
| `unidadVenta`        | string     | Sí        | Máx 30 caracteres (ej: `"kg"`, `"ton"`) |
| `contacto`           | string     | No        | Máx 200 caracteres                      |
| `latitud`            | number     | No        | Coordenada GPS                          |
| `longitud`           | number     | No        | Coordenada GPS                          |

**Response 201 Created:** → schema `LoteResponse`

---

### PUT /api/catalog/lotes/{id}

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`  
**Summary:** Actualizar un lote existente (solo el propietario)

**Path Parameters:** `id` — ID del lote

**Request Body:** → mismo schema que `POST /api/catalog/lotes`

**Response 200 OK:** → schema `LoteResponse`

| Código | Descripción                           |
|--------|---------------------------------------|
| `200`  | Lote actualizado                      |
| `403`  | El usuario no es propietario del lote |
| `404`  | Lote no encontrado                    |

---

### PATCH /api/catalog/lotes/{id}/estado

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`, `ADMIN`  
**Summary:** Cambiar el estado de un lote

**Request Body:**

```json
{
  "estado": "PAUSADO"
}
```

| Valor posible | Descripción                          |
|---------------|--------------------------------------|
| `DISPONIBLE`  | Visible y abierto para compra        |
| `PAUSADO`     | Oculto temporalmente por el vendedor |
| `VENDIDO`     | Lote completamente vendido           |
| `ELIMINADO`   | Desactivado (no se muestra)          |

**Response 200 OK:** → schema `LoteResponse`

---

### PATCH /api/catalog/lotes/{id}/estado-sistema

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** (tráfico interno entre microservicios)  
**Summary:** [INTERNO] Cambiar estado del lote tras confirmación de pago

> **Nota:** Este endpoint es exclusivo para uso interno del `orders-service` cuando el pago es confirmado por el escrow. No debe llamarse directamente desde el frontend.

**Request Body:**

```json
{
  "estado": "VENDIDO"
}
```

**Response 204 No Content**

---

### GET /api/catalog/mis-lotes

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`  
**Summary:** Obtener todos los lotes del productor autenticado

**Response 200 OK:** → array de `LoteResponse`

---

### DELETE /api/catalog/lotes/{id}

**Tag:** `Catalog - Lotes`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`, `ADMIN`  
**Summary:** Eliminar un lote (solo propietario o ADMIN)

**Response 204 No Content**

| Código | Descripción                              |
|--------|------------------------------------------|
| `204`  | Lote eliminado                           |
| `403`  | No es propietario del lote               |
| `404`  | Lote no encontrado                       |

---

## 6. Endpoints — Catálogo (Productos)

**Base URL:** `/api/productos`  
**Microservicio:** `agroflex-catalog-service` (:8082)

Este sub-módulo gestiona los productos de catálogo general del frontend (tanto cosechas como suministros). Usa un modelo unificado `Producto` que es renderizado por los componentes de tarjeta del marketplace React.

---

### GET /api/productos

**Tag:** `Catalog - Productos`  
**Auth requerida:** No  
**Summary:** Listar productos con filtros y paginación

**Query Parameters:**

| Parámetro  | Tipo    | Default      | Descripción                                  |
|------------|---------|--------------|----------------------------------------------|
| `page`     | integer | `0`          | Página (base 0)                              |
| `size`     | integer | `12`         | Elementos por página                         |
| `tipo`     | string  | —            | `"cosecha"` o `"suministro"`                 |
| `buscar`   | string  | —            | Texto libre en nombre/descripción            |
| `municipio`| string  | —            | Filtrar por municipio (ej: `"Tepeaca"`)      |
| `orden`    | string  | `"recientes"`| `"recientes"`, `"precio_asc"`, `"precio_desc"`, `"populares"` |

**Response 200 OK:**

```json
{
  "content": [
    {
      "id": "23",
      "nombre": "Plaguicida Orgánico Bio-Control",
      "tipo": "suministro",
      "precio": 350.00,
      "unidad": "litro",
      "imagen": "https://res.cloudinary.com/do5jln6yw/image/upload/v1/...",
      "ubicacion": {
        "municipio": "Acatzingo",
        "estado": "Puebla"
      },
      "vendedor": {
        "id": 12,
        "nombre": "AgroInsumos del Valle",
        "rol": "PROVEEDOR",
        "verificado": true
      },
      "disponibilidad": "DISPONIBLE",
      "stock": 200.000,
      "fechaPublicacion": "2024-11-10T14:00:00"
    }
  ],
  "totalElements": 128,
  "totalPages": 11,
  "pageable": { "pageNumber": 0, "pageSize": 12 }
}
```

---

### GET /api/productos/destacados

**Tag:** `Catalog - Productos`  
**Auth requerida:** No  
**Summary:** Obtener hasta 5 productos destacados para el carrusel del homepage

**Response 200 OK:** → array de `ProductoResumenDTO` (máximo 5 elementos)

---

### GET /api/productos/{id}

**Tag:** `Catalog - Productos`  
**Auth requerida:** No  
**Summary:** Obtener detalle de un producto por ID

**Path Parameters:** `id` — ID del producto (string numérico)

**Response 200 OK:** → schema `ProductoResumenDTO`

| Código | Descripción           |
|--------|-----------------------|
| `200`  | Detalle del producto  |
| `404`  | Producto no encontrado|

---

### POST /api/productos

**Tag:** `Catalog - Productos`  
**Auth requerida:** **Sí** — Roles: `PRODUCTOR`, `INVERNADERO`, `PROVEEDOR`, `ADMIN`  
**Summary:** Publicar un nuevo producto en el catálogo

**Descripción de negocio:**  
Permite a vendedores publicar un producto. El rol vendedor se determina automáticamente desde el JWT (prioridad: ADMIN > PRODUCTOR > INVERNADERO > PROVEEDOR). El `tipo` determina si es una cosecha (`stock = null`, se vende el lote completo) o un suministro (`stock` requerido).

**Request Body:**

```json
{
  "tipo": "suministro",
  "nombre": "Fertilizante NPK 20-20-20",
  "descripcion": "Fertilizante balanceado para aplicación foliar",
  "precio": 85.00,
  "unidad": "kg",
  "stock": 500.000,
  "municipio": "Tepeaca",
  "estadoRepublica": "Puebla",
  "imagenPrincipal": "https://res.cloudinary.com/do5jln6yw/image/upload/..."
}
```

| Campo            | Tipo   | Requerido | Validación                          |
|------------------|--------|-----------|-------------------------------------|
| `tipo`           | string | Sí        | `"cosecha"` o `"suministro"`        |
| `nombre`         | string | Sí        | Máx 200 caracteres                  |
| `descripcion`    | string | No        | Máx 2000 caracteres                 |
| `precio`         | number | Sí        | `>= 0.01`                           |
| `unidad`         | string | Sí        | Máx 50 caracteres                   |
| `stock`          | number | No*       | `>= 0.001` (requerido para suministros) |
| `municipio`      | string | Sí        | Nombre del municipio                |
| `estadoRepublica`| string | Sí        | Estado (ej: `"Puebla"`)             |
| `imagenPrincipal`| string | No        | URL de imagen                       |

**Response 201 Created:** → schema `ProductoResumenDTO`

---

## 7. Endpoints — Pedidos (Orders)

**Base URL:** `/api/orders`  
**Microservicio:** `agroflex-orders-service` (:8084)

El sistema de pedidos usa un flujo con **escrow**: el dinero del comprador queda retenido hasta que la entrega es confirmada mediante escaneo del QR.

**Flujo de un pedido:**
```
PENDIENTE_PAGO → PAGO_CONFIRMADO → EN_PREPARACION → LISTO_ENTREGA → ENTREGADO
                                                                  ↓ (por cancelación)
                                                              CANCELADO / REEMBOLSADO
```

---

### POST /api/orders

**Tag:** `Orders`  
**Auth requerida:** **Sí** — Roles: `COMPRADOR`, `PRODUCTOR`, `PROVEEDOR`, `EMPAQUE`  
**Summary:** Crear una nueva orden de compra

**Descripción de negocio:**  
Crea la orden en estado `PENDIENTE_PAGO`. Simultáneamente llama al `payments-service` para crear un `PaymentIntent` en Stripe y retorna el `clientSecret` para que el frontend confirme el pago con Stripe.js.

**Request Body:**

```json
{
  "idVendedor": 7,
  "items": [
    {
      "idProducto": 15,
      "tipoProducto": "COSECHA_LOTE",
      "cantidad": 100.000
    }
  ],
  "metodoPago": "STRIPE",
  "observaciones": "Entregar antes de las 10am",
  "latitudEntrega": 18.9854,
  "longitudEntrega": -97.9155
}
```

| Campo              | Tipo        | Requerido | Descripción                              |
|--------------------|-------------|-----------|------------------------------------------|
| `idVendedor`       | Long        | Sí        | ID del vendedor                          |
| `items`            | array       | Sí        | Al menos 1 item                          |
| `items[].idProducto`  | Long     | Sí        | ID del producto/lote                     |
| `items[].tipoProducto`| string   | Sí        | `"COSECHA_LOTE"` o `"SUMINISTRO"`        |
| `items[].cantidad`    | number   | Sí        | `>= 0.01`                                |
| `metodoPago`       | string      | No        | `"STRIPE"` (default) o `"PAYPAL"`       |
| `observaciones`    | string      | No        | Instrucciones de entrega                 |
| `latitudEntrega`   | number      | No        | GPS del punto de entrega                 |
| `longitudEntrega`  | number      | No        | GPS del punto de entrega                 |

**Response 201 Created:**

```json
{
  "id": 88,
  "numeroOrden": "AGF-2024-000088",
  "idComprador": 42,
  "nombreComprador": "Juan Pérez",
  "idVendedor": 7,
  "nombreVendedor": "Don Roberto",
  "estadoPedido": "PENDIENTE_PAGO",
  "totalMonto": 850.00,
  "montoEscrow": 850.00,
  "metodoPago": "STRIPE",
  "idTransaccionPago": "pi_3QBcXXXXX",
  "items": [
    {
      "idProducto": 15,
      "tipoProducto": "COSECHA_LOTE",
      "cantidad": 100.000,
      "precioUnitario": 8.50,
      "subtotal": 850.00,
      "nombreProducto": "Tomate Saladette",
      "unidadVenta": "kg"
    }
  ],
  "observaciones": "Entregar antes de las 10am",
  "latitudEntrega": 18.9854,
  "longitudEntrega": -97.9155,
  "fechaCreacion": "2024-11-15T12:00:00",
  "fechaActualizacion": "2024-11-15T12:00:00",
  "warnings": []
}
```

| Código | Descripción                               |
|--------|-------------------------------------------|
| `201`  | Orden creada, pago pendiente              |
| `400`  | Datos de orden inválidos                  |
| `404`  | Producto o vendedor no encontrado         |
| `409`  | Stock insuficiente para el lote           |

---

### GET /api/orders/{orderId}

**Tag:** `Orders`  
**Auth requerida:** **Sí** (comprador, vendedor de la orden o ADMIN)  
**Summary:** Obtener detalle de una orden

**Path Parameters:** `orderId` — ID de la orden

**Response 200 OK:** → schema `OrderResponse`

| Código | Descripción                              |
|--------|------------------------------------------|
| `200`  | Detalle de la orden                      |
| `403`  | No eres participante ni ADMIN de la orden|
| `404`  | Orden no encontrada                      |

---

### GET /api/orders/mis-pedidos

**Tag:** `Orders`  
**Auth requerida:** **Sí**  
**Summary:** Listar pedidos del usuario autenticado

**Query Parameters:**

| Parámetro | Tipo   | Default      | Descripción                                   |
|-----------|--------|--------------|-----------------------------------------------|
| `rol`     | string | `"comprador"`| `"comprador"` — pedidos hechos; `"vendedor"` — pedidos recibidos |

**Response 200 OK:** → array de `OrderResponse`

---

### PUT /api/orders/{orderId}/status

**Tag:** `Orders`  
**Auth requerida:** **Sí**  
**Summary:** Actualizar el estado de una orden

**Request Body:**

```json
{
  "nuevoEstado": "EN_PREPARACION",
  "motivo": "Preparando el empaque del pedido"
}
```

**Response 200 OK:** → schema `OrderResponse`

---

### DELETE /api/orders/{orderId}

**Tag:** `Orders`  
**Auth requerida:** **Sí**  
**Summary:** Cancelar una orden

**Query Parameters:**

| Parámetro | Tipo   | Default                    | Descripción          |
|-----------|--------|----------------------------|----------------------|
| `motivo`  | string | `"Cancelado por el usuario"` | Razón de cancelación |

**Response 204 No Content**

---

### GET /api/orders/stats

**Tag:** `Orders`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Estadísticas globales de órdenes para el panel admin

**Response 200 OK:**

```json
{
  "totalOrdenes": 1423,
  "ordenesPendientes": 38,
  "ordenesEntregadas": 1200,
  "ordenesCanceladas": 185,
  "montoTotalProcesado": 2456000.00
}
```

---

### POST /api/orders/{orderId}/release

**Tag:** `Orders`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Liberar manualmente el pago en escrow al vendedor

**Response 200 OK**

---

### GET /api/orders/status/{status}

**Tag:** `Orders`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Listar órdenes por estado (paginado)

**Path Parameters:**

| Parámetro | Tipo   | Valores posibles                                              |
|-----------|--------|---------------------------------------------------------------|
| `status`  | string | `PENDIENTE_PAGO`, `PAGO_CONFIRMADO`, `EN_PREPARACION`, `LISTO_ENTREGA`, `ENTREGADO`, `CANCELADO`, `REEMBOLSADO` |

**Query Parameters:**

| Parámetro | Default          | Descripción       |
|-----------|------------------|-------------------|
| `page`    | `0`              | Página            |
| `size`    | `20`             | Tamaño            |
| `sortBy`  | `"fechaCreacion"`| Campo de ordenamiento |
| `sortDir` | `"desc"`         | `"asc"` o `"desc"` |

**Response 200 OK:** → `Page<OrderResponse>`

---

## 8. Endpoints — Pagos (Payments)

**Base URL:** `/api/payments`  
**Microservicio:** `agroflex-payments-service` (:8085)

Integrado con **Stripe API**. El flujo usa `PaymentIntent` (no Checkout Sessions). La comisión de la plataforma es del **3.5%**. Los fondos se retienen en **escrow** hasta confirmar la entrega con QR.

---

### POST /api/payments/create-intent

**Tag:** `Payments`  
**Auth requerida:** **Sí**  
**Summary:** Crear un PaymentIntent en Stripe para procesar un pago

**Descripción de negocio:**  
Llamado automáticamente por `orders-service` al crear una orden. Crea un `PaymentIntent` en Stripe con el monto de la orden (incluyendo comisión del 3.5%) y retorna el `clientSecret` necesario para que el frontend confirme el pago con Stripe.js.

**Request Body:**

```json
{
  "idOrden": 88,
  "montoTotal": 850.00,
  "moneda": "mxn",
  "descripcion": "Orden AGF-2024-000088 - Tomate Saladette"
}
```

**Response 201 Created:**

```json
{
  "clientSecret": "pi_3QBcXXXXX_secret_XXXX",
  "paymentIntentId": "pi_3QBcXXXXX",
  "monto": 850.00,
  "moneda": "mxn"
}
```

---

### POST /api/payments/release/{orderId}

**Tag:** `Payments`  
**Auth requerida:** **Sí** (llamado por `orders-service`)  
**Summary:** [INTERNO] Liberar el escrow al vendedor tras confirmación de entrega

**Path Parameters:** `orderId` — ID de la orden

**Response 200 OK**

---

### POST /api/payments/refund/{orderId}

**Tag:** `Payments`  
**Auth requerida:** **Sí** (llamado por `orders-service`)  
**Summary:** [INTERNO] Procesar reembolso al comprador

**Request Body:**

```json
{
  "motivo": "Pedido cancelado — producto no disponible"
}
```

**Response 200 OK**

---

### GET /api/payments/escrow-status/{orderId}

**Tag:** `Payments`  
**Auth requerida:** **Sí**  
**Summary:** Consultar el estado del escrow de una orden

**Response 200 OK:**

```json
{
  "idOrden": 88,
  "estado": "RETENIDO",
  "monto": 850.00,
  "paymentIntentId": "pi_3QBcXXXXX",
  "fechaCreacion": "2024-11-15T12:00:00",
  "fechaLiberacion": null
}
```

| Estado posible  | Descripción                              |
|-----------------|------------------------------------------|
| `RETENIDO`      | Dinero retenido, esperando entrega       |
| `LIBERADO`      | Dinero transferido al vendedor           |
| `REEMBOLSADO`   | Dinero devuelto al comprador             |

---

### GET /api/payments/transactions/mis-transacciones

**Tag:** `Payments`  
**Auth requerida:** **Sí**  
**Summary:** Historial de transacciones del usuario autenticado

**Descripción de negocio:**  
El historial se filtra por rol: si el usuario es comprador muestra sus pagos; si es vendedor muestra los cobros recibidos.

**Response 200 OK:** → array de `TransactionDto`

---

### GET /api/payments/transactions/{id}

**Tag:** `Payments`  
**Auth requerida:** **Sí**  
**Summary:** Obtener detalle de una transacción por ID

**Response 200 OK:** → schema `TransactionDto`

---

### GET /api/payments/transactions/orden/{orderId}

**Tag:** `Payments`  
**Auth requerida:** **Sí**  
**Summary:** Obtener la transacción asociada a una orden

**Response 200 OK:** → schema `TransactionDto`

---

### GET /api/payments/transactions

**Tag:** `Payments`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Lista paginada de todas las transacciones del sistema

**Query Parameters:** `page` (0), `size` (20)

**Response 200 OK:** → `Page<TransactionDto>`

---

### POST /api/webhooks/stripe

**Tag:** `Payments`  
**Auth requerida:** No (verificación por firma `Stripe-Signature`)  
**Summary:** Webhook receptor de eventos de Stripe

> **IMPORTANTE:** Esta ruta está excluida del filtro JWT. La seguridad se garantiza verificando la firma HMAC del header `Stripe-Signature` con el `STRIPE_WEBHOOK_SECRET`.

**Headers requeridos:**

| Header             | Descripción                              |
|--------------------|------------------------------------------|
| `Stripe-Signature` | Firma HMAC-SHA256 generada por Stripe    |
| `Content-Type`     | `application/json` (body RAW sin parsear)|

**Eventos procesados:**

| Evento Stripe                    | Acción en AgroFlex                          |
|----------------------------------|---------------------------------------------|
| `payment_intent.succeeded`       | Orden pasa a `PAGO_CONFIRMADO`, genera QR   |
| `payment_intent.payment_failed`  | Orden pasa a `CANCELADO`                    |
| `charge.refunded`                | Registra reembolso en escrow                |

| Código | Descripción                                          |
|--------|------------------------------------------------------|
| `200`  | Evento procesado (o error interno — no reintenta Stripe) |
| `400`  | Firma `Stripe-Signature` inválida                    |

---

## 9. Endpoints — Validación QR

**Base URL:** `/api/qr`  
**Microservicio:** `agroflex-qr-service` (:8086)

El sistema QR es el mecanismo de confirmación de entrega. El vendedor genera un QR al preparar el pedido; el comprador lo escanea en el punto de entrega. La validación exitosa libera el escrow al vendedor.

---

### POST /api/qr/generate

**Tag:** `QR Validation`  
**Auth requerida:** No (tráfico interno de `orders-service`)  
**Summary:** [INTERNO] Generar QR para una orden pagada

**Request Body:**

```json
{
  "idOrden": 88,
  "numeroOrden": "AGF-2024-000088",
  "idVendedor": 7,
  "idComprador": 42,
  "latitudEntrega": 18.9854,
  "longitudEntrega": -97.9155
}
```

**Response 200 OK:**

```json
{
  "token": "qr_a3f2c1d4e5b67890abcdef12",
  "qrImageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "expiresAt": "2024-11-16T12:00:00",
  "idOrden": 88
}
```

---

### POST /api/qr/validar

**Tag:** `QR Validation`  
**Auth requerida:** No  
**Summary:** Validar un QR escaneado por el comprador (endpoint del frontend)

**Descripción de negocio:**  
El frontend envía el token extraído del QR escaneado junto con la ubicación GPS del dispositivo. El sistema verifica la autenticidad del token, la vigencia, y opcionalmente la distancia entre el GPS del escaneo y el punto de entrega registrado en la orden. Si es válido, notifica al `orders-service` para liberar el escrow.

**Request Body:**

```json
{
  "token": "qr_a3f2c1d4e5b67890abcdef12",
  "lat": 18.9856,
  "lng": -97.9153,
  "precisionGpsM": 5.0,
  "ipEscaneo": "192.168.1.100",
  "userAgentEscaneo": "Mozilla/5.0 (Android...)"
}
```

**Response 200 OK:**

```json
{
  "valido": true,
  "estado": "VALIDADO",
  "mensaje": "Entrega confirmada exitosamente",
  "liberarEscrow": true,
  "idOrden": 88,
  "geoValidado": true,
  "distanciaMetros": 22.5
}
```

| `valido` | `estado`  | `liberarEscrow` | Significado                          |
|----------|-----------|-----------------|--------------------------------------|
| `true`   | `VALIDADO`| `true`          | QR válido, escrow liberado           |
| `false`  | `INVALIDO`| `false`         | Token no existe                      |
| `false`  | `EXPIRADO`| `false`         | Token expirado                       |
| `false`  | `YA_USADO`| `false`         | QR ya fue escaneado anteriormente    |

---

### POST /api/qr/validate

**Tag:** `QR Validation`  
**Auth requerida:** No (tráfico interno)  
**Summary:** [INTERNO] Validación extendida de QR con idOrden explícito

**Request Body:**

```json
{
  "token": "qr_a3f2c1d4e5b67890abcdef12",
  "idOrden": 88,
  "latitudEscaneo": 18.9856,
  "longitudEscaneo": -97.9153,
  "precisionGpsM": 5.0,
  "ipEscaneo": "192.168.1.100",
  "userAgentEscaneo": "Mozilla/5.0..."
}
```

**Response 200 OK:** → schema `QrValidateResponse`

---

### GET /api/qr/orden/{idOrden}

**Tag:** `QR Validation`  
**Auth requerida:** **Sí** — Todos los roles autenticados  
**Summary:** Consultar el estado actual del QR de una orden

**Path Parameters:** `idOrden` — ID de la orden

**Response 200 OK:** → entidad `SeguridadQR` (token, estado, fechas, flags de validación geográfica)

| Código | Descripción               |
|--------|---------------------------|
| `200`  | QR encontrado             |
| `404`  | No hay QR para esa orden  |

---

## 10. Endpoints — Usuarios

**Base URL:** `/api/users`  
**Microservicio:** `agroflex-users-service` (:8083)

---

### GET /api/users/me

**Tag:** `Users`  
**Auth requerida:** **Sí**  
**Summary:** Obtener el perfil completo del usuario autenticado

**Response 200 OK:**

```json
{
  "id": 42,
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "correo": "juan.perez@correo.com",
  "telefono": "+5222123456789",
  "fotoPerfil": "https://res.cloudinary.com/do5jln6yw/...",
  "roles": ["PRODUCTOR", "COMPRADOR"],
  "activo": true,
  "createdAt": "2024-01-15T08:30:00",
  "reputacion": 4.7,
  "totalReseñas": 23
}
```

---

### PUT /api/users/me

**Tag:** `Users`  
**Auth requerida:** **Sí**  
**Summary:** Actualizar el perfil del usuario autenticado

**Request Body:**

```json
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez García",
  "telefono": "+5222987654321",
  "fotoPerfil": "https://res.cloudinary.com/do5jln6yw/perfil/42_new.jpg"
}
```

**Response 200 OK:** → schema `MiPerfilResponse`

---

### GET /api/users/{id}

**Tag:** `Users`  
**Auth requerida:** No  
**Summary:** Obtener perfil público de un vendedor

**Descripción de negocio:**  
Vista pública del perfil de cualquier usuario (vendedor). Expone reputación, roles verificados e insignias, pero no datos sensibles (correo, teléfono).

**Response 200 OK:**

```json
{
  "id": 7,
  "nombre": "Don Roberto",
  "fotoPerfil": "https://res.cloudinary.com/do5jln6yw/...",
  "roles": ["PRODUCTOR"],
  "reputacion": 4.8,
  "totalReseñas": 45,
  "miembroDesde": "2023-03-10",
  "insignias": ["PRODUCTOR_VERIFICADO"]
}
```

---

### GET /api/users/{id}/insignias

**Tag:** `Users`  
**Auth requerida:** No  
**Summary:** Listar insignias de un usuario

**Response 200 OK:**

```json
[
  {
    "id": 3,
    "tipo": "PRODUCTOR_VERIFICADO",
    "descripcion": "Productor verificado por AgroFlex",
    "otorgadaEn": "2024-02-20T10:00:00"
  }
]
```

---

### GET /api/users/{id}/reseñas

**Tag:** `Users`  
**Auth requerida:** No  
**Summary:** Listar reseñas recibidas por un usuario (paginado)

**Query Parameters:** Paginación estándar Spring Data (`page`, `size`, `sort`)

**Response 200 OK:** → `Page<ReseñaResponse>`

---

### POST /api/users/me/reseñas

**Tag:** `Users`  
**Auth requerida:** **Sí**  
**Summary:** Crear una reseña para un vendedor tras una transacción completada

**Request Body:**

```json
{
  "idVendedor": 7,
  "idOrden": 88,
  "calificacion": 5,
  "comentario": "Excelente tomate, muy fresco y buen precio"
}
```

**Response 201 Created:** → schema `ReseñaResponse`

---

### GET /api/users

**Tag:** `Users`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Listar todos los usuarios del sistema (paginado con búsqueda)

**Query Parameters:**

| Parámetro  | Tipo   | Descripción                           |
|------------|--------|---------------------------------------|
| `busqueda` | string | Búsqueda por nombre o correo          |
| `page`     | int    | Página (Spring Pageable)              |
| `size`     | int    | Tamaño (default 20)                   |

**Response 200 OK:** → `Page<UsuarioAdminResponse>`

---

### PATCH /api/users/{id}/estado

**Tag:** `Users`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Activar o desactivar un usuario

**Query Parameters:**

| Parámetro | Tipo    | Descripción                  |
|-----------|---------|------------------------------|
| `activo`  | boolean | `true` = activar, `false` = suspender |

**Response 200 OK:** → schema `UsuarioAdminResponse`

---

### DELETE /api/users/{id}

**Tag:** `Users`  
**Auth requerida:** **Sí** — Rol: `ADMIN`  
**Summary:** Eliminar permanentemente un usuario

**Response 204 No Content**

---

## 11. Endpoints — Notificaciones

**Base URL:** `/api/notifications`  
**Microservicio:** `agroflex-notifications-service` (:8088)

El sistema soporta notificaciones **in-app** (persistidas en MySQL) y **push** (FCM). Las notificaciones in-app se muestran en el header de la app React. Las push llegan al dispositivo móvil/escritorio aunque la app esté cerrada.

---

### GET /api/notifications/mis-notificaciones

**Tag:** `Notifications`  
**Auth requerida:** **Sí**  
**Summary:** Obtener notificaciones del usuario autenticado (paginado)

**Query Parameters:** Paginación Spring (`page`, `size` default 20)

**Response 200 OK:**

```json
{
  "content": [
    {
      "id": 201,
      "titulo": "Pago confirmado",
      "cuerpo": "Tu orden AGF-2024-000088 ha sido pagada. Prepara el envío.",
      "categoria": "ORDEN",
      "leida": false,
      "createdAt": "2024-11-15T12:05:00"
    }
  ],
  "totalElements": 12,
  "totalPages": 1
}
```

---

### GET /api/notifications/no-leidas/count

**Tag:** `Notifications`  
**Auth requerida:** **Sí**  
**Summary:** Obtener el conteo de notificaciones no leídas (para el badge del header)

**Response 200 OK:**

```json
{
  "count": 3
}
```

---

### PATCH /api/notifications/{id}/leer

**Tag:** `Notifications`  
**Auth requerida:** **Sí**  
**Summary:** Marcar una notificación específica como leída

**Response 204 No Content**

---

### PATCH /api/notifications/leer-todas

**Tag:** `Notifications`  
**Auth requerida:** **Sí**  
**Summary:** Marcar todas las notificaciones del usuario como leídas

**Response 204 No Content**

---

### GET /api/notifications/stream

**Tag:** `Notifications`  
**Auth requerida:** **Sí**  
**Summary:** Conexión SSE para notificaciones en tiempo real

**Descripción de negocio:**  
El frontend se conecta a este endpoint al cargar la aplicación usando el polyfill `@microsoft/fetch-event-source` (que permite enviar el header `Authorization`). El servidor mantiene la conexión abierta y envía eventos cada vez que el usuario recibe una nueva notificación, sin que el cliente tenga que hacer polling.

**Headers:**

```
Authorization: Bearer <accessToken>
Accept: text/event-stream
```

**Response:** `text/event-stream` — stream de eventos SSE

**Ejemplo de evento recibido:**

```
data: {"id":202,"titulo":"QR escaneado","cuerpo":"Entrega confirmada para AGF-2024-000088","categoria":"QR","leida":false}
```

> **Nota:** La conexión se cierra automáticamente si el token JWT expira. El frontend debe reconectar con un nuevo token.

---

### POST /api/notifications/internal/enviar

**Tag:** `Notifications`  
**Auth requerida:** No (tráfico interno entre microservicios)  
**Summary:** [INTERNO] Enviar notificación a un usuario desde otro microservicio

**Request Body:**

```json
{
  "idUsuario": 42,
  "titulo": "Pago confirmado",
  "cuerpo": "Tu orden AGF-2024-000088 fue pagada exitosamente",
  "categoria": "ORDEN",
  "correoUsuario": "juan.perez@correo.com",
  "fcmToken": "fMnBxXXXX..."
}
```

| Campo          | Tipo   | Requerido | Descripción                            |
|----------------|--------|-----------|----------------------------------------|
| `idUsuario`    | Long   | Sí        | ID del destinatario                    |
| `titulo`       | string | Sí        | Título de la notificación              |
| `cuerpo`       | string | Sí        | Contenido del mensaje                  |
| `categoria`    | string | Sí        | `ORDEN`, `PAGO`, `QR`, `SISTEMA`, `INSIGNIA` |
| `correoUsuario`| string | No        | Para envío por correo si aplica        |
| `fcmToken`     | string | No        | Token FCM del dispositivo (push)       |

**Response 201 Created:** → schema `NotificacionResponse`

---

## 12. Endpoints — Geolocalización

**Base URL:** `/api/geolocation`  
**Microservicio:** `agroflex-geolocation-service` (:8087)

Todos los endpoints de este módulo son **públicos** — no requieren autenticación.

---

### GET /api/geolocation/municipios

**Tag:** `Geolocation`  
**Auth requerida:** No  
**Summary:** Obtener lista de municipios para selectores de ubicación

**Descripción de negocio:**  
Datos de referencia para poblar los selectores de municipio en formularios de publicación de productos y filtros del marketplace. Cubre los municipios del estado de Puebla con énfasis en la zona Tepeaca-Acatzingo-Huixcolotla.

**Query Parameters:**

| Parámetro | Tipo   | Default   | Descripción                         |
|-----------|--------|-----------|-------------------------------------|
| `estado`  | string | `"puebla"`| Por ahora solo `"puebla"` soportado |
| `q`       | string | —         | Búsqueda parcial por nombre         |

**Ejemplos:**
```
GET /api/geolocation/municipios
GET /api/geolocation/municipios?q=tepe
GET /api/geolocation/municipios?q=aca
```

**Response 200 OK:**

```json
[
  {
    "id": 1,
    "nombre": "Tepeaca",
    "estado": "Puebla",
    "latitud": 18.9854,
    "longitud": -97.9155
  },
  {
    "id": 2,
    "nombre": "Acatzingo",
    "estado": "Puebla",
    "latitud": 18.9812,
    "longitud": -97.7822
  },
  {
    "id": 3,
    "nombre": "Huixcolotla",
    "estado": "Puebla",
    "latitud": 18.9411,
    "longitud": -97.8367
  }
]
```

---

## 13. Endpoints — Administración

**Base URL:** `/api/admin`  
**Microservicio:** `agroflex-admin-service` (:8089)

> **Todos los endpoints de este módulo requieren rol `ADMIN`.** El Gateway verifica el JWT antes de enrutar al admin-service.

---

### Dashboard

#### GET /api/admin/dashboard/stats

**Summary:** Estadísticas globales del sistema para el panel principal

**Response 200 OK:**

```json
{
  "totalUsuarios": 1842,
  "usuariosActivos": 1654,
  "totalProductos": 423,
  "productosActivos": 310,
  "totalOrdenes": 2891,
  "ordenesPendientes": 42,
  "ingresosTotales": 5420000.00,
  "ingresosMes": 380000.00
}
```

#### GET /api/admin/dashboard/actividad-reciente

**Summary:** Log de actividad reciente del sistema

> ⚠️ Pendiente de implementación (retorna array vacío actualmente).

---

### Gestión de Usuarios

#### GET /api/admin/usuarios

**Summary:** Listar usuarios con filtros y paginación

**Query Parameters:**

| Parámetro | Tipo    | Descripción                            |
|-----------|---------|----------------------------------------|
| `buscar`  | string  | Búsqueda por nombre/correo             |
| `activo`  | boolean | Filtrar por estado activo/suspendido   |
| `page`    | int     | Página (default 0)                     |
| `size`    | int     | Tamaño (default 20)                    |

**Response 200 OK:** → `Page<UsuarioResumenDTO>`

#### GET /api/admin/usuarios/{id}

**Summary:** Obtener detalle de un usuario específico

**Response 200 OK:** → schema `UsuarioResumenDTO`

#### PATCH /api/admin/usuarios/{id}/suspender

**Summary:** Suspender un usuario

**Request Body:** `{ "motivo": "Violación de términos de servicio" }`

**Response 200 OK:** → `UsuarioResumenDTO`

#### PATCH /api/admin/usuarios/{id}/activar

**Summary:** Reactivar un usuario suspendido

**Request Body:** `{ "motivo": "Revisión completada, usuario reactivado" }`

**Response 200 OK:** → `UsuarioResumenDTO`

#### PATCH /api/admin/usuarios/{id}/rol

**Summary:** Cambiar el rol de un usuario

**Request Body:** `{ "rol": "PRODUCTOR" }`

**Response 200 OK:** → `UsuarioResumenDTO`

#### DELETE /api/admin/usuarios/{id}

**Summary:** Eliminar permanentemente un usuario

**Response 204 No Content**

#### GET /api/admin/usuarios/export

**Summary:** Exportar lista de usuarios a CSV

**Response 200 OK:**  
```
Content-Type: text/csv; charset=UTF-8
Content-Disposition: attachment; filename="usuarios_agroflex.csv"
```

---

### Gestión de Pedidos

#### GET /api/admin/pedidos

**Summary:** Listar todos los pedidos con filtros

**Query Parameters:** `estado`, `page` (0), `size` (20)

**Response 200 OK:** → `Map<String, Object>` paginado

#### GET /api/admin/pedidos/{id}

**Summary:** Obtener detalle de un pedido

#### PATCH /api/admin/pedidos/{id}/intervenir

**Summary:** Intervención administrativa en un pedido

**Request Body:** `{ "accion": "FORZAR_ENTREGA", "motivo": "Vendedor confirmó entrega manual" }`

#### POST /api/admin/pedidos/{id}/reembolsar

**Summary:** Ordenar reembolso manual de un pedido

**Request Body:** `{ "motivo": "Disputa resuelta a favor del comprador" }`

#### GET /api/admin/pedidos/export

**Summary:** Exportar pedidos a CSV

---

### Gestión de Catálogo

#### GET /api/admin/catalogo/productos

**Summary:** Listar todos los productos del sistema con filtros

**Query Parameters:** `tipo`, `activo`, `buscar`, `page` (0), `size` (20)

**Response 200 OK:** → `Page<ProductoAdminDTO>`

#### GET /api/admin/catalogo/productos/{id}

**Summary:** Detalle de un producto

#### DELETE /api/admin/catalogo/productos/{id}

**Summary:** Eliminar un producto

**Request Body:** `{ "motivo": "Contenido inapropiado" }`

#### PATCH /api/admin/catalogo/productos/{id}/suspender

**Summary:** Suspender temporalmente un producto del listado público

**Request Body:** `{ "motivo": "Revisión de calidad" }`

#### PATCH /api/admin/catalogo/productos/{id}/restaurar

**Summary:** Restaurar un producto suspendido al listado público

---

### Gestión de Insignias

#### GET /api/admin/insignias/pendientes

**Summary:** Listar solicitudes de insignia pendientes de revisión

**Response 200 OK:** → array de `SolicitudInsignia`

#### GET /api/admin/insignias

**Summary:** Listar todas las solicitudes de insignia (paginado)

**Query Parameters:** `estado`, `page`, `size`

#### GET /api/admin/insignias/{id}

**Summary:** Detalle de una solicitud de insignia

#### POST /api/admin/insignias/{id}/aprobar

**Summary:** Aprobar una solicitud de insignia

**Request Body:** `{ "comentario": "Documentación verificada correctamente" }`

**Response 200 OK:** → `SolicitudInsignia` (con estado `APROBADA`)

#### POST /api/admin/insignias/{id}/rechazar

**Summary:** Rechazar una solicitud de insignia

**Request Body:** `{ "motivoRechazo": "Documentación insuficiente" }`

**Response 200 OK:** → `SolicitudInsignia` (con estado `RECHAZADA`)

#### GET /api/admin/insignias/stats

**Summary:** Estadísticas de insignias

**Response 200 OK:** `{ "pendientes": 5, "aprobadas": 142, "rechazadas": 23 }`

---

### Gestión de Disputas

#### GET /api/admin/disputas

**Summary:** Listar disputas abiertas

**Query Parameters:** `estado`, `page` (0), `size` (20)

**Response 200 OK:** → `Page<Disputa>`

#### GET /api/admin/disputas/{id}

**Summary:** Detalle de una disputa

#### POST /api/admin/disputas/{id}/tomar

**Summary:** Asignar la disputa al administrador autenticado

**Response 200 OK:** → `Disputa` (con admin asignado)

#### POST /api/admin/disputas/{id}/resolver

**Summary:** Resolver una disputa con acción concreta

**Request Body:**

```json
{
  "resolucion": "Se confirma la entrega según evidencia fotográfica del vendedor",
  "accion": "LIBERAR_ESCROW"
}
```

| `accion` posible  | Descripción                            |
|-------------------|----------------------------------------|
| `LIBERAR_ESCROW`  | Liberar pago al vendedor               |
| `REEMBOLSAR`      | Reembolsar al comprador                |
| `CERRAR`          | Cerrar sin acción financiera           |

---

### Broadcast de Notificaciones

#### POST /api/admin/broadcast

**Summary:** Enviar notificación masiva a todos los usuarios o a un segmento

**Request Body:**

```json
{
  "titulo": "Mantenimiento programado",
  "mensaje": "El sistema estará en mantenimiento el sábado de 2am a 4am.",
  "segmento": "PRODUCTOR"
}
```

| Campo      | Tipo   | Requerido | Descripción                                              |
|------------|--------|-----------|----------------------------------------------------------|
| `titulo`   | string | Sí        | Título de la notificación                                |
| `mensaje`  | string | Sí        | Cuerpo del mensaje                                       |
| `segmento` | string | No        | Rol específico a notificar. Si es `null`, envía a todos  |

**Response 200 OK:**

```json
{
  "enviados": 1654,
  "fallidos": 2,
  "segmento": "PRODUCTOR"
}
```

---

## 14. Schemas de Componentes

### AuthResponse

```json
{
  "accessToken":  "string — JWT Bearer (24h)",
  "refreshToken": "string — JWT Refresh (7d)",
  "tokenType":    "string — siempre 'Bearer'",
  "id":           "integer — ID del usuario en MySQL",
  "nombre":       "string — Nombre del usuario",
  "correo":       "string — Correo electrónico",
  "roles":        "string[] — Lista de roles RBAC",
  "validado":     "boolean — Correo verificado",
  "fotoPerfil":   "string | null — URL Cloudinary"
}
```

---

### LoteRequest

```json
{
  "nombreProducto":     "string (requerido, máx 200)",
  "descripcion":        "string (opcional, máx 5000)",
  "precio":             "number (requerido, >= 0.01)",
  "imagenUrl":          "string (URL Cloudinary, opcional)",
  "ubicacion":          "string (requerido, máx 500)",
  "cantidadDisponible": "number (requerido, >= 0.001)",
  "unidadVenta":        "string (requerido, máx 30)",
  "contacto":           "string (opcional, máx 200)",
  "latitud":            "number (opcional, GPS)",
  "longitud":           "number (opcional, GPS)"
}
```

---

### LoteResponse

```json
{
  "idLote":              "integer",
  "nombreProducto":      "string",
  "descripcion":         "string | null",
  "precio":              "number (BigDecimal)",
  "imagenUrl":           "string | null",
  "ubicacion":           "string",
  "cantidadDisponible":  "number (BigDecimal)",
  "unidadVenta":         "string",
  "contacto":            "string | null",
  "estadoLote":          "string (DISPONIBLE|PAUSADO|VENDIDO|ELIMINADO)",
  "idProductor":         "integer",
  "nombreProductor":     "string",
  "fotoPerfilProductor": "string | null",
  "reputacionProductor": "number | null",
  "createdAt":           "string (ISO-8601 datetime)",
  "latitud":             "number | null",
  "longitud":            "number | null"
}
```

---

### ProductoResumenDTO

```json
{
  "id":               "string (ID numérico como string)",
  "nombre":           "string",
  "tipo":             "string (cosecha|suministro)",
  "precio":           "number",
  "unidad":           "string",
  "imagen":           "string | null",
  "ubicacion": {
    "municipio":      "string",
    "estado":         "string"
  },
  "vendedor": {
    "id":             "integer",
    "nombre":         "string",
    "rol":            "string",
    "verificado":     "boolean"
  },
  "disponibilidad":   "string (DISPONIBLE|AGOTADO|PAUSADO)",
  "stock":            "number | null",
  "fechaPublicacion": "string (ISO-8601 datetime)"
}
```

---

### OrderResponse

```json
{
  "id":                   "integer",
  "numeroOrden":          "string (AGF-YYYY-NNNNNN)",
  "idComprador":          "integer",
  "nombreComprador":      "string",
  "idVendedor":           "integer",
  "nombreVendedor":       "string",
  "estadoPedido":         "string (enum EstadoPedido)",
  "totalMonto":           "number",
  "montoEscrow":          "number",
  "metodoPago":           "string (STRIPE|PAYPAL)",
  "idTransaccionPago":    "string | null",
  "items":                "OrderItemDto[]",
  "observaciones":        "string | null",
  "latitudEntrega":       "number | null",
  "longitudEntrega":      "number | null",
  "fechaCreacion":        "string (ISO-8601)",
  "fechaActualizacion":   "string (ISO-8601)",
  "warnings":             "string[]"
}
```

---

### OrderItemDto

```json
{
  "idProducto":     "integer",
  "tipoProducto":   "string (COSECHA_LOTE|SUMINISTRO)",
  "cantidad":       "number (>= 0.01)",
  "precioUnitario": "number | null (snapshot)",
  "subtotal":       "number | null (snapshot)",
  "nombreProducto": "string | null (snapshot)",
  "unidadVenta":    "string | null (snapshot)"
}
```

---

### QrValidateResponse

```json
{
  "valido":          "boolean",
  "estado":          "string (VALIDADO|INVALIDO|EXPIRADO|YA_USADO)",
  "mensaje":         "string",
  "liberarEscrow":   "boolean",
  "idOrden":         "integer | null",
  "geoValidado":     "boolean | null",
  "distanciaMetros": "number | null"
}
```

---

### ErrorResponse (estándar)

Todos los errores de la API retornan este formato:

```json
{
  "error":     "string — código de error técnico (ej: INVALID_CREDENTIALS)",
  "message":   "string — mensaje legible para el usuario",
  "timestamp": "string — ISO-8601 (ej: 2024-11-15T12:05:32.000Z)",
  "details":   "object | null — información adicional de depuración"
}
```

**Ejemplos:**

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Correo o contraseña incorrectos",
  "timestamp": "2024-11-15T12:05:32.000Z",
  "details": null
}
```

```json
{
  "error": "VALIDATION_FAILED",
  "message": "Los datos enviados no son válidos",
  "timestamp": "2024-11-15T12:05:32.000Z",
  "details": {
    "correo": "El correo debe ser válido",
    "password": "La contraseña debe tener al menos 8 caracteres"
  }
}
```

---

### Enums de Referencia

#### EstadoPedido

| Valor              | Descripción                                    |
|--------------------|------------------------------------------------|
| `PENDIENTE_PAGO`   | Orden creada, esperando pago de Stripe         |
| `PAGO_CONFIRMADO`  | Stripe confirmó el pago, QR generado           |
| `EN_PREPARACION`   | Vendedor preparando el pedido                  |
| `LISTO_ENTREGA`    | Pedido listo para entrega, esperando QR        |
| `ENTREGADO`        | QR escaneado, escrow liberado al vendedor      |
| `CANCELADO`        | Orden cancelada antes de la entrega            |
| `REEMBOLSADO`      | Pago reembolsado al comprador                  |

#### CategoríaNotificación

| Valor      | Descripción                           |
|------------|---------------------------------------|
| `ORDEN`    | Eventos de pedidos                    |
| `PAGO`     | Confirmaciones y reembolsos de pagos  |
| `QR`       | Validación de entrega por QR          |
| `INSIGNIA` | Aprobación/rechazo de badges          |
| `SISTEMA`  | Mensajes administrativos y broadcasts |

---

## 15. Códigos de Error Estándar

| Código HTTP | Significado                  | Causas comunes en AgroFlex                               |
|-------------|------------------------------|----------------------------------------------------------|
| `200`       | OK                           | Operación exitosa                                        |
| `201`       | Created                      | Recurso creado (usuario, orden, producto, notificación)  |
| `204`       | No Content                   | Eliminación o actualización sin respuesta de body        |
| `400`       | Bad Request                  | Validación fallida, campos inválidos, token QR mal formado |
| `401`       | Unauthorized                 | JWT ausente, expirado o inválido                         |
| `403`       | Forbidden                    | Rol insuficiente, o recurso no pertenece al usuario      |
| `404`       | Not Found                    | Lote, orden, usuario o QR no encontrado                  |
| `409`       | Conflict                     | Correo ya registrado, stock insuficiente                 |
| `422`       | Unprocessable Entity         | Código de verificación incorrecto/expirado, token de reset inválido |
| `500`       | Internal Server Error        | Error inesperado del servidor                            |
| `503`       | Service Unavailable          | Firebase Admin SDK no configurado, Stripe no disponible  |

---

## 16. Notas Adicionales

### Rate Limiting

El API Gateway no tiene rate limiting configurado en la versión actual de desarrollo. Para producción se recomienda configurar `spring-cloud-gateway-mvc` con `RequestRateLimiter` usando Redis, o añadir un reverse proxy (Nginx/Traefik) con límites por IP:

```yaml
# Configuración recomendada para producción en gateway application.yml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 20
      redis-rate-limiter.burstCapacity: 40
      key-resolver: "#{@userKeyResolver}"
```

### Versionado de API

La API actual usa el prefijo `/api/` sin versión explícita. Para futuras versiones breaking se recomienda adoptar:

```
/api/v1/auth/login  →  versión actual (renombrar)
/api/v2/auth/login  →  futura versión
```

### CORS

El Gateway tiene CORS configurado para permitir el origen `http://localhost:5173` (frontend Vite en desarrollo). En producción debe actualizarse a la URL del dominio del frontend.

### Imágenes — Cloudinary CDN

Las URLs de imágenes siguen el patrón:
```
https://res.cloudinary.com/do5jln6yw/image/upload/{transformaciones}/v{version}/{folder}/{archivo}
```

Las imágenes de perfil se suben a Firebase Storage bajo:
```
productos/{idUsuario}/{timestamp}_{nombre-archivo}
```

### Paginación — Formato Estándar Spring Data

Todos los endpoints paginados devuelven el formato estándar `Page<T>` de Spring Data:

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "orders": [{"property": "createdAt", "direction": "DESC"}] }
  },
  "totalElements": 423,
  "totalPages": 22,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

### Integración Firebase Storage — Flujo Completo

```
1. Usuario autenticado en Spring Boot (tiene accessToken JWT)
2. Frontend llama POST /api/auth/firebase-token
3. Backend devuelve { firebaseToken: "..." }
4. Frontend llama signInWithCustomToken(auth, firebaseToken)
5. Firebase Auth queda activo → request.auth.uid == String(idUsuario)
6. Frontend puede subir archivos a: productos/{idUsuario}/imagen.jpg
7. La URL resultante de Cloudinary se guarda en el producto via POST /api/productos
```

### Microservicios con Implementación Pendiente

Los siguientes módulos tienen controladores y estructura base pero su lógica de negocio está parcialmente implementada o marcada como `// TODO`:

| Microservicio              | Estado        | Nota                                                        |
|----------------------------|---------------|-------------------------------------------------------------|
| `agroflex-suministros`     | ⚠️ Stub       | `SuministroController.java` solo tiene `// TODO: implement` |
| `agroflex-admin/actividad` | ⚠️ Parcial    | `GET /api/admin/dashboard/actividad-reciente` retorna `[]` |
| `agroflex-ml-service`      | ⚠️ En desarrollo | Python FastAPI — endpoints de predicción de precios y recomendaciones |
| `agroflex-config-server`   | ✅ Funcional  | Solo usa archivo `application.yml`, sin repositorio remoto  |

---

*Documentación generada a partir del análisis del código fuente de AgroFlex SOA v1.0.0 — Noviembre 2024.*
