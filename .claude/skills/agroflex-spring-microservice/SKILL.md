---
name: agroflex-spring-microservice
description: >
  Genera microservicios completos de Spring Boot 3.x para el proyecto AgroFlex.
  Usa esta skill SIEMPRE que el usuario pida crear, agregar o modificar un
  microservicio, endpoint, entidad JPA, repositorio, servicio, DTO, excepción
  o controlador REST dentro del backend de AgroFlex. También úsala cuando
  mencione palabras como: "microservicio", "endpoint", "Spring Boot", "Java",
  "JPA", "Controller", "Service", "Repository", "DTO", "Exception" o
  "agroflex-*-service".
---

# AgroFlex — Spring Boot Microservice Skill

Genera código Java para los microservicios de AgroFlex siguiendo
las convenciones y arquitectura ya definidas en el proyecto.

---

## Contexto del proyecto

- **Framework**: Spring Boot 3.x + Java 21
- **Base de datos**: MySQL 8.0 — schema `agroflex_db`
- **Seguridad**: JWT con Spring Security + RBAC
- **Service Discovery**: Eureka Client en todos los microservicios
- **Comunicación entre servicios**: Feign Client (síncrono) + Kafka (eventos async)
- **Puertos asignados**:
  - auth-service: 8081 | users-service: 8082 | catalog-service: 8083
  - orders-service: 8084 | payments-service: 8085 | qr-service: 8086
  - notifications-service: 8087 | geo-service: 8088

---

## Roles del sistema (RBAC)

```
PRODUCTOR | INVERNADERO | PROVEEDOR | EMPAQUE | COMPRADOR | ADMIN
```

---

## Estructura obligatoria de cada microservicio

```
agroflex-{nombre}-service/
└── src/main/java/com/agroflex/{nombre}/
    ├── controller/     → @RestController + @RequestMapping("/api/{nombre}")
    ├── service/        → @Service — lógica de negocio
    ├── repository/     → @Repository — extiende JpaRepository
    ├── model/          → @Entity JPA + Lombok
    ├── dto/            → Records o clases con validaciones @Valid
    ├── config/         → @Configuration beans
    ├── exception/      → Excepciones personalizadas + GlobalExceptionHandler
    └── mapper/         → MapStruct mappers
```

---

## Reglas de código obligatorias

### Entidades JPA (model/)
- Siempre usar Lombok: `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
- Timestamps con: `@CreationTimestamp` y `@UpdateTimestamp`
- Soft delete con campo `deletedAt` tipo `LocalDateTime` (nunca borrar físico)
- IDs: `@GeneratedValue(strategy = GenerationType.IDENTITY)` tipo `Long`
- Nombres de tabla en español siguiendo el schema: `Usuarios`, `Cosechas_Lote`, etc.

### DTOs
- Usar Java Records cuando sean de solo lectura
- Validaciones `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max` siempre presentes
- Separar Request y Response: `NombreRequest.java` / `NombreResponse.java`

### Controllers
- Siempre `@Valid` en los `@RequestBody`
- Respuestas con `ResponseEntity<?>` tipado
- Códigos HTTP correctos: 201 para POST, 200 para GET/PUT, 204 para DELETE
- Proteger con `@PreAuthorize("hasRole('ROL')")` según el rol que corresponda
- Documentar con `@Operation` de Swagger/OpenAPI

### Services
- Inyección por constructor (nunca `@Autowired` en campo)
- Transacciones: `@Transactional` en métodos de escritura
- `@Transactional(readOnly = true)` en métodos de solo lectura
- Nunca exponer entidades directamente — siempre mapear a DTO

### Excepciones personalizadas de AgroFlex
```java
// Patrón estándar — siempre extender RuntimeException
public class {Nombre}Exception extends RuntimeException {
    private final String codigo;  // Ej: "AF-QR-404"
    // Constructor con mensaje + código
}
```

Excepciones ya existentes (no recrear):
- `UsuarioNoEncontradoException` (AF-USR-404)
- `CredencialesInvalidasException` (AF-AUTH-401)
- `LoteNoDisponibleException` (AF-CAT-409)
- `QRExpiradoException` (AF-QR-410)
- `GPSFueraDeRangoException` (AF-GPS-422)
- `PagoFallidoException` (AF-PAY-402)
- `InsigniaNoVerificadaException` (AF-INS-403)

### GlobalExceptionHandler (en cada microservicio)
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Formato de respuesta estándar:
    // { "codigo": "AF-XXX-000", "mensaje": "...", "timestamp": "..." }
    // NUNCA exponer stack trace al cliente
}
```

### application.yml mínimo requerido
```yaml
server:
  port: {puerto-del-servicio}
spring:
  application:
    name: agroflex-{nombre}-service
  datasource:
    url: jdbc:mysql://localhost:3306/agroflex_db?useSSL=false&serverTimezone=America/Mexico_City
    username: ${DB_USER:root}
    password: ${DB_PASS:}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_URL:http://localhost:8761/eureka}
```

---

## Tablas del schema (referencia rápida)

| Tabla | Entidad Java | Microservicio dueño |
|-------|-------------|---------------------|
| Usuarios | Usuario | auth-service / users-service |
| Roles | Rol | auth-service |
| Insignias_Vendedor | InsigniaVendedor | users-service |
| Cosechas_Lote | CosechaLote | catalog-service |
| Suministros_Tienda | SuministroTienda | catalog-service |
| Imagenes_Galeria | ImagenGaleria | catalog-service |
| Ordenes_Transaccion | OrdenTransaccion | orders-service |
| Seguridad_QR | SeguridadQR | qr-service |
| Notificaciones | Notificacion | notifications-service |
| Reseñas_Calificaciones | ReseñaCalificacion | users-service |
| Disputas | Disputa | orders-service |

---

## Pruebas unitarias obligatorias

- Cobertura mínima: **80%**
- Framework: JUnit 5 + Mockito
- Nombrar tests: `test_{escenario}_{resultadoEsperado}()`
- Siempre probar: caso exitoso + caso de error + caso de borde
- Usar `@ExtendWith(MockitoExtension.class)` — nunca levantar contexto completo

```java
// Patrón estándar AgroFlex
@Test
void test_crearLote_exitoso_cuandoDatosValidos() {
    // Arrange
    // Act
    // Assert
}
```

---

## Proceso de generación

Cuando el usuario pida un microservicio o componente:

1. **Identificar** qué microservicio corresponde según la tabla de arriba
2. **Leer** si ya existe código en el proyecto para no duplicar
3. **Generar en orden**:
   - Model (Entidad JPA)
   - Repository
   - DTOs (Request + Response)
   - Mapper (MapStruct)
   - Service + Interface
   - Controller
   - Exception específica si se necesita
   - GlobalExceptionHandler (si no existe)
   - Test unitario del Service
4. **Verificar** que el `application.yml` tenga el puerto correcto
5. **Recordar** al usuario agregar la dependencia al `pom.xml` si es nueva

---

## Referencia adicional

Para detalles del schema completo de base de datos, leer:
`agroflex_database.sql` en la raíz del proyecto.

Para estructura completa del backend, leer:
`SOArquitectura/agroflex-backend-structure.md`
