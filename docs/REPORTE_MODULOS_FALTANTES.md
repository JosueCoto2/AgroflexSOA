# 📋 Reporte de Módulos Faltantes - AgroFlex SOA

**Fecha:** 21 de marzo de 2026  
**Proyecto:** AgroflexSOA  
**Estado General:** ~38% completado  
**Última Actualización:** Marco de análisis comprehensivo

---

## 📊 Resumen Ejecutivo

| Categoría | Total | Completados | Faltantes |
|-----------|-------|-------------|-----------|
| Microservicios Backend | 11 | 3 | **8** |
| Pantallas Frontend | 18 | 10 | **8** |
| **Módulos Críticos Faltantes** | - | - | **3** |

**Estimado para MVP:** 5-6 semanas de desarrollo backend + 1 semana integración frontend

---

## 🔴 MÓDULOS FALTANTES — ANÁLISIS DETALLADO

---

### 1. **agroflex-orders-service** — PRIORIDAD: 🔴 CRÍTICA

**Puerto:** 8084  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Gestión completa del ciclo de vida de pedidos entre compradores y vendedores.

#### Características principales:

- ✅ CRUD de órdenes (crear, listar, actualizar, cancelar)
- ✅ Estados de pedido: `PENDIENTE` → `CONFIRMADO` → `EN_TRANSITO` → `ENTREGADO` → `COMPLETADO`
- ✅ Listado de "Mis Pedidos" (para comprador y vendedor)
- ✅ Validación de stock disponible contra catálogo
- ✅ Cálculo automático de totales (qty × precio_unitario)
- ✅ Integración con PaymentsService (para crear transacción)
- ✅ Integración con QRService (para generar código de validación)
- ✅ Integración con NotificationsService (para alertas de cambio de estado)
- ✅ Manejo de escrow: retención de pago hasta validación QR

#### Estructura esperada:

```
agroflex-orders-service/
├── pom.xml
├── src/main/java/com/agroflex/orders/
│   ├── OrdersApplication.java
│   ├── controller/
│   │   ├── OrderController.java          # POST /api/orders, GET /api/orders/{id}
│   │   └── OrderStatusController.java    # GET /api/orders/status/{status}
│   ├── service/
│   │   ├── OrderService.java             # Lógica principal CRUD
│   │   ├── EscrowService.java            # Gestión de dinero retenido
│   │   └── OrderValidationService.java   # Validar stock, datos, etc.
│   ├── model/
│   │   ├── OrdenTransaccion.java         # JPA Entity
│   │   ├── ItemPedido.java               # Items dentro de orden
│   │   └── EstadoPedido.java             # Enum de estados
│   ├── repository/
│   │   ├── OrdenTransaccionRepository.java
│   │   └── ItemPedidoRepository.java
│   ├── dto/
│   │   ├── CreateOrderRequest.java
│   │   ├── OrderResponse.java
│   │   ├── OrderItemDto.java
│   │   └── OrderStatusUpdateDto.java
│   ├── events/
│   │   ├── OrderCreatedEvent.java
│   │   ├── OrderStatusChangedEvent.java
│   │   └── OrderCompletedEvent.java
│   ├── client/
│   │   ├── PaymentServiceClient.java     # Feign Client
│   │   ├── QrServiceClient.java          # Feign Client
│   │   └── CatalogServiceClient.java     # Validar producto existe
│   ├── exception/
│   │   ├── OrderNotFoundException.java
│   │   ├── InsufficientStockException.java
│   │   └── GlobalExceptionHandler.java
│   └── config/
│       └── FeignClientConfig.java
├── src/test/java/com/agroflex/orders/
│   ├── OrderServiceTest.java
│   ├── OrderControllerTest.java
│   └── EscrowServiceTest.java
└── src/main/resources/
    ├── application.yml
    └── application-test.yml
```

#### Endpoints principales:

```
POST   /api/orders                    # Crear nueva orden
GET    /api/orders/{orderId}          # Obtener detalle de orden
GET    /api/orders/mis-pedidos        # Listar órdenes del usuario autenticado
PUT    /api/orders/{orderId}/status   # Cambiar estado (comprador/vendedor)
DELETE /api/orders/{orderId}          # Cancelar orden (si está en estado válido)
GET    /api/orders/stats              # Estadísticas (opcional)
```

#### Dependencias código:

```xml
<!-- Spring Cloud Eureka (discovery) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- Spring Cloud OpenFeign (para llamar otros microservicios) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.33</version>
</dependency>
```

#### Base de datos (tablas nuevas):

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
    fecha_actualizar TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (id_comprador) REFERENCES usuarios(id),
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id),
    INDEX idx_comprador (id_comprador),
    INDEX idx_vendedor (id_vendedor),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_creacion)
);

CREATE TABLE items_pedido (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_orden BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id) ON DELETE CASCADE,
    INDEX idx_orden (id_orden)
);

CREATE TABLE escrow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_orden BIGINT NOT NULL UNIQUE,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'RETENIDO',
    fecha_retencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_liberacion TIMESTAMP,
    razon VARCHAR(255),
    FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id) ON DELETE CASCADE
);
```

#### Estimado de desarrollo:

- Modelos JPA y Repositorios: 2-3 días
- Servicios (CRUD + lógica escrow): 3-4 días
- Controladores y DTOs: 1-2 días
- Clientes Feign y eventos: 1-2 días
- Tests unitarios: 2-3 días
- **Total: 10-14 días (2 semanas)**

---

### 2. **agroflex-payments-service** — PRIORIDAD: 🔴 CRÍTICA

**Puerto:** 8085  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Procesamiento de pagos integrado con Stripe y PayPal, incluyendo lógica de escrow.

#### Características principales:

- ✅ Integración Stripe: crear intent de pago, confirmar pago
- ✅ Integración PayPal: crear orden, confirmar orden
- ✅ Gestión de escrow: retención de dinero durante pedido
- ✅ Webhook handlers: payment.success, payment.failed, payment.disputed
- ✅ Liberación automática de dinero al comprador confirmar entrega (QR)
- ✅ Reembolsos: si vendedor cancela pedido antes de entrega
- ✅ Seguimiento de transacciones
- ✅ Historial de pagos por usuario

#### Estructura esperada:

```
agroflex-payments-service/
├── pom.xml
├── src/main/java/com/agroflex/payments/
│   ├── PaymentsApplication.java
│   ├── controller/
│   │   ├── PaymentController.java        # POST /api/payments/create-intent
│   │   ├── WebhookController.java        # POST /api/webhooks/stripe
│   │   └── TransactionController.java    # GET /api/payments/transactions
│   ├── service/
│   │   ├── PaymentService.java           # Orquestador principal
│   │   ├── StripeService.java            # Integración con Stripe API
│   │   ├── PayPalService.java            # Integración con PayPal API
│   │   ├── EscrowService.java            # Gestión de retención de dinero
│   │   ├── RefundService.java            # Reembolsos
│   │   └── TransactionHistoryService.java
│   ├── model/
│   │   ├── Transaccion.java              # JPA Entity
│   │   ├── MovimientoEscrow.java         # Historial escrow
│   │   ├── MetodoPago.java               # Enum: STRIPE, PAYPAL
│   │   ├── EstadoPago.java               # Enum: PENDIENTE, PAGADO, FALLIDO, REEMBOLSADO
│   │   └── TipoMovimiento.java           # Enum: RETENCIÓN, LIBERACIÓN, REEMBOLSO
│   ├── repository/
│   │   ├── TransaccionRepository.java
│   │   └── MovimientoEscrowRepository.java
│   ├── dto/
│   │   ├── CreatePaymentIntentRequest.java
│   │   ├── PaymentIntentResponse.java
│   │   ├── ConfirmPaymentRequest.java
│   │   ├── WebhookPayload.java
│   │   ├── TransactionDto.java
│   │   └── EscrowStatusDto.java
│   ├── client/
│   │   ├── OrderServiceClient.java       # Feign: notificar cambio de estado
│   │   └── NotificationServiceClient.java
│   ├── exception/
│   │   ├── PaymentProcessingException.java
│   │   ├── EscrowException.java
│   │   ├── RefundException.java
│   │   └── GlobalExceptionHandler.java
│   ├── config/
│   │   ├── StripeConfig.java             # API key, configuración
│   │   ├── PayPalConfig.java
│   │   └── FeignConfig.java
│   └── security/
│       └── WebhookSecurityFilter.java    # Validar webhooks de Stripe
├── src/test/java/com/agroflex/payments/
│   ├── StripeServiceTest.java
│   ├── PaymentServiceTest.java
│   └── EscrowServiceTest.java
└── src/main/resources/
    ├── application.yml                   # stripe.api-key, paypal.client-id
    └── application-test.yml
```

#### Endpoints principales:

```
POST   /api/payments/create-intent          # Iniciar pago (Stripe)
POST   /api/payments/confirm                # Confirmar pago completado
POST   /api/payments/release-escrow/{orderId} # Liberar dinero retenido
POST   /api/payments/refund/{transactionId}   # Solicitar reembolso
GET    /api/payments/transactions/{userId}    # Historial de transacciones
GET    /api/payments/escrow-balance/{userId}  # Saldo en escrow
POST   /api/webhooks/stripe                 # Webhook Stripe (interno)
POST   /api/webhooks/paypal                 # Webhook PayPal (interno)
```

#### Dependencias código:

```xml
<!-- Stripe SDK -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>25.1.0</version>
</dependency>

<!-- PayPal SDK -->
<dependency>
    <groupId>com.paypal.sdk</groupId>
    <artifactId>checkout-sdk</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- Spring Cloud OpenFeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

#### Base de datos (tablas nuevas):

```sql
CREATE TABLE transacciones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_orden BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    tipo_pago VARCHAR(50) NOT NULL,
    id_proveedor VARCHAR(100),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    INDEX idx_usuario (id_usuario),
    INDEX idx_orden (id_orden),
    INDEX idx_estado (estado)
);

CREATE TABLE movimientos_escrow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_transaccion BIGINT NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    razon VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaccion) REFERENCES transacciones(id) ON DELETE CASCADE,
    INDEX idx_transaccion (id_transaccion)
);
```

#### Estimado de desarrollo:

- Configuración Stripe + PayPal: 2-3 días
- Servicios de pago: 4-5 días
- Gestión de escrow: 2-3 días
- Webhooks y seguridad: 2-3 días
- Tests + integración: 3-4 días
- **Total: 13-18 días (2.5-3.5 semanas)**

---

### 3. **agroflex-qr-service** — PRIORIDAD: 🔴 CRÍTICA

**Puerto:** 8086  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Generación, almacenamiento y validación de códigos QR com GPS para confirmar entregas.

#### Características principales:

- ✅ Generación de QR por orden (código único)
- ✅ Almacenamiento de QR en base de datos
- ✅ Validación de QR con geolocalización (GPS)
- ✅ Rango de aceptación GPS: máx 500m del punto de entrega
- ✅ Registro de intentos de validación
- ✅ Trigger a payments-service para liberar escrow
- ✅ Historial de validaciones
- ✅ URL pública para descargar imagen QR

#### Estructura esperada:

```
agroflex-qr-service/
├── pom.xml
├── src/main/java/com/agroflex/qr/
│   ├── QrApplication.java
│   ├── controller/
│   │   ├── QrController.java              # POST /api/qr/generate, POST /api/qr/validate
│   │   └── QrDownloadController.java      # GET /api/qr/{id}/download
│   ├── service/
│   │   ├── QrService.java                 # Generación y gestión de QR
│   │   ├── QrValidationService.java       # Validación con GPS
│   │   ├── GeoLocationService.java        # Cálculo de distancia
│   │   └── QrImageService.java            # Generar imagen PNG del QR
│   ├── model/
│   │   ├── CodigoQr.java                  # JPA Entity
│   │   ├── ValidacionQr.java              # Historial de intentos
│   │   ├── EstadoQr.java                  # Enum: ACTIVO, USADO, CANCELADO
│   │   └── CoordenadasGps.java            # Lat, Lon, timestamp
│   ├── repository/
│   │   ├── CodigoQrRepository.java
│   │   └── ValidacionQrRepository.java
│   ├── dto/
│   │   ├── GenerateQrRequest.java
│   │   ├── QrResponse.java
│   │   ├── ValidateQrRequest.java
│   │   ├── ValidationResultDto.java
│   │   └── CoordenadasDto.java
│   ├── client/
│   │   ├── OrderServiceClient.java        # Notificar validación
│   │   ├── PaymentServiceClient.java      # Liberar escrow
│   │   └── NotificationServiceClient.java # Alertas
│   ├── exception/
│   │   ├── QrNotFoundException.java
│   │   ├── InvalidQrException.java
│   │   ├── GpsValidationException.java
│   │   └── GlobalExceptionHandler.java
│   ├── config/
│   │   ├── QrGenerationConfig.java        # Propiedades de QR
│   │   └── FeignConfig.java
│   └── util/
│       ├── QrGeneratorUtil.java           # Usar librería ZXing o qrcode.jar
│       └── GeometryUtil.java              # Haversine formula para GPS
├── src/test/java/com/agroflex/qr/
│   ├── QrServiceTest.java
│   ├── GeoLocationServiceTest.java
│   └── QrValidationServiceTest.java
└── src/main/resources/
    ├── application.yml
    └── application-test.yml
```

#### Endpoints principales:

```
POST   /api/qr/generate                  # Generar QR para orden
GET    /api/qr/{qrId}                    # Obtener información de QR
POST   /api/qr/validate                  # Validar QR con GPS (comprador desde app)
GET    /api/qr/{qrId}/download           # Descargar imagen PNG del QR
GET    /api/qr/{qrId}/validation-history # Historial de validaciones
DELETE /api/qr/{qrId}                    # Cancelar QR (si se cancela orden)
```

#### Dependencias código:

```xml
<!-- ZXing para generación de QR -->
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.1</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.1</version>
</dependency>

<!-- Spring Cloud OpenFeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

#### Base de datos (tablas nuevas):

```sql
CREATE TABLE codigos_qr (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_orden BIGINT NOT NULL UNIQUE,
    valor_qr VARCHAR(500) NOT NULL UNIQUE,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    url_descarga VARCHAR(500),
    latitud_entrega DECIMAL(10,8),
    longitud_entrega DECIMAL(11,8),
    rango_aceptacion_metros INT DEFAULT 500,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP,
    FOREIGN KEY (id_orden) REFERENCES ordenes_transaccion(id),
    INDEX idx_orden (id_orden),
    INDEX idx_estado (estado)
);

CREATE TABLE validaciones_qr (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_qr BIGINT NOT NULL,
    latitud_actual DECIMAL(10,8) NOT NULL,
    longitud_actual DECIMAL(11,8) NOT NULL,
    distancia_metros DECIMAL(10,2),
    fue_exitosa BOOLEAN NOT NULL,
    motivo_fallo VARCHAR(255),
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_validador BIGINT,
    FOREIGN KEY (id_qr) REFERENCES codigos_qr(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_validador) REFERENCES usuarios(id),
    INDEX idx_qr (id_qr),
    INDEX idx_fecha (fecha_intento)
);
```

#### Estimado de desarrollo:

- Configuración ZXing + service QR: 2-3 días
- Validación GPS y Haversine: 2 días
- Repositorios y DTOs: 1-2 días
- Controladores y clientes Feign: 2-3 días
- Tests: 2-3 días
- **Total: 9-13 días (1.5-2.5 semanas)**

---

### 4. **agroflex-notifications-service** — PRIORIDAD: 🟡 MEDIA

**Puerto:** 8088  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Notificaciones por email y SMS usando Twilio y SendGrid.

#### Características principales:

- ✅ Envío de SMS (Twilio): confirmación de pedidos, cambios de estado
- ✅ Envío de email (SendGrid): confirmaciones, recibos, alertas
- ✅ Templates de notificación (HTML parametrizable)
- ✅ Cola de notificaciones pendientes (reintentos)
- ✅ Historial de notificaciones enviadas
- ✅ Notificaciones in-app (WebSocket - opcional)
- ✅ Preferencias de usuario (qué notificaciones recibir)

#### Endpoints principales:

```
POST   /api/notifications/send-email      # Enviar email
POST   /api/notifications/send-sms        # Enviar SMS
GET    /api/notifications/history/{userId} # Historial
PUT    /api/notifications/preferences      # Actualizar preferencias
```

#### Estimado: **1-2 semanas**

---

### 5. **agroflex-users-service** — PRIORIDAD: 🟡 MEDIA

**Puerto:** 8083  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Gestión de perfiles de usuario, insignias, reputación y seguimiento.

#### Características principales:

- ✅ Obtener/actualizar perfil de usuario
- ✅ Sistema de insignias (verificación de vendedor)
- ✅ Calificación y reputación (promedio de reseñas)
- ✅ Seguimiento de vendedores
- ✅ Ubicación y datos de contacto
- ✅ Fotos de perfil
- ✅ Verificación de identidad (KYC - Know Your Customer)

#### Endpoints principales:

```
GET    /api/users/{userId}                # Obtener perfil
PUT    /api/users/{userId}                # Actualizar perfil
GET    /api/users/{userId}/badges         # Insignias del usuario
POST   /api/users/{userId}/follow         # Seguir vendedor
GET    /api/users/{userId}/reputation     # Calificación/reputación
```

#### Estimado: **1.5-2 semanas**

---

### 6. **agroflex-admin-service** — PRIORIDAD: 🟡 MEDIA

**Puerto:** 8089  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Dashboard administrativo para gestionar la plataforma.

#### Características principales:

- ✅ Gestión de usuarios (activar/desactivar)
- ✅ Gestión de categorías y tipos de cultivo
- ✅ Resolución de disputas entre comprador/vendedor
- ✅ Reportes y estadísticas
- ✅ Auditoría de transacciones
- ✅ Gestión de insignias y verificaciones
- ✅ Soporte y tickets

#### Endpoints principales:

```
GET    /api/admin/users                   # Listar usuarios
PUT    /api/admin/users/{userId}/status   # Activar/desactivar
POST   /api/admin/disputes                # Crear disputa
GET    /api/admin/reports/sales           # Reportes de ventas
```

#### Estimado: **2-3 semanas**

---

### 7. **agroflex-geolocation-service** — PRIORIDAD: 🟢 BAJA

**Puerto:** 8087  
**Tipo:** Microservicio Spring Boot 3.2.3 / Java 21  
**Descripción:** Funcionalidades de geolocalización y mapas.

#### Características principales:

- ✅ Distancia entre comprador y vendedor
- ✅ Búsqueda por radio geográfico
- ✅ Integración con Google Maps
- ✅ Rutas de entrega

#### Estimado: **1-1.5 semanas**

---

### 8. **agroflex-ml-service** — PRIORIDAD: 🟢 BAJA

**Puerto:** - (Python)  
**Tipo:** Servicio Python con Flask/FastAPI  
**Descripción:** Machine Learning para predicciones y recomendaciones.

#### Características principales:

- ✅ Predicción de precios (basado en histórico)
- ✅ Recomendaciones personalizadas (basado en histórico de compras)
- ✅ Detección de anomalías (precios sospechosos)
- ✅ Análisis de tendencias de mercado

#### Estimado: **3-4 semanas** (requiere datos históricos)

---

### 9. **Sistema de Reseñas y Calificaciones** — PRIORIDAD: 🟡 MEDIA

**Tipo:** Integración en `agroflex-users-service` o microservicio independiente  
**Descripción:** Reseñas entre comprador/vendedor, calificaciones de productos.

#### Características principales:

- ✅ Crear reseña después de completar compra
- ✅ Calificación 1-5 estrellas
- ✅ Fotos en reseña
- ✅ Comentario del vendedor a reseña
- ✅ Promedio de calificaciones por usuario
- ✅ Listar reseñas de producto/usuario

#### Estimado: **1-1.5 semanas**

---

## 📈 CRONOGRAMA SUGERIDO DE IMPLEMENTACIÓN

**Fase 1 (Semanas 1-2): MVP Crítico**
- `agroflex-orders-service`
- `agroflex-payments-service` (Stripe solo)
- `agroflex-qr-service`

**Fase 2 (Semana 3): Integración**
- Conectar servicios entre sí
- Testing e2e
- Integración frontend

**Fase 3 (Semanas 4-5): Complementarios**
- `agroflex-notifications-service`
- `agroflex-users-service`
- Sistema de reseñas

**Fase 4 (Semanas 6+): Opcionales**
- `agroflex-admin-service`
- `agroflex-geolocation-service`
- `agroflex-ml-service`

---

## 📋 RESUMEN: TABLA DE COMPARACIÓN

| Módulo | Puerto | Complejidad | Tiempo | Dependencias | Estado Actual |
|--------|--------|-------------|--------|--------------|---------------|
| **orders-service** | 8084 | ⭐⭐⭐⭐ | 2 sem | Catalog, Payments | 🔴 Stub |
| **payments-service** | 8085 | ⭐⭐⭐⭐⭐ | 2.5 sem | Stripe, PayPal, Orders | 🔴 Stub |
| **qr-service** | 8086 | ⭐⭐⭐⭐ | 1.5-2 sem | Orders, Payments | 🔴 Stub |
| **notifications-service** | 8088 | ⭐⭐⭐ | 1-2 sem | Twilio, SendGrid | 🔴 Stub |
| **users-service** | 8083 | ⭐⭐⭐ | 1.5-2 sem | Auth | 🔴 En desarrollo |
| **admin-service** | 8089 | ⭐⭐⭐⭐ | 2-3 sem | Todos | 🔴 No existe |
| **geolocation-service** | 8087 | ⭐⭐ | 1-1.5 sem | Google Maps | 🔴 Stub |
| **ml-service** | - | ⭐⭐⭐⭐⭐ | 3-4 sem | Histórico de datos | 🔴 Placeholder |
| **Reviews & Ratings** | - | ⭐⭐ | 1-1.5 sem | Users, Orders | 🔴 Falta |

---

## 🎯 CONCLUSIONES

1. **Los 3 módulos críticos** (Orders, Payments, QR) son **bloqueadores del MVP**
2. **Estimado para MVP funcional:** **5-6 semanas de desarrollo backend + 1 semana integración**
3. **Todos los módulos requieren:** Java 21, Spring Boot 3.2.3, MySQL 8.0, Maven 3.9+
4. **Recomendación:** Iniciar con `orders-service` (menos dependencias externas)

---

**Generado:** 21 de marzo de 2026  
**Preparado para:** Equipo de Desarrollo AgroflexSOA
