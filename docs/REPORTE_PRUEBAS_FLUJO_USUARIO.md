# 📋 REPORTE DE PRUEBAS - FLUJO COMPLETO DEL USUARIO
## AgroFlex — Plan de Validación Integral

**Fecha:** 18 de marzo de 2026  
**Estado de cobertura:** ~38% del sistema funcional  
**Objetivo:** Validar flujos de usuario de punta a punta y casos de error críticos

---

## 🎯 RESUMEN EJECUTIVO

Este reporte define todos los **escenarios de prueba** que debe ejecutar un usuario (manual o automático) para validar que el sistema **AgroFlex** funciona correctamente desde el inicio de sesión hasta la entrega de un producto.

### Fases de Prueba:
| Fase | Módulos | Status | Complejidad |
|------|---------|--------|-------------|
| **Fase 1: Autenticación** | Login/Registro/JWT | ✅ LISTO | 🟢 Baja |
| **Fase 2: Exploración de catálogo** | Búsqueda/Filtros/Detalle | ✅ LISTO | 🟢 Baja |
| **Fase 3: Publicar productos** | Crear cosecha/suministro | ✅ LISTO | 🟡 Media |
| **Fase 4: Crear órdenes** | Pedidos + carrito | 🔴 PENDIENTE | 🟡 Media |
| **Fase 5: Pagos Escrow** | Stripe + validación GPS | 🔴 PENDIENTE | 🔴 Alta |
| **Fase 6: Validación QR** | Escaneo + liberación pago | 🔴 PENDIENTE | 🔴 Alta |
| **Fase 7: Notificaciones** | SMS/Email de eventos | 🔴 PENDIENTE | 🟡 Media |
| **Fase 8: Reputación** | Reseñas + puntuación | 🔴 PENDIENTE | 🟡 Media |

---

## FASE 1️⃣: AUTENTICACIÓN Y REGISTRO

### Objetivo:
Validar que un usuario nuevo puede registrarse y que un usuario existente puede iniciar sesión correctamente.

---

### TC-1.1: Registro de usuario (Happy Path)

**Precondiciones:**  
- Frontend accesible en `http://localhost:5173`  
- Backend `auth-service` corriendo en puerto `8081`
- Base de datos MySQL en línea

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Abrir página de registro | Navegar a `/register` | Formulario mostrado |
| 2 | Llenar formulario | Ingresar nombre, apellido, correo, teléfono, contraseña | Campos validados (sin espacios vacíos) |
| 3 | Seleccionar rol | Elegir entre: Productor, Comprador, Proveedor | Rol seleccionado |
| 4 | Aceptar términos | Marcar checkbox de aceptación | Checkbox visible ✓ |
| 5 | Enviar formulario | Clic en botón "Registrarse" | Petición POST `/api/auth/register` realizada |
| 6 | Validar respuesta | Esperar respuesta del servidor | Status `201 Created` |
| 7 | Base de datos | Consultar tabla `Usuarios` | Nuevo registro insertado con `activo=1, validado=0` |
| 8 | Token JWT | Respuesta contiene `access_token` | JWT decodificable, contiene `sub`, `role` claims |
| 9 | Redireccionamiento | Sistema redirige a `/` o `/dashboard` | Usuario logueado automáticamente |

**Validaciones de frontend:**

```javascript
// ✓ Campo email validado
expect(formulario.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// ✓ Contraseña mínimo 8 caracteres
expect(password.length).toBeGreaterThanOrEqual(8);

// ✓ Teléfono solo números (opcional)
expect(telefono).toMatch(/^[\d\s\-\+\(\)]*$/);

// ✓ Rol asignado
expect(usuario.rol).toBeOneOf(['PRODUCTOR', 'COMPRADOR', 'PROVEEDOR']);
```

**Validaciones de backend (Java):**

```java
// ✓ Email único en DB
SELECT COUNT(*) FROM Usuarios WHERE correo = ?; // Debe ser 0

// ✓ Contraseña hasheada con BCrypt
usuario.getPasswordHash().startsWith("$2a$"); // BCrypt format

// ✓ Rol asignado correctamente en tabla Usuarios_Roles
SELECT * FROM Usuarios_Roles WHERE id_usuario = ? 
AND id_rol = (SELECT id_rol FROM Roles WHERE nombre_rol = ?);
```

**Criterio de éxito:**
- ✅ Usuario aparece en BD con estado `activo=1`
- ✅ JWT válido retornado con rol correcto
- ✅ Usuario redirigido al dashboard

---

### TC-1.2: Registro con email duplicado (Error)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Mismo email | Intentar registrar con email existente | Petición POST `/api/auth/register` |
| 2 | Validar respuesta | Esperar respuesta | Status `409 Conflict` |
| 3 | Mensaje error | Respuesta JSON | `{"error": "Email ya registrado"}` |
| 4 | BD inalterada | Verificar BD | Cantidad de registros NO cambia |
| 5 | UI feedback | Mostrar error al usuario | Toast/Alerta visible |

**Criterio de éxito:**
- ✅ Respuesta HTTP 409
- ✅ No se inserta duplicado en BD
- ✅ Mensaje de error claro al usuario

---

### TC-1.3: Login con credenciales válidas (Happy Path)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Ir a login | Navegar a `/login` | Formulario mostrado |
| 2 | Ingresar email | Campo email | Ingresado correctamente |
| 3 | Ingresar contraseña | Campo password | Se oculta (type=password) |
| 4 | Enviar | Clic en "Iniciar Sesión" | POST `/api/auth/login` |
| 5 | Validación servidor | Buscar usuario en BD | Usuario existe y contraseña coincide |
| 6 | Generar JWT | Crear token con claims | `{sub, role, iat, exp}` |
| 7 | Respuesta | Status 200 OK | `{"access_token": "eyJ...", "user": {...}}` |
| 8 | Guardar token | LocalStorage o cookies | Token accesible para requests posteriores |
| 9 | Redirigir | Navegar al dashboard | Rol + estado de usuario determinados |

**Validaciones:**

```javascript
// ✓ Token guardado
expect(localStorage.getItem('access_token')).toBeTruthy();

// ✓ Token válido (decodificar)
const decoded = jwt_decode(token);
expect(decoded.exp * 1000).toBeGreaterThan(Date.now());

// ✓ User context actualizado
expect(useAuth().user).toEqual(expect.objectContaining({
  id_usuario: expect.any(Number),
  nombre: expect.any(String),
  rol: expect.any(String)
}));
```

**Criterio de éxito:**
- ✅ JWT generado correctamente
- ✅ Token contiene rol en claims
- ✅ Usuario redirigido a dashboard apropiado por rol

---

### TC-1.4: Login con contraseña incorrecta (Error)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Email correcto | Ingresar email válido | Campo rellenado |
| 2 | Contraseña falsa | Ingresar contraseña incorrecta | POST `/api/auth/login` |
| 3 | Validación | Comparar hash en BD | NO coincide |
| 4 | Respuesta | Status 401 Unauthorized | `{"error": "Credenciales inválidas"}` |
| 5 | Token NO generado | Respuesta sin JWT | `access_token` ausente |
| 6 | Mensaje usuario | Mostrar alerta | "Email o contraseña incorrectos" |

**Criterio de éxito:**
- ✅ HTTP 401
- ✅ No se genera JWT
- ✅ LocalStorage.access_token vacío

---

### TC-1.5: JWT Expirado - Refresh Token

**Escenario:** Usuario tiene un JWT expirado, debe poder obtener uno nuevo sin re-loguearse.

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Token expirado | Realizar request con JWT vencido | Interceptor REST lo detecta (status 401) |
| 2 | Enviar refresh | Automático: POST `/api/auth/refresh` | Incluye refresh_token |
| 3 | Servidor genera nuevo JWT | Si refresh_token válido | Nuevo token retornado |
| 4 | Guardar nuevo token | Actualizar localStorage | Token actualizado |
| 5 | Reintentar petición original | Request se reintenta automáticamente | Status 200 |

**Criterio de éxito:**
- ✅ Refresh automático sin intervención usuario
- ✅ JWT nuevo válido
- ✅ Request original se reintenta exitosamente

---

## FASE 2️⃣: EXPLORACIÓN DE CATÁLOGO

### Objetivo:
Validar que los usuarios pueden navegar, filtrar y ver detalles de productos disponibles.

---

### TC-2.1: Ver catálogo público (sin login) - Happy Path

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Acceso sin login | Navegar a `/catalogo` SIN JWT | Página accesible |
| 2 | Cargar productos | GET `/api/catalogo/productos?page=0&size=12` | Status 200 |
| 3 | Mostrar grid | Renderizar tarjetas de productos | 12 productos máximo por página |
| 4 | Información visible | Cada tarjeta muestra: imagen, nombre, precio | Datos completos |
| 5 | Paginación | Botones anterior/siguiente | "Página 1 de X" visible |
| 6 | Total de registros | Footer muestra total | "Mostrando 12 de 450 productos" |

**Validaciones de BD:**

```sql
-- ✓ Productos publicados aparecen
SELECT * FROM CosechaLote 
WHERE estado = 'PUBLICADO' 
ORDER BY created_at DESC 
LIMIT 12;

-- ✓ Imágenes cargadas
SELECT id_cosecha, imagen_url FROM ImagenGaleria 
WHERE id_cosecha IN (...)
```

**Criterio de éxito:**
- ✅ Catálogo carga sin JWT
- ✅ Mínimo 3 productos mostrados
- ✅ Paginación funciona

---

### TC-2.2: Filtrar por tipo de producto (Cosecha vs Suministro)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Abrir filtros | Clic en "Filtros" | Panel lateral abierto |
| 2 | Seleccionar categoría | Elegir "Cosechas" | Filtro aplicado |
| 3 | Recargar | GET `/api/catalogo/productos?tipo=COSECHA` | Solo cosechas mostradas |
| 4 | Verificar BD | Consultar tabla | Solo registros con tipo COSECHA |
| 5 | Cambiar filtro | Seleccionar "Suministros" | GET con `tipo=SUMINISTRO` |
| 6 | Resultados | Mostrar solo suministros | Diferentes productos |

**Criterio de éxito:**
- ✅ Filtro persiste en URL
- ✅ Cantidad de resultados cambia según filtro
- ✅ Sin productos = mensaje "Sin resultados"

---

### TC-2.3: Búsqueda por palabra clave

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Barra de búsqueda | Hacer foco en input | Placeholder visible |
| 2 | Escribir texto | Ejemplo: "tomate" | Debounce 300ms esperado |
| 3 | Request | GET `/api/catalogo/buscar?q=tomate` | Status 200 |
| 4 | Resultados | Mostrar productos coincidentes | Coincidencia en nombre/descripción |
| 5 | Resaltado (opcional) | Palabra buscada resaltada | CSS highlight aplicado |

**Validaciones de BD - Full Text Search:**

```sql
-- ✓ Búsqueda semántica (si OpenAI activado)
-- Productos con embedding similar a "tomate"

-- ✓ Búsqueda básica (LIKE)
SELECT * FROM CosechaLote 
WHERE nombre LIKE '%tomate%' 
OR descripcion LIKE '%tomate%'
```

**Criterio de éxito:**
- ✅ Resultados relevantes
- ✅ Sin lag en búsqueda (debounce)
- ✅ Búsqueda vacía muestra todos

---

### TC-2.4: Ver detalle de producto

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Clic en tarjeta | Seleccionar un producto | Navegar a `/producto/:id` |
| 2 | Cargar detalle | GET `/api/catalogo/productos/{id}` | Status 200 |
| 3 | Información completa | Mostrar: nombre, precio, descripción, ubicación, vendedor | Todos los datos |
| 4 | Galería de imágenes | Mostrar todas las imágenes | Slider con miniaturitas |
| 5 | Vendedor | Link a perfil del vendedor | Nombre, calificación, reseñas |
| 6 | Ubicación | Mostrar en mapa (geolocalización) | Coordenadas precisas |
| 7 | Botón comprar | Si usuario logueado | "Agregar al carrito" visible |
| 8 | Si no logueado | Sin token | "Inicia sesión para comprar" |

**Validaciones:**

```javascript
// ✓ Datos del producto cargados
expect(producto).toEqual(expect.objectContaining({
  id_cosecha: expect.any(Number),
  nombre: expect.any(String),
  precio_unitario: expect.any(Number),
  cantidad_disponible: expect.greaterThan(0)
}));

// ✓ Vendedor existe y tiene reputación
expect(vendedor.puntuacion_rep).toBeGreaterThanOrEqual(0);
expect(vendedor.puntuacion_rep).toBeLessThanOrEqual(5);
```

**Criterio de éxito:**
- ✅ Detalle carga correctamente
- ✅ Imágenes cargan desde Firebase
- ✅ Mapa muestra ubicación exacta

---

### TC-2.5: Filtrar por ubicación (geolocalización)

**Precondiciones:**
- Usuario permitió acceso a GPS (o simular coordenadas)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Solicitar permiso GPS | Usuario abre filtros | Dialog de permiso |
| 2 | Aceptar | Clic en "Permitir ubicación" | Coordenadas obtenidas |
| 3 | Mostrar cercanos | GET `/api/catalogo/cercanos?lat=20.5&lng=-87.3&radio=50km` | Productos en radio de 50km |
| 4 | Filtrar distancia | Usuario ajusta slider 10-100km | Results se actualizan |
| 5 | Validar cálculo Haversine | Verificar distancia matemática | Radio correcto (±500m tolerancia) |

**Validaciones de BD - Harv ersine:**

```sql
-- ✓ Cálculo de distancia correcta
SELECT id_cosecha, 
  (6371 * ACOS(COS(RADIANS(20.5)) * COS(RADIANS(latitud)) 
  * COS(RADIANS(longitud) - RADIANS(-87.3)) 
  + SIN(RADIANS(20.5)) * SIN(RADIANS(latitud)))) AS distancia_km
FROM CosechaLote
HAVING distancia_km <= 50
ORDER BY distancia_km;
```

**Criterio de éxito:**
- ✅ Geolocalización obtenida
- ✅ Cálculo Haversine preciso
- ✅ Solo productos en radio mostrados

---

## FASE 3️⃣: PUBLICAR PRODUCTOS

### Objetivo:
Validar que productores/proveedores pueden publicar cosechas/suministros.

---

### TC-3.1: Productor publica cosecha (Happy Path)

**Precondiciones:**
- Usuario logueado con rol PRODUCTOR
- Bearer Token en Authorization header
- Insignia de vendedor APROBADA (validado=1)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Navegar | Ir a `/dashboard/productor` | Dashboard productor visible |
| 2 | Botón publicar | Clic en "Publicar cosecha" | Modal/página de formulario |
| 3 | Llenar datos | Ingresar nombre, descripción, precio | Campos rellenados |
| 4 | Seleccionar cultivo | Elegir tipo (Tomate, Maíz, etc) | Dropdown funciona |
| 5 | Cantidad | Ingresar cantidad disponible | Campo numérico validado |
| 6 | Ubicación | Usar GPS automático o manual | Coordenadas capturadas |
| 7 | Subir imágenes | Seleccionar 3+ imágenes | Upload a Firebase Storage |
| 8 | Validación frontend | Verificar: imagen < 5MB, formato PNG/JPG | Feedback al usuario |
| 9 | Enviar | Clic en "Publicar" | POST `/api/catalogo/cosechas` + Bearer token |
| 10 | Validación servidor | Backend valida datos e insignia | Insignia verificada (validado=1) |
| 11 | Insertar BD | INSERT en CosechaLote | estado = 'PUBLICADO' |
| 12 | Imágenes | Guardar URLs en tabla ImagenGaleria | URLs de Firebase |
| 13 | Respuesta | Status 201 Created | `{"id_cosecha": 123, "estado": "PUBLICADO"}` |
| 14 | Aparece en catálogo | Refrescar catálogo | Nueva cosecha visible |

**Validaciones de BD:**

```sql
-- ✓ Cosecha creada
SELECT * FROM CosechaLote 
WHERE id_usuario = ? 
ORDER BY created_at DESC LIMIT 1;

-- ✓ Imágenes vinculadas
SELECT * FROM ImagenGaleria 
WHERE id_cosecha = ?;

-- ✓ Ubicación guardada
SELECT latitud, longitud FROM CosechaLote 
WHERE id_cosecha = ?;

-- ✓ Estado es PUBLICADO
SELECT estado FROM CosechaLote 
WHERE id_cosecha = ?;
```

**Criterio de éxito:**
- ✅ Cosecha aparece en BD con estado PUBLICADO
- ✅ Imágenes cargadas a Firebase Storage
- ✅ Producto visible en catálogo inmediatamente
- ✅ Ubicación GPS correcta

---

### TC-3.2: Publicar sin insignia aprobada (Error)

**Escenario:** Usuario sin insignia verificada intenta publicar cosecha.

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Verificar estado | Consultar `InsigniaVendedor.validado` | validado=0 (pendiente) |
| 2 | Intentar publicar | POST `/api/catalogo/cosechas` | Status 403 Forbidden |
| 3 | Respuesta | Error JSON | `{"error": "Insignia de vendedor no verificada"}` |
| 4 | BD inalterada | No se inserta cosecha | COUNT(*) sin cambio |
| 5 | Mensaje al usuario | Toast/alerta | "Debes verificar tu insignia antes de publicar" |

**Criterio de éxito:**
- ✅ HTTP 403
- ✅ No se inserta en BD
- ✅ Mensaje claro

---

### TC-3.3: Subir imagen inválida (Error)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Seleccionar archivo | Elegir archivo > 5MB | Frontend valida |
| 2 | Feedback | Mostrar error | "Archivo muy grande (máx 5MB)" |
| 3 | Archivo incorrecto | Elegir archivo .pdf o .txt | Frontend valida tipo |
| 4 | Feedback | Mostrar error | "Solo soportamos PNG, JPG, JPEG" |
| 5 | Si pasa frontend | Foto válida pero corrupted | Upload a Firebase falla |
| 6 | Error backend | Status 400 | `{"error": "Imagen corrupta o inválida"}` |

**Criterio de éxito:**
- ✅ Validación frontend previene uploads inválidos
- ✅ Backend rechaza formatos inválidos
- ✅ Mensajes descriptivos

---

## FASE 4️⃣: CREAR ÓRDENES/PEDIDOS

### Objetivo:
Validar que compradores pueden crear pedidos y el sistema gestiona el flujo correctamente.

⚠️ **ESTADO:** Backend pendiente (orders-service stub)

---

### TC-4.1: Agregar producto al carrito (Happy Path)

**Precondiciones:**
- Usuario logueado con rol COMPRADOR
- Visitando detalle de producto

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Ver detalle | Producto mostrado (TC-2.4) | Datos del producto |
| 2 | Ingresar cantidad | Campo numérico | Cantidad > 0 |
| 3 | Clic "Agregar al carrito" | Botón visible | Carrito se actualiza |
| 4 | Notification | Toast de éxito | "Agregado al carrito" |
| 5 | Badge carrito | Ícono mostrar cantidad | Counter incrementado |
| 6 | Carrito actualizado | Verificar CartContext/Zustand | Producto en estado |

**Validaciones Frontend:**

```javascript
// ✓ Carrito actualizado
expect(useCart().items).toContainEqual(expect.objectContaining({
  id_cosecha: 123,
  cantidad: expect.any(Number),
  precio_unitario: expect.any(Number)
}));

// ✓ Subtotal calculado
expect(useCart().subtotal).toBe(precio * cantidad);
```

**Criterio de éxito:**
- ✅ Producto en carrito state
- ✅ Cantidad correcta
- ✅ Subtotal calculado

---

### TC-4.2: Ver carrito y checkout

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Abrir carrito | Clic en ícono de carrito | `/carrito` página |
| 2 | Listar productos | Mostrar tabla con items | Nombre, cantidad, precio |
| 3 | Editar cantidad | Cambiar cantidad de un producto | Subtotal recalculado |
| 4 | Eliminar item | Clic en X | Producto removido |
| 5 | Total | Mostrar suma | subtotal + impuesto (si aplica) |
| 6 | Proceder | Botón "Ir a pago" | Redirige a `/pago` |

**Criterio de éxito:**
- ✅ Operaciones CRUD en carrito
- ✅ Cálculos correctos
- ✅ Navegación a pago

---

### TC-4.3: Crear orden desde carrito

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | En página pago | Usuario listo para pagar | `/pago` accesible |
| 2 | Seleccionar dirección | Elegir dirección de entrega | Dirección seleccionada |
| 3 | Crear orden | Clic "Confirmar orden" | POST `/api/pedidos` |
| 4 | Backend procesa | Crear `OrdenTransaccion` | estado = 'PENDIENTE_PAGO' |
| 5 | BD | Insertar en tabla | id_orden generado |
| 6 | Respuesta | Status 201 | `{"id_orden": 456, "estado": "PENDIENTE_PAGO"}` |
| 7 | Redirigir | Usuario redirigido | `/pago/orden/{id_orden}` |

**Validaciones BD:**

```sql
-- ✓ Orden creada
SELECT * FROM OrdenTransaccion 
WHERE id_orden = 456;

-- ✓ Estado correcto
SELECT estado FROM OrdenTransaccion 
WHERE id_orden = 456; -- PENDIENTE_PAGO

-- ✓ Líneas de orden
SELECT * FROM DetalleOrden 
WHERE id_orden = 456;
```

**Criterio de éxito:**
- ✅ Orden insertada con estado PENDIENTE_PAGO
- ✅ Líneas de detalle creadas
- ✅ Carrito limpiado

---

## FASE 5️⃣: PAGOS CON ESCROW

### Objetivo:
Validar que el sistema maneja pagos de forma segura con retención (escrow).

⚠️ **ESTADO:** Backend pendiente (payments-service stub)

---

### TC-5.1: Procesar pago con Stripe (Happy Path)

**Precondiciones:**
- Orden creada con estado PENDIENTE_PAGO
- Stripe API key configurada
- Usar tarjeta de prueba Stripe: `4242 4242 4242 4242`

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Página pago | Usuario ve resumen de orden | Total: $X.XX |
| 2 | Ingresar tarjeta | Card holder, número, CCV | Datos ingresados |
| 3 | Clic "Pagar" | Enviar POST `/api/pagos/procesar` | Petición enviada |
| 4 | Stripe API | Backend contacta Stripe | `Stripe::PaymentIntent::create()` |
| 5 | Procesar | Stripe procesa tarjeta | status: 'succeeded' |
| 6 | Respuesta exitosa | Status 200 | `{"id_pago": "pi_123...", "status": "COMPLETADO"}` |
| 7 | Actualizar orden | Estado cambia | PENDIENTE_PAGO → PAGO_RETENIDO |
| 8 | Guardar transacción | INSERT en tabla OrdenTransaccion | payment_status='ESCROW_RETENIDO' |
| 9 | Generar QR | Crear código QR | GET `/api/qr/generar?id_orden=456` |
| 10 | Notificar vendedor | Email/SMS | "Nuevo pedido recibido" |

**Validaciones BD:**

```sql
-- ✓ Pago registrado
SELECT * FROM Pagos 
WHERE id_orden = 456;

-- ✓ Total concuerda
SELECT monto_total FROM Pagos 
WHERE id_orden = 456; -- Debe ser = cantidad * precio

-- ✓ Dinero retenido (escrow)
SELECT estado_escrow FROM Pagos 
WHERE id_orden = 456; -- RETENIDO

-- ✓ Estado orden actualizado
SELECT estado FROM OrdenTransaccion 
WHERE id_orden = 456; -- PAGO_RETENIDO
```

**Validaciones de Stripe:**

```bash
# Verificar en estado de Stripe que PaymentIntent fue creado
curl https://api.stripe.com/v1/payment_intents/pi_123... \
  -H "Authorization: Bearer sk_test_..."
# Debe retornar: status="succeeded", amount=XXXXX
```

**Criterio de éxito:**
- ✅ PaymentIntent creado en Stripe
- ✅ Pago completado (status: 'succeeded')
- ✅ Orden actualizada a PAGO_RETENIDO
- ✅ Dinero retenido, NO transferido aún
- ✅ QR generado
- ✅ Vendedor notificado

---

### TC-5.2: Pago rechazado por tarjeta inválida (Error)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Ingresar tarjeta | Usar número inválido: `4000 0000 0000 0002` | Números ingresados |
| 2 | Enviar pago | POST `/api/pagos/procesar` | Petición a Stripe |
| 3 | Stripe rechaza | Validación de tarjeta falla | status: 'card_error' |
| 4 | Error retornado | Status 402 Payment Required | `{"error": "Tarjeta rechazada", "code": "card_declined"}` |
| 5 | BD inalterada | Orden NO se marca como pagada | estado sigue siendo PENDIENTE_PAGO |
| 6 | Mensaje usuario | Mostrar error | "Tarjeta rechazada. Intenta otra." |
| 7 | Reintentar | Usuario puede intentar de nuevo | Botón "Reintentar" habilitado |

**Criterio de éxito:**
- ✅ Status 402
- ✅ Orden NO actualizada
- ✅ PaymentIntent marcado como failed en Stripe
- ✅ Dinero NO retenido

---

### TC-5.3: Validar comisión de AgroFlex (3.5%)

**Escenario:** Sistema debe retener comisión por transacción.

**Ejemplo:** Orden de $100
- Monto bruto: $100
- Comisión AgroFlex: $3.50
- Monto neto a productor: $96.50

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Pago procesado | Orden pagada $100 | Status PAGO_RETENIDO |
| 2 | BD | Consultar tabla Pagos | monto_total=$100, comision=$3.50, monto_neto=$96.50 |
| 3 | Liquidación | Cuando se libere pago | Productor recibe $96.50 |

**SQL Validación:**

```sql
SELECT 
  id_pago,
  monto_total,
  (monto_total * 0.035) AS comision_calculada,
  comision,
  (monto_total - comision) AS monto_neto
FROM Pagos
WHERE id_orden = 456;

-- Validar: comision = monto_total * 0.035
```

**Criterio de éxito:**
- ✅ Comisión calculada correctamente (3.5%)
- ✅ Monto neto = total - comisión
- ✅ Guardado en BD

---

## FASE 6️⃣: VALIDACIÓN CON QR + GPS

### Objetivo:
Validar que el comprador puede escanear QR en la entrega y el pago se libera si GPS es válido.

⚠️ **ESTADO:** Backend pendiente (qr-service stub)

---

### TC-6.1: Productor genera QR (Happy Path)

**Precondiciones:**
- Orden en estado PAGO_RETENIDO
- Productor logueado
- Producto listo para envío

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Dashboard | Ir a "Mis órdenes" | `/mis-ordenes` |
| 2 | Orden pagada | Seleccionar orden con estado PAGO_RETENIDO | Orden mostrada |
| 3 | Botón QR | Clic en "Generar código QR" | GET `/api/qr/generar?id_orden=456` |
| 4 | Generar | Backend genera QR con HMAC-SHA256 | QR contiene token único |
| 5 | BD | INSERT en tabla SeguridadQR | estado='GENERADO', expires_at=NOW+48h |
| 6 | Imagen QR | Mostrar código QR | PNG mostrado en pantalla |
| 7 | Detalles QR | Mostrar: token, vigencia, intentos restantes | "Válido por 48 horas. 3 intentos." |
| 8 | Imprimir | Usuario imprime QR | O guarda como imagen |

**Validaciones BD:**

```sql
-- ✓ QR creado
SELECT * FROM SeguridadQR 
WHERE id_orden = 456;

-- ✓ Token único y aleatorio
SELECT token FROM SeguridadQR 
WHERE id_orden = 456; -- Debe ser string aleatorio de 32+ chars

-- ✓ Vigencia correcta
SELECT TIMESTAMPDIFF(HOUR, NOW(), expires_at) AS horas_restantes
FROM SeguridadQR 
WHERE id_orden = 456; -- Debe ser ~ 48 horas

-- ✓ Estado
SELECT estado FROM SeguridadQR 
WHERE id_orden = 456; -- GENERADO
```

**Validaciones de token:**

```java
// Backend debe usar HMAC-SHA256 para token
String token = HmacUtils.hmacSha256Hex(
  "secret_key_del_servidor",
  id_orden + timestamp
);
// Token debe ser: aleatorio, único, no predecible
assertTrue(token.length() >= 32);
assertTrue(isValidUTF8AndHex(token));
```

**Criterio de éxito:**
- ✅ QR generado correctamente
- ✅ Token único y seguro
- ✅ Vigencia de 48 horas
- ✅ Estado GENERADO
- ✅ QR imprimible

---

### TC-6.2: Comprador escanea QR en ubicación válida (Happy Path)

**Precondiciones:**
- QR generado hace poco
- Comprador en el punto de entrega (o simular por GPS mock)
- Geoposición dentro de 500 metros del punto de venta

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Ir a escanear | Navegar a `/escanear-qr` | Cámara inicializada |
| 2 | Permiso cámara | Aceptar acceso a cámara | Flujo de video |
| 3 | Escanear QR | Apuntar a código QR | ZXing detecta QR |
| 4 | Extrae token | String token leído | Token decodificado |
| 5 | Validar token | POST `/api/qr/validar` | {token, id_orden, lat, lng} |
| 6 | Verificar ubicación | Calcular distancia Haversine | Distancia ≤ 500 metros |
| 7 | Validar token | Verificar HMAC | Firma coincide |
| 8 | Validar vigencia | Esperar < 48 horas | expires_at > NOW |
| 9 | Validar intentos | QR tiene intentos restantes | intentos_fallidos < 3 |
| 10 | Todo OK | Status 200 | `{"valid": true, "orden_id": 456}` |
| 11 | Actualizar BD | Marcar como ESCANEADO | estado='ESCANEADO' |
| 12 | Liberar dinero | Transferir a cuenta vendedor | Escrow liberado |
| 13 | Notificar | Email al productor | "Pago liberado - $96.50" |
| 14 | Confirmación UI | Mostrar al comprador | "✓ Entrega validada exitosamente" |

**Validaciones BD:**

```sql
-- ✓ QR actualizado a ESCANEADO
SELECT estado FROM SeguridadQR 
WHERE id_orden = 456; -- ESCANEADO

-- ✓ Registro de escaneo
SELECT * FROM Validacion_QR
WHERE id_seguridad_qr = ?; -- lat, lng, timestamp, resultado

-- ✓ Orden actualizada
SELECT estado FROM OrdenTransaccion 
WHERE id_orden = 456; -- VALIDADO_ENTREGA

-- ✓ Pago liberado
SELECT estado_escrow FROM Pagos 
WHERE id_orden = 456; -- LIBERADO

-- ✓ Transferencia ejecutada (si hay tabla de transferencias)
SELECT * FROM Transferencias_Pagos
WHERE id_pago = ?; -- En estado COMPLETADO
```

**Validaciones de GPS (Haversine):**

```javascript
// Calcular distancia entre dos puntos
const R = 6371; // Radio Tierra en km
const lat1 = toRad(lat_productor);
const lat2 = toRad(lat_comprador);
const lon1 = toRad(long_productor);
const lon2 = toRad(long_comprador);

const a = Math.sin((lat2-lat1)/2) * Math.sin((lat2-lat1)/2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin((lon2-lon1)/2) * Math.sin((lon2-lon1)/2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
const distancia = R * c;

// Validar: distancia <= 0.5 km (500 metros)
assertTrue(distancia <= 0.5);
```

**Criterio de éxito:**
- ✅ QR decodificado correctamente
- ✅ HMAC válido
- ✅ Ubicación dentro de 500 metros
- ✅ Status 200
- ✅ Orden actualizada a VALIDADO_ENTREGA
- ✅ Pago liberado en Stripe
- ✅ Productor notificado

---

### TC-6.3: Escanear QR pero GPS fuera de rango (Error)

**Escenario:** Comprador intenta escanear QR desde ubicación lejana (>500m).

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | QR validado | Token correcto | Token verificado |
| 2 | GPS lejano | Comprador está a 1km de punto entrega | lat/lng calculados |
| 3 | Validar | Cálculo Haversine | Distancia > 500 metros |
| 4 | Rechazar | Status 400 Bad Request | `{"valid": false, "error": "Ubicación fuera de rango"}` |
| 5 | BD | Registrar intento fallido | SeguridadQR.intentos_fallidos += 1 |
| 6 | Contar intentos | 3 intentos fallidos? | Si: QR marcado como INVALIDO |
| 7 | UI | Mostrar error al comprador | "Debes estar a menos de 500m del punto de entrega" |
| 8 | Orden | Estado NO cambia | Sigue en PAGO_RETENIDO |
| 9 | Pago | NO se libera | Dinero sigue retenido |

**SQL:**

```sql
-- ✓ Intento fallido registrado
UPDATE SeguridadQR 
SET intentos_fallidos = intentos_fallidos + 1
WHERE id_orden = 456;

-- ✓ Si 3 intentos, marcar INVALIDO
UPDATE SeguridadQR 
SET estado = 'INVALIDO'
WHERE id_orden = 456 
AND intentos_fallidos >= 3;
```

**Criterio de éxito:**
- ✅ Status 400
- ✅ Intento registrado como fallido
- ✅ Pago NO liberado
- ✅ QR invalidado si 3+ intentos

---

### TC-6.4: QR expirado (>48 horas)

**Escenario:** Comprador intenta escanear QR 3 días después de generado.

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | QR viejo | Generado hace 72 horas | expires_at < NOW |
| 2 | Intenta escanear | POST `/api/qr/validar` | Token enviado |
| 3 | Validar vigencia | Verificar expires_at | Expirado |
| 4 | Rechazar | Status 400 | `{"valid": false, "error": "Código QR expirado"}` |
| 5 | Marcar | Actualizar estado | estado='EXPIRADO' |
| 6 | BD | QR no puede reusarse | Estado permanente EXPIRADO |

**Criterio de éxito:**
- ✅ Status 400
- ✅ QR revocado
- ✅ Productor puede generar nuevo QR

---

## FASE 7️⃣: NOTIFICACIONES

### Objetivo:
Validar que el sistema notifica a usuarios en eventos críticos.

⚠️ **ESTADO:** Backend pendiente (notifications-service)

---

### TC-7.1: Notificación al crear orden

**Escenario:** Cuando comprador crea orden, productor recibe SMS/Email.

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Orden creada | POST `/api/pedidos` exitoso | OrdenTransaccion insertada |
| 2 | Evento | Sistema publica evento `OrderCreatedEvent` | Kafka/RabbitMQ |
| 3 | Notifications-service | Consumer procesa evento | Email + SMS preparados |
| 4 | Twilio SMS | Envía SMS al productor | Número del productor |
| 5 | Contenido | Mensaje incluye datos | "Nuevo pedido #456: 50kg tomate - $100. Comprador: Juan" |
| 6 | Email | Envía email | address: productor@example.com |
| 7 | Template | Email formateado | HTML con logo AgroFlex |
| 8 | Registro | Guardar en tabla de notificaciones | Timestamp y estado 'ENVIADO' |

**Validaciones:**

```sql
-- ✓ Notificación registrada
SELECT * FROM Notificaciones
WHERE id_usuario = id_productor
AND tipo = 'ORDEN_CREADA'
AND created_at > NOW() - INTERVAL 1 MINUTE;

-- ✓ Estado
SELECT estado FROM Notificaciones 
WHERE id = ?; -- ENVIADO o PENDIENTE
```

**Criterio de éxito:**
- ✅ SMS enviado (validar con Twilio API)
- ✅ Email enviado y entregado
- ✅ Registro en BD
- ✅ Contenido correcto

---

### TC-7.2: Notificación de pago liberado

**Escenario:** Cuando QR se valida, productor recibe notificación que el dinero fue liberado.

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | QR validado | POST `/api/qr/validar` exitoso | Status 200 |
| 2 | Evento | Publicar `PaymentReleasedEvent` | Con monto_neto, id_orden |
| 3 | Notifications-service | Procesa evento | SMS + Email |
| 4 | Mensaje SMS | "Pago liberado: $96.50 de orden #456" | Recibido en teléfono |
| 5 | Email | Detalle de transferencia | HTML con detalles |
| 6 | Notificación BD | Registrar envío | timestamp, estado='ENVIADO' |

**Criterio de éxito:**
- ✅ SMS enviado inmediatamente
- ✅ Email enviado con detalles
- ✅ Monto correcto en mensaje

---

## FASE 8️⃣: REPUTACIÓN Y RESEÑAS

### Objetivo:
Validar que sistema registra reseñas y calcula reputación correctamente.

⚠️ **ESTADO:** Backend pendiente

---

### TC-8.1: Dejar reseña después de entrega (Happy Path)

**Precondiciones:**
- Orden completada (estado VALIDADO_ENTREGA)
- Mínimo 24 horas desde validación (opcional)

**Pasos:**

| # | Paso | Acción | Resultado Esperado |
|---|------|--------|-------------------|
| 1 | Ir a órdenes | `/mis-ordenes` | Órdenes listadas |
| 2 | Orden completada | Seleccionar orden validada | Estado VALIDADO_ENTREGA |
| 3 | Botón reseña | "Dejar reseña" visible | Modal abierto |
| 4 | Calificación | Seleccionar 1-5 estrellas | Input de rating |
| 5 | Comentario | Escribir texto | Máx 500 caracteres |
| 6 | Enviar | Clic "Publicar reseña" | POST `/api/resenas` |
| 7 | Validación | Backend valida orden completada | Usuario es comprador |
| 8 | Insertar | INSERT en tabla Resenas | reseña guardada |
| 9 | Actualizar reputación | Autocalcular promedio | Trigger MySQL |
| 10 | Respuesta | Status 201 | Reseña confirmada |
| 11 | Mostrar en perfil | Reseña visible en perfil del vendedor | Contribuye al promedio |

**SQL Validación:**

```sql
-- ✓ Reseña insertada
SELECT * FROM Resenas
WHERE id_orden = 456
AND id_usuario_comprador = ?;

-- ✓ Reputación actualizada (trigger)
SELECT puntuacion_rep, total_reseñas
FROM Usuarios
WHERE id_usuario = id_productor;
-- Debe ser: (suma_ratings) / COUNT(reseñas)
```

**Trigger SQL:**

```sql
DELIMITER $$
CREATE TRIGGER actualizar_reputacion_after_resena
AFTER INSERT ON Resenas
FOR EACH ROW
BEGIN
  UPDATE Usuarios
  SET puntuacion_rep = (
    SELECT AVG(calificacion) FROM Resenas 
    WHERE id_usuario_vendedor = NEW.id_usuario_vendedor
  ),
  total_reseñas = (
    SELECT COUNT(*) FROM Resenas
    WHERE id_usuario_vendedor = NEW.id_usuario_vendedor
  )
  WHERE id_usuario = NEW.id_usuario_vendedor;
END$$
DELIMITER ;
```

**Criterio de éxito:**
- ✅ Reseña insertada
- ✅ Reputación recalculada
- ✅ Promedio correcto (suma/total)
- ✅ Visible en perfil vendedor

---

### TC-8.2: Verificar cálculo de reputación promedio

**Escenario:** Productor tiene múltiples reseñas, promedio debe calcularse correctamente.

**Datos:**
- Reseña 1: 5 estrellas
- Reseña 2: 4 estrellas
- Reseña 3: 5 estrellas
- Resena 4: 3 estrellas
- **Promedio esperado:** (5+4+5+3) / 4 = 4.25

**Validación:**

```sql
SELECT 
  AVG(calificacion) AS promedio_calculado,
  COUNT(*) AS total_reseñas
FROM Resenas
WHERE id_usuario_vendedor = 123;

-- Esperado: 4.250000, 4

-- Comparar con reputación en tabla Usuarios
SELECT puntuacion_rep
FROM Usuarios
WHERE id_usuario = 123;
-- Debe ser: 4.25
```

**Criterio de éxito:**
- ✅ Promedio calculado correctamente
- ✅ Exactitud a 2 decimales
- ✅ Total de reseñas contadas

---

## MATRIZ DE COBERTURA DE PRUEBAS

| Fase | # Casos | Status | Prioridad |
|------|---------|--------|-----------|
| **1. Autenticación** | 5 | ✅ ACTIVA | 🔴 CRÍTICA |
| **2. Catálogo** | 5 | ✅ ACTIVA | 🔴 CRÍTICA |
| **3. Publicar** | 3 | ✅ ACTIVA | 🟠 ALTA |
| **4. Órdenes** | 3 | 🔴 PENDIENTE | 🟠 ALTA |
| **5. Pagos Escrow** | 3 | 🔴 PENDIENTE | 🔴 CRÍTICA |
| **6. QR + GPS** | 4 | 🔴 PENDIENTE | 🔴 CRÍTICA |
| **7. Notificaciones** | 2 | 🔴 PENDIENTE | 🟡 MEDIA |
| **8. Reputación** | 2 | 🔴 PENDIENTE | 🟡 MEDIA |
| **TOTAL** | **27 casos** | **10 activos** | - |

---

## 🛠️ HERRAMIENTAS Y AMBIENTES DE PRUEBA

### Backend Testing (Java)

```bash
# Ejecutar tests unitarios
mvn clean test

# Con cobertura
mvn clean test jacoco:report
# Reporte en: target/site/jacoco/index.html

# Tests específicos
mvn test -Dtest=AuthControllerTest
mvn test -Dtest=*QrService*
```

### Frontend Testing (React + Vitest)

```bash
# Tests unitarios
npm run test

# Con coverage
npm run test:coverage

# Tests específicos
npm run test src/components/__tests__/QRScanner.test.jsx

# E2E con Playwright (si está configurado)
npm run test:e2e
```

### Pruebas de Integración (Postman/REST Client)

```bash
# Collections en: postman/AgroFlex.postman_collection.json

# Imports:
# - Auth flow (login/register)
# - Catalog operations
# - Order creation
# - Payment processing
```

### Base de Datos

```bash
# Conexión local
Host: localhost:3306
User: root
Password: [Your MySQL password]
Database: agroflex_db

# Backup
mysqldump -u root -p agroflex_db > backup.sql

# Restaurar
mysql -u root -p agroflex_db < backup.sql
```

---

## 📊 CHECKLIST DE VALIDACIÓN

### Previo a cada ejecución de pruebas:

- [ ] Backend services levantados (8080-8090)
- [ ] MySQL en línea y BD restaurada
- [ ] Frontend en `http://localhost:5173`
- [ ] Stripe API keys configuradas (.env)
- [ ] Firebase Storage configurado
- [ ] Twilio (SMS/Email) configurado
- [ ] Variables de entorno actualizadas
- [ ] JWT_SECRET configurado
- [ ] Base de datos limpia o con datos de test

### Después de bugs encontrados:

- [ ] Bug documentado en issue
- [ ] Caso de prueba agregado para prevenir regresión
- [ ] Unit test escrito
- [ ] Pull request con fix
- [ ] Re-ejecutar todo el flujo de fase

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Cobertura de código | ≥ 80% | 🔴 ~ 45% |
| Casos de prueba exitosos | 100% | 🟢 10/10 (Fase 1-3) |
| Latencia promedio API | < 500ms | 🟡 ~300ms |
| Throughput pagos | > 100 tx/min | ? (por testear) |
| Uptime | 99.5% | ? (por monitorear) |

---

## 🚀 PRÓXIMOS PASOS

1. **Semana 1:** Activar pruebas de Fase 4 (Órdenes)
2. **Semana 2:** Completar Fase 5 (Pagos Escrow)
3. **Semana 3:** QR + GPS (Fase 6)
4. **Semana 4:** Notificaciones y Reputación
5. **Semana 5:** Pruebas de carga y estrés

---

## 📝 REGISTR O DE CAMBIOS

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 18-Mar-2026 | Creación inicial - Fases 1-8 | Sistema |
| - | - | - |

---

**Documento revisado:** 18 de marzo de 2026  
**Próxima revisión:** 25 de marzo de 2026  
**Estado:** 🟡 En Actualización Continua
