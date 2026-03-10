# AgroFlex — Backend Structure (Spring Boot Microservices)

agroflex-backend/
├── agroflex-gateway/                  # API Gateway (Spring Cloud Gateway)
│   ├── src/main/java/com/agroflex/gateway/
│   │   ├── GatewayApplication.java
│   │   ├── config/
│   │   │   ├── GatewayConfig.java     # Routes + load balancing
│   │   │   └── CorsConfig.java
│   │   └── filters/
│   │       └── JwtAuthFilter.java     # Validación JWT en gateway
│   └── src/main/resources/
│       └── application.yml
│
├── agroflex-auth-service/             # MS: Autenticación & JWT
│   ├── src/main/java/com/agroflex/auth/
│   │   ├── AuthApplication.java
│   │   ├── controller/
│   │   │   └── AuthController.java    # /login, /register, /refresh
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── JwtService.java
│   │   ├── model/
│   │   │   ├── Usuario.java           # JPA Entity
│   │   │   └── InsigniaVendedor.java
│   │   ├── repository/
│   │   │   └── UsuarioRepository.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── security/
│   │   │   ├── SecurityConfig.java    # RBAC + CORS
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── exception/
│   │       └── GlobalExceptionHandler.java
│   └── src/test/java/com/agroflex/auth/
│       ├── AuthControllerTest.java
│       └── JwtServiceTest.java
│
├── agroflex-users-service/            # MS: Gestión de Usuarios
│   ├── src/main/java/com/agroflex/users/
│   │   ├── controller/UserController.java
│   │   ├── service/UserService.java
│   │   ├── model/
│   │   │   ├── Usuario.java
│   │   │   └── InsigniaVendedor.java
│   │   ├── repository/
│   │   └── dto/
│   └── src/test/
│
├── agroflex-catalog-service/          # MS: Catálogo (lotes + suministros)
│   ├── src/main/java/com/agroflex/catalog/
│   │   ├── controller/
│   │   │   ├── CosechaController.java # /harvests CRUD + búsqueda
│   │   │   └── SuministroController.java
│   │   ├── service/
│   │   │   ├── CosechaService.java
│   │   │   ├── SuministroService.java
│   │   │   └── SearchService.java     # OpenAI semantic search
│   │   ├── model/
│   │   │   ├── CosechaLote.java
│   │   │   ├── SuministroTienda.java
│   │   │   └── ImagenGaleria.java
│   │   ├── repository/
│   │   │   ├── CosechaLoteRepository.java
│   │   │   └── SuministroRepository.java
│   │   └── dto/
│   └── src/test/
│
├── agroflex-orders-service/           # MS: Pedidos + Escrow
│   ├── src/main/java/com/agroflex/orders/
│   │   ├── controller/
│   │   │   └── OrderController.java   # /orders CRUD + estados
│   │   ├── service/
│   │   │   ├── OrderService.java
│   │   │   └── EscrowService.java     # Lógica de retención de pago
│   │   ├── model/
│   │   │   └── OrdenTransaccion.java
│   │   ├── repository/
│   │   ├── dto/
│   │   ├── events/
│   │   │   ├── OrderCreatedEvent.java # Para notificaciones
│   │   │   └── OrderCompletedEvent.java
│   │   └── client/
│   │       ├── PaymentServiceClient.java  # Feign
│   │       └── QrServiceClient.java
│   └── src/test/
│
├── agroflex-payments-service/         # MS: Pagos (Stripe/PayPal + Escrow)
│   ├── src/main/java/com/agroflex/payments/
│   │   ├── controller/
│   │   │   └── PaymentController.java
│   │   ├── service/
│   │   │   ├── PaymentService.java
│   │   │   ├── StripeService.java
│   │   │   └── PayPalService.java
│   │   ├── model/
│   │   │   └── OrdenTransaccion.java
│   │   ├── repository/
│   │   └── webhook/
│   │       └── StripeWebhookHandler.java
│   └── src/test/
│
├── agroflex-qr-service/               # MS: Seguridad QR + GPS ★ CORE
│   ├── src/main/java/com/agroflex/qr/
│   │   ├── controller/
│   │   │   └── QrController.java      # /qr/generate, /qr/validate
│   │   ├── service/
│   │   │   ├── QrGeneratorService.java
│   │   │   ├── QrValidationService.java
│   │   │   └── GeoValidationService.java  # Validar coordenadas GPS
│   │   ├── model/
│   │   │   └── SeguridadQR.java
│   │   ├── repository/
│   │   │   └── SeguridadQRRepository.java
│   │   └── dto/
│   │       ├── QrGenerateRequest.java
│   │       ├── QrValidateRequest.java  # Incluye lat, lng
│   │       └── QrValidateResponse.java
│   └── src/test/
│       ├── QrControllerTest.java
│       └── QrValidationServiceTest.java
│
├── agroflex-notifications-service/    # MS: Push + SMS (Twilio) + Email
│   ├── src/main/java/com/agroflex/notifications/
│   │   ├── controller/
│   │   │   └── NotificationController.java
│   │   ├── service/
│   │   │   ├── TwilioSmsService.java
│   │   │   ├── EmailService.java
│   │   │   └── PushNotificationService.java  # Firebase FCM
│   │   └── listener/
│   │       └── OrderEventListener.java        # Escucha eventos de orders
│   └── src/test/
│
├── agroflex-geolocation-service/      # MS: GPS + Zonas de entrega
│   ├── src/main/java/com/agroflex/geo/
│   │   ├── controller/GeoController.java
│   │   ├── service/
│   │   │   ├── GeoService.java
│   │   │   └── DeliveryZoneService.java
│   │   └── model/UbicacionUsuario.java
│   └── src/test/
│
├── agroflex-ml-service/               # MS: Machine Learning (Python/FastAPI)
│   ├── main.py
│   ├── models/
│   │   ├── price_predictor.py         # Predicción de precios
│   │   └── recommendation_engine.py  # Recomendación de lotes
│   ├── routers/
│   │   └── ml_router.py
│   └── requirements.txt
│
├── agroflex-config-server/            # Spring Cloud Config
│   └── src/main/resources/
│       └── application.yml
│
├── agroflex-eureka-server/            # Service Discovery
│   └── src/main/java/com/agroflex/eureka/
│       └── EurekaServerApplication.java
│
└── docker/
    ├── docker-compose.yml             # Orquestación completa
    ├── docker-compose.dev.yml
    └── nginx/
        └── nginx.conf                 # Reverse proxy


## Dependencias clave por microservicio (pom.xml)

### Todas los MS comparten:
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- mysql-connector-j
- lombok
- mapstruct
- spring-cloud-starter-netflix-eureka-client
- spring-boot-starter-actuator

### agroflex-auth-service agrega:
- spring-boot-starter-security
- jjwt-api / jjwt-impl / jjwt-jackson (io.jsonwebtoken)
- spring-security-crypto (BCrypt)

### agroflex-payments-service agrega:
- stripe-java
- paypal-checkout-sdk

### agroflex-qr-service agrega:
- zxing-core / zxing-javase (Google ZXing para QR)

### agroflex-notifications-service agrega:
- twilio (com.twilio.sdk)
- spring-boot-starter-mail
- firebase-admin

### agroflex-orders-service agrega:
- spring-cloud-starter-openfeign
- spring-kafka (eventos async)
