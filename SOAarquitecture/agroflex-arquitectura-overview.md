# AgroFlex — Arquitectura Completa del Sistema
## Resumen de Decisiones Técnicas

---

## Stack Tecnológico Confirmado

| Capa            | Tecnología                          | Justificación                                     |
|-----------------|-------------------------------------|---------------------------------------------------|
| Frontend        | React 18 + Vite + Tailwind CSS      | PWA con Workbox para soporte offline rural        |
| State Mgmt      | Zustand (ligero vs Redux)           | Óptimo para LCP ≤ 2.5s en redes lentas            |
| Backend         | Spring Boot 3.x (Java 21)           | Ecosistema maduro para microservicios             |
| API Gateway     | Spring Cloud Gateway                | Routing + autenticación centralizada             |
| Service Disc.   | Eureka Server                       | Descubrimiento dinámico de servicios              |
| DB Principal    | MySQL 8.0                           | Soporte JSON nativo + Full-Text Search            |
| Real-time       | Firebase Realtime DB / Firestore    | Sincronización de estado de órdenes en vivo       |
| Storage         | Firebase Storage                    | Imágenes y documentos de identidad                |
| Pagos           | Stripe (primario) + PayPal          | Stripe Connect para escrow nativo                 |
| SMS/Email       | Twilio                              | Cobertura rural en México                         |
| IA Semántica    | OpenAI API (text-embedding-3-small) | Búsqueda semántica de lotes                       |
| ML Service      | Python + FastAPI                    | Predicción de precios, recomendaciones            |
| QR              | Google ZXing (Java)                 | Generación y decodificación de QR codes           |
| Comunicación    | Apache Kafka                        | Eventos asincrónicos entre microservicios         |
| Contenedores    | Docker + Docker Compose             | Despliegue reproducible                           |
| Pruebas         | JUnit 5 + Mockito (BE) / Vitest (FE)| Cobertura ≥ 80%                                  |

---

## Flujos de Estado Críticos

### Flujo Escrow (Estado del Pago):
```
PENDIENTE_PAGO
    ↓ (comprador paga con Stripe/PayPal)
PAGO_RETENIDO  ← QR generado en Seguridad_QR
    ↓ (productor prepara y confirma envío)
EN_TRANSITO
    ↓ (productor marca listo en parcela/sucursal)
LISTO_VALIDACION
    ↓ (comprador escanea QR + GPS validado)
PAGO_LIBERADO  → Transferencia automática al vendedor
    
En cualquier punto: → DISPUTADO → Admin resuelve
```

### Flujo QR (Estado del Código):
```
GENERADO → ESCANEADO → VALIDADO ✓ (GPS ok + token válido)
                     ↘ INVALIDO  ✗ (GPS fuera de rango / token expirado)
GENERADO → EXPIRADO  (pasaron 48 horas sin escanear)
```

---

## Reglas de Negocio Clave

1. **Comisión AgroFlex**: 3.5% del monto total de cada transacción
2. **Ventana de validación QR**: 48 horas desde generación
3. **Radio GPS tolerado**: 500 metros (configurable por tipo de entrega)
4. **Intentos QR máximos**: 3 intentos fallidos → QR invalidado automáticamente
5. **Reputación**: Promedio automático vía trigger MySQL al registrar reseña
6. **Insignia obligatoria**: Usuario debe tener insignia APROBADA para publicar lotes
7. **Escrow**: El dinero NUNCA toca al vendedor hasta validación GPS exitosa

---

## Microservicios — Puertos locales (dev)

| Servicio                  | Puerto |
|---------------------------|--------|
| Eureka Server             | 8761   |
| Config Server             | 8888   |
| API Gateway               | 8080   |
| Auth Service              | 8081   |
| Users Service             | 8082   |
| Catalog Service           | 8083   |
| Orders Service            | 8084   |
| Payments Service          | 8085   |
| QR Service ★              | 8086   |
| Notifications Service     | 8087   |
| Geolocation Service       | 8088   |
| ML Service (Python)       | 8090   |

---

## Próximo paso acordado: Microservicio QR + Pagos Escrow

### Archivos a generar en siguiente fase:

**Backend (agroflex-qr-service):**
- `SeguridadQR.java` — Entity JPA
- `SeguridadQRRepository.java` — Spring Data
- `QrGeneratorService.java` — ZXing + HMAC-SHA256
- `QrValidationService.java` — Lógica de validación + Haversine GPS
- `GeoValidationService.java` — Cálculo de distancia GPS
- `QrController.java` — REST endpoints
- `QrGeneratorServiceTest.java` — Tests unitarios
- `QrValidationServiceTest.java` — Tests unitarios

**Backend (agroflex-payments-service):**
- `StripeService.java` — PaymentIntent + Webhooks
- `EscrowService.java` — Retención y liberación
- `PaymentController.java`
- `StripeWebhookHandler.java`

**Frontend:**
- `QRGenerator.jsx` — Muestra QR al productor
- `QRScanner.jsx` — Cámara + ZXing-js para comprador
- `ScanQRPage.jsx` — Página de validación en entrega
- `EscrowStatus.jsx` — Indicador visual del estado del escrow
