# Reporte Técnico: Validaciones y Manejo de Excepciones
## Sistema AgroFlex SOA — Orientado a la Interacción del Usuario

**Elaborado por:** Análisis del código fuente  
**Fecha:** Abril 2026  
**Sistema:** AgroFlex SOA — Microservicios Spring Boot 3.2.x

> **Cómo leer este reporte:** Cada sección corresponde a una acción concreta que el usuario realiza en la interfaz. Para cada acción se muestra: el fragmento de código real que la valida, qué falla puede ocurrir, y qué respuesta recibe el usuario. Las explicaciones se presentan en doble registro: **técnico** (cómo funciona el código) y **entendible** (qué significa para el usuario).

---

## Índice

1. [Arquitectura General del Manejo de Errores](#1-arquitectura-general-del-manejo-de-errores)
2. [Acción: Registro de usuario](#2-acción-registro-de-usuario)
3. [Acción: Inicio de sesión](#3-acción-inicio-de-sesión)
4. [Acción: Login con Google](#4-acción-login-con-google)
5. [Acción: Recuperar contraseña](#5-acción-recuperar-contraseña)
6. [Acción: Editar perfil](#6-acción-editar-perfil)
7. [Acción: Explorar el catálogo](#7-acción-explorar-el-catálogo)
8. [Acción: Publicar un lote o producto](#8-acción-publicar-un-lote-o-producto)
9. [Acción: Crear una orden / Comprar](#9-acción-crear-una-orden--comprar)
10. [Acción: Pago con Stripe](#10-acción-pago-con-stripe)
11. [Acción: Cambiar estado de una orden](#11-acción-cambiar-estado-de-una-orden)
12. [Acción: Dejar una reseña](#12-acción-dejar-una-reseña)
13. [Seguridad transversal: JWT y roles](#13-seguridad-transversal-jwt-y-roles)
14. [Convención de códigos de error](#14-convención-de-códigos-de-error)

---

## 1. Arquitectura General del Manejo de Errores

Antes de ver cada acción, es útil entender el camino que recorre cualquier petición y dónde puede ser detenida.

### Flujo de una petición con error

```
Request HTTP del navegador / app
    │
    ▼
Gateway — agroflex-gateway (JwtAuthFilter.java)
    │  ← 401 Unauthorized: token ausente, vencido o inválido
    ▼
Microservicio: SecurityFilterChain
    │  ← 403 Forbidden: token válido pero el rol no tiene permiso
    ▼
Controller — @Valid en @RequestBody
    │  ← 400 Bad Request: campo requerido vacío, formato incorrecto
    │    (Spring lanza MethodArgumentNotValidException automáticamente)
    ▼
Service — validaciones de negocio
    │  ← IllegalArgumentException  → 400 Bad Request
    │  ← IllegalStateException     → 422 Unprocessable Entity
    │  ← Excepción personalizada   → código HTTP específico
    ▼
GlobalExceptionHandler — @RestControllerAdvice
    │
    ▼
Respuesta JSON al cliente
```

> **En lenguaje entendible:** El sistema tiene varias "puertas" antes de procesar cualquier acción. La primera verifica que el usuario esté identificado (token JWT). La segunda verifica que tenga permiso para lo que intenta hacer (rol). La tercera revisa que los datos enviados tengan el formato correcto. La cuarta aplica las reglas del negocio (¿puede comprar? ¿hay stock? ¿la orden puede cancelarse?). Si algo falla en cualquier puerta, el proceso se detiene y el usuario recibe un mensaje claro.

### Formato unificado de respuesta de error

Todos los microservicios devuelven errores en el mismo formato JSON:

```json
{
  "codigo":    "AF-ORD-404",
  "mensaje":   "Orden no encontrada con ID: 99",
  "timestamp": "2026-04-16T14:30:00.123456"
}
```

> **Técnico:** El campo `codigo` sigue la convención `AF-{SERVICIO}-{HTTPCODE}`. Esto permite identificar de qué microservicio proviene el error sin exponer la topología interna de la red.

> **Entendible:** El código de error le dice al equipo de soporte exactamente qué pasó y en qué parte del sistema, sin revelar información sensible del servidor al usuario final.

---

## 2. Acción: Registro de usuario

**Interfaz:** El usuario llena el formulario de registro con nombre, apellidos, correo, contraseña y opcionalmente teléfono.

<!-- 📸 [Insertar captura de pantalla del formulario de registro aquí] -->

### 2.1 Validaciones del formulario (capa DTO)

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/RegisterRequest.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @NotBlank(message = "Los apellidos son requeridos")
    private String apellidos;

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe ser válido")
    private String correo;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
        message = "La contraseña debe incluir al menos 1 mayúscula y 1 número"
    )
    private String password;

    @Pattern(
        regexp = "^[+]?[0-9]{7,20}$",
        message = "El teléfono debe tener entre 7 y 20 dígitos"
    )
    private String telefono;

    private String rolSolicitado;
}
```

> **Técnico:** Spring Boot activa estas validaciones automáticamente porque el controller usa `@Valid @RequestBody`. Si algún campo falla, Spring lanza `MethodArgumentNotValidException` antes de que el código del servicio se ejecute siquiera.

> **Entendible:** En el momento en que el usuario hace clic en "Registrarse", el servidor revisa cada campo. Si algo no cumple las reglas (correo sin `@`, contraseña sin mayúscula), responde de inmediato indicando exactamente qué campo tiene el problema.

**El controller activa la validación con `@Valid`:**

```java
// AuthController.java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    log.info("Registro request para: {}", request.getCorreo());
    AuthResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

### 2.2 Validación de negocio: correo duplicado

Una vez que el formulario pasa la validación de formato, el servicio verifica si el correo ya existe:

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/service/AuthService.java`

```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    // Validar que el correo no exista
    if (usuarioRepository.existsByCorreo(request.getCorreo())) {
        throw new IllegalArgumentException("El correo ya está registrado");
    }

    // Crear nuevo usuario
    Usuario usuario = Usuario.builder()
        .nombre(request.getNombre())
        .apellidos(request.getApellidos())
        .correo(request.getCorreo())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .telefono(request.getTelefono())
        .validado(false)
        .activo(true)
        .puntuacionRep(java.math.BigDecimal.ZERO)
        .totalReseñas(0)
        .build();

    // Asignar rol (COMPRADOR por defecto o rol solicitado)
    String rolNombre = request.getRolSolicitado();
    if (rolNombre == null || rolNombre.isBlank()) {
        rolNombre = "COMPRADOR";
    }

    Rol rol = rolService.obtenerRolPorNombre(rolNombre);
    usuario.getRoles().add(rol);
    usuario = usuarioRepository.save(usuario);

    // Generar tokens JWT
    UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());
    String accessToken  = jwtService.generateToken(userDetails);
    String refreshToken = jwtService.generateRefreshToken(userDetails);

    return buildAuthResponse(usuario, accessToken, refreshToken);
}
```

> **Técnico:** `passwordEncoder.encode()` aplica BCrypt sobre la contraseña antes de guardarla. La contraseña en texto plano nunca se almacena ni se loguea. El `throw new IllegalArgumentException` es capturado por el `GlobalExceptionHandler` y convertido a HTTP 400.

> **Entendible:** Si alguien ya se registró con ese correo, el sistema lo detecta en la base de datos y avisa antes de crear un registro duplicado. La contraseña se guarda "codificada" — ni el propio sistema puede leerla después, solo verificarla.

### 2.3 GlobalExceptionHandler — captura de errores de registro

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Cuando algún campo del formulario no cumple las reglas:
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException e) {

        Map<String, String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                error -> error.getField(),
                error -> error.getDefaultMessage(),
                (existing, replacement) -> existing
            ));

        ErrorResponse response = new ErrorResponse(
            "VALIDATION_ERROR",
            "Error en validación de datos",
            LocalDateTime.now(),
            new HashMap<>(Map.of("fields", errors))
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        // Respuesta: { "fields": { "correo": "El correo debe ser válido", ... } }
    }

    // Cuando el correo ya está registrado:
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        ErrorResponse response = new ErrorResponse(
            "BAD_REQUEST",
            e.getMessage(),   // "El correo ya está registrado"
            LocalDateTime.now(),
            Map.of("type", "IllegalArgumentException")
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

### 2.4 Tabla de errores posibles durante el registro

| Qué hace el usuario | Error que ocurre | HTTP | Mensaje al cliente |
|---|---|---|---|
| Deja el nombre vacío | `@NotBlank` falla | 400 | `"El nombre es requerido"` |
| Escribe correo sin `@` | `@Email` falla | 400 | `"El correo debe ser válido"` |
| Contraseña menor a 8 caracteres | `@Size(min=8)` falla | 400 | `"La contraseña debe tener al menos 8 caracteres"` |
| Contraseña sin mayúscula ni número | `@Pattern` falla | 400 | `"La contraseña debe incluir al menos 1 mayúscula y 1 número"` |
| Teléfono con letras | `@Pattern` falla | 400 | `"El teléfono debe tener entre 7 y 20 dígitos"` |
| Correo ya registrado | `IllegalArgumentException` en `AuthService` | 400 | `"El correo ya está registrado"` |

---

## 3. Acción: Inicio de sesión

**Interfaz:** El usuario ingresa su correo y contraseña y hace clic en "Iniciar sesión".

<!-- 📸 [Insertar captura de pantalla del formulario de login aquí] -->

### 3.1 Validaciones del formulario (capa DTO)

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/LoginRequest.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe ser válido")
    private String correo;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
}
```

> **Técnico:** `@Size(min=8)` en el login es una optimización de seguridad: si la contraseña enviada tiene menos de 8 caracteres, es imposible que sea válida (el sistema exige mínimo 8 al registrarse), por lo que no vale la pena consultar la base de datos.

> **Entendible:** Si el usuario escribe una contraseña de solo 3 letras, el sistema la rechaza directamente sin buscarla en la base de datos, ahorrando tiempo y recursos.

### 3.2 Lógica de autenticación

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/service/AuthService.java`

```java
@Transactional(readOnly = true)
public AuthResponse login(LoginRequest request) {
    try {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getCorreo(),
                request.getPassword()
            )
        );

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getCorreo());

        String accessToken  = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(usuario, accessToken, refreshToken);

    } catch (BadCredentialsException e) {
        log.warn("Intento de login fallido para correo: {}", request.getCorreo());
        throw new BadCredentialsException("Correo o contraseña incorrectos");
    }
}
```

> **Técnico:** `authenticationManager.authenticate()` delega en Spring Security, que busca el usuario por correo, extrae el `passwordHash` de la BD y usa BCrypt para compararlo con la contraseña enviada. Si no coinciden, lanza `BadCredentialsException`. El mensaje es genérico para no revelar si el correo existe o no.

> **Entendible:** El sistema nunca guarda la contraseña real, sino una "huella digital" (hash). Al hacer login, compara la huella de lo que se escribe con la huella guardada. Si no coinciden, dice "correo o contraseña incorrectos" sin especificar cuál de los dos falla — esto es intencional para que nadie pueda descubrir qué correos están registrados.

### 3.3 Captura de errores del login

```java
// GlobalExceptionHandler de auth-service

@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e) {
    log.error("Credenciales inválidas: {}", e.getMessage());
    ErrorResponse response = new ErrorResponse(
        "UNAUTHORIZED",
        "Correo o contraseña incorrectos",
        LocalDateTime.now(),
        Map.of("type", "BadCredentialsException")
    );
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
}
```

### 3.4 Tabla de errores posibles durante el login

| Qué hace el usuario | Error que ocurre | HTTP | Mensaje al cliente |
|---|---|---|---|
| Deja el correo vacío | `@NotBlank` falla | 400 | `"El correo es requerido"` |
| Correo con formato incorrecto | `@Email` falla | 400 | `"El correo debe ser válido"` |
| Contraseña menor a 8 caracteres | `@Size(min=8)` falla | 400 | `"La contraseña debe tener al menos 8 caracteres"` |
| Correo o contraseña incorrectos | `BadCredentialsException` en Spring Security | 401 | `"Correo o contraseña incorrectos"` |
| Token JWT vencido en peticiones posteriores | `ExpiredJwtException` en Gateway | 401 | Token inválido o expirado |

---

## 4. Acción: Login con Google

**Interfaz:** El usuario hace clic en "Continuar con Google" y concede acceso en la ventana emergente de Google.

<!-- 📸 [Insertar captura de pantalla del botón de login con Google aquí] -->

### 4.1 Validación del token de Google

```java
// AuthService.java — loginConGoogle()
// El frontend obtiene un ID Token de Firebase Auth y lo envía al backend

@Transactional
public AuthResponse loginConGoogle(String idToken) {
    try {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException(
                "Firebase Admin SDK no está inicializado. Contacta al administrador.");
        }

        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String correo = decodedToken.getEmail();
        String nombre = decodedToken.getName();
        // ...continúa con registro o login del usuario...

    } catch (FirebaseAuthException e) {
        throw new IllegalArgumentException("Token de Google inválido o expirado");
    }
}
```

> **Técnico:** El backend verifica el ID Token directamente con Firebase Admin SDK (llamada server-to-server). El token nunca se confía solo por llegar — se valida criptográficamente contra los servidores de Google. Si está vencido o fue modificado, Firebase lanza `FirebaseAuthException`, que se convierte a `IllegalArgumentException` → HTTP 400.

> **Entendible:** Cuando el usuario inicia sesión con Google, el sistema no confía ciegamente en lo que llega del navegador. Le pregunta directamente a Google "¿este token es válido?" Si Google dice que no, el acceso se deniega.

### 4.2 Tabla de errores posibles en login con Google

| Situación | Error | HTTP | Mensaje |
|---|---|---|---|
| Token de Google vencido o inválido | `IllegalArgumentException` | 400 | `"Token de Google inválido o expirado"` |
| Firebase SDK no inicializado (error de configuración del servidor) | `IllegalStateException` | 422 | `"Firebase Admin SDK no está inicializado..."` |

---

## 5. Acción: Recuperar contraseña

**Interfaz:** El usuario escribe su correo en la pantalla "¿Olvidaste tu contraseña?" y hace clic en "Enviar instrucciones".

<!-- 📸 [Insertar captura de pantalla de la pantalla de recuperar contraseña aquí] -->

### 5.1 Validación del formulario

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/ForgotPasswordRequest.java`

```java
public class ForgotPasswordRequest {

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe ser válido")
    private String correo;
}
```

**Respuesta del controller — siempre exitosa por seguridad:**

```java
// AuthController.java
@PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request.getCorreo());
    // Siempre devolver éxito por seguridad (no revelar si el correo existe)
    return ResponseEntity.ok(
        "Si el correo existe, recibirás instrucciones para resetear tu contraseña");
}
```

> **Técnico:** Esta es una decisión de seguridad deliberada. El endpoint siempre responde HTTP 200 independientemente de si el correo existe. Esto previene la "enumeración de usuarios" — que un atacante descubra qué correos están registrados probando direcciones.

> **Entendible:** Aunque escribas un correo que no existe en el sistema, siempre verás el mismo mensaje. Esto evita que alguien malicioso pueda descubrir qué cuentas existen en AgroFlex.

### 5.2 Validación del reset de contraseña

**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/ResetPasswordRequest.java`

```java
public class ResetPasswordRequest {

    @NotBlank(message = "El token es requerido")
    private String token;

    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
        message = "La contraseña debe incluir al menos 1 mayúscula y 1 número"
    )
    private String newPassword;
}
```

**Validaciones del token en el service:**

```java
// AuthService.java — resetPassword()

// Si el token de reset ya venció (ventana de 1 hora):
throw new IllegalArgumentException("Token ha expirado");

// Si el token fue manipulado o ya fue usado:
throw new IllegalArgumentException("Token inválido o expirado");
```

> **Entendible:** El enlace de recuperación tiene vigencia de 1 hora. Si el usuario intenta usarlo después, o si alguien modificó el enlace, el sistema lo rechaza. La nueva contraseña debe cumplir las mismas reglas de seguridad que al registrarse.

---

## 6. Acción: Editar perfil

**Interfaz:** El usuario abre su perfil y modifica campos como nombre, teléfono, municipio o descripción.

<!-- 📸 [Insertar captura de pantalla de la pantalla de editar perfil aquí] -->

### 6.1 Validaciones del formulario

**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/dto/ActualizarPerfilRequest.java`

```java
public record ActualizarPerfilRequest(

    @Size(max = 120)
    String nombre,

    @Size(max = 120)
    String apellidos,

    @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Teléfono inválido")
    String telefono,

    @Size(max = 255)
    String direccion,

    Double latitud,
    Double longitud,

    @Size(max = 80)
    String estadoRepublica,

    @Size(max = 80)
    String municipio,

    @Size(max = 500)
    String fotoPerfil,

    @Size(max = 1000)
    String descripcion,

    String fcmToken
) {}
```

> **Técnico:** Los campos usan solo `@Size` (límite de longitud) y `@Pattern` (formato). No usan `@NotBlank` porque todos son opcionales — el usuario puede actualizar solo un campo a la vez. El `record` Java asegura que los campos sean inmutables una vez construidos.

> **Entendible:** Al editar el perfil, ningún campo es obligatorio. Puedes actualizar solo el teléfono sin tocar el nombre. El sistema solo valida que lo que escribas tenga el formato correcto (el teléfono solo puede tener números y `+`).

### 6.2 Captura de errores en users-service

**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Cuando el perfil solicitado no existe:
    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getCodigo(), ex.getMessage(), LocalDateTime.now()));
        // código: "AF-USR-404", mensaje: "Usuario con id X no encontrado"
    }

    // Cuando un campo tiene formato incorrecto:
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            errores.put(campo, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errores);
        // Ejemplo: { "telefono": "Teléfono inválido" }
    }

    // Cuando intenta editar el perfil de otro usuario:
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("AF-USR-403",
                "No tienes permiso para esta acción", LocalDateTime.now()));
    }

    // Error genérico no esperado:
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Error inesperado: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("AF-USR-500",
                "Error interno del servidor", LocalDateTime.now()));
    }
}
```

---

## 7. Acción: Explorar el catálogo

**Interfaz:** El usuario navega por la lista de productos/lotes, con o sin sesión iniciada.

<!-- 📸 [Insertar captura de pantalla del catálogo de productos aquí] -->

> **Técnico:** El catálogo es una ruta pública configurada en el Gateway. Las peticiones `GET /api/catalog/**` no requieren JWT. Sin embargo, la escritura (publicar lotes) sí requiere autenticación y rol específico.

> **Entendible:** Cualquier persona puede ver los productos disponibles sin cuenta. Solo cuando quiere comprar o publicar, el sistema pide que inicie sesión.

### 7.1 Excepción cuando un lote no existe

**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/exception/LoteNoEncontradoException.java`

```java
@ResponseStatus(HttpStatus.NOT_FOUND)   // Spring devuelve 404 automáticamente
public class LoteNoEncontradoException extends RuntimeException {

    private final String codigo = "AF-CAT-404";

    public LoteNoEncontradoException(Long idLote) {
        super("Lote con ID " + idLote + " no encontrado o fue eliminado");
    }

    public LoteNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public String getCodigo() { return codigo; }
}
```

> **Técnico:** La anotación `@ResponseStatus(HttpStatus.NOT_FOUND)` hace que Spring resuelva el código HTTP directamente desde la clase de excepción, sin necesidad de que el `GlobalExceptionHandler` la capture explícitamente.

> **Entendible:** Si el usuario llega a un producto que ya fue eliminado (o que nunca existió), el sistema responde con un error 404 claro en lugar de mostrar una pantalla en blanco o un error genérico.

### 7.2 GlobalExceptionHandler del catalog-service

**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Cuando un productor intenta editar el lote de otro:
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            new ErrorResponse("FORBIDDEN",
                "No tienes permiso para realizar esta acción", LocalDateTime.now()));
    }

    // Validaciones de campos al publicar:
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fields = e.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                err -> err.getField(),
                err -> err.getDefaultMessage(),
                (a, b) -> a));
        return ResponseEntity.badRequest().body(Map.of(
            "error",     "VALIDATION_ERROR",
            "fields",    fields,
            "timestamp", LocalDateTime.now()));
    }

    // Error genérico:
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("Error interno en catalog-service", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new ErrorResponse("INTERNAL_SERVER_ERROR",
                "Error interno del servidor", LocalDateTime.now()));
    }
}
```

---

## 8. Acción: Publicar un lote o producto

**Interfaz:** Un productor autenticado llena el formulario para publicar un lote de cosecha o suministro.

<!-- 📸 [Insertar captura de pantalla del formulario de publicar lote aquí] -->

### 8.1 Control de acceso por rol

```java
// CatalogController.java
@PostMapping("/lotes")
@PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO')")
public ResponseEntity<LoteResponse> publicarLote(
        @Valid @RequestBody LoteRequest request) {
    // ...
}
```

> **Técnico:** `@PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO')")` es evaluado por Spring Security antes de ejecutar el método. Si el JWT del usuario no contiene ninguno de esos roles, Spring lanza `AccessDeniedException` → 403 Forbidden.

> **Entendible:** Solo los usuarios con rol PRODUCTOR o INVERNADERO pueden publicar lotes. Si un COMPRADOR intenta hacerlo (aunque sea directo a la API), el sistema lo rechaza con un 403 aunque su token sea perfectamente válido.

### 8.2 Validaciones del formulario de publicación

**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/dto/LoteRequest.java`

```java
public class LoteRequest {

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 200)
    private String nombreProducto;

    @Size(max = 5000)
    private String descripcion;    // Opcional

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 500)
    private String ubicacion;

    @NotNull(message = "La cantidad disponible es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidadDisponible;

    @NotBlank(message = "La unidad de venta es obligatoria")
    @Size(max = 30)
    private String unidadVenta;   // Ej: "kg", "caja", "pieza"
}
```

> **Técnico:** `@DecimalMin(value="0.001")` en `cantidadDisponible` permite fracciones muy pequeñas (ej. 0.5 kg de semillas de precio alto). Si se usara `@Min(0)` con entero, no se podrían representar cantidades fraccionarias. El mínimo de `0.001` impide publicar con stock cero o negativo.

> **Entendible:** No se puede publicar un producto con precio $0 ni con cantidad cero. El sistema requiere siempre nombre, precio, ubicación y cantidad — sin esos datos básicos, la publicación no puede aparecer en el catálogo.

### 8.3 Validación de propiedad del lote

```java
// CosechaService.java
// Al intentar editar un lote de otro productor:
if (!lote.getIdVendedor().equals(idUsuarioAutenticado)) {
    throw new ResponseStatusException(
        HttpStatus.FORBIDDEN,
        "No puedes editar un lote que no es tuyo");
}
```

> **Entendible:** Aunque dos productores estén autenticados, cada uno solo puede editar o eliminar sus propios lotes. El sistema verifica que el lote pertenezca al usuario que hace la petición.

---

## 9. Acción: Crear una orden / Comprar

**Interfaz:** El comprador selecciona productos del catálogo, confirma cantidades y hace clic en "Confirmar pedido".

<!-- 📸 [Insertar captura de pantalla de la confirmación de pedido / checkout aquí] -->

### 9.1 Control de acceso por rol

```java
// OrderController.java
@PostMapping
@PreAuthorize("hasAnyRole('COMPRADOR','PRODUCTOR','PROVEEDOR','EMPAQUE')")
public ResponseEntity<OrderResponse> crearOrden(
        @Valid @RequestBody CreateOrderRequest request,
        @RequestHeader("Authorization") String authHeader) {

    JwtAuthUser usuario = currentUser();
    OrderResponse response = orderService.crearOrden(
        request, usuario.getIdUsuario(), authHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

> **Técnico:** El rol ADMIN está explícitamente excluido. El `authHeader` se propaga a los servicios internos para que las llamadas Feign entre microservicios también lleven el JWT del usuario original.

### 9.2 Validaciones del request de orden

**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/dto/CreateOrderRequest.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "El vendedor es requerido")
    private Long idVendedor;

    @NotEmpty(message = "Debe incluir al menos un producto")
    @Valid   // ← activa validación en cascada sobre cada OrderItemDto
    private List<OrderItemDto> items;

    private String metodoPago;       // STRIPE o PAYPAL, default STRIPE
    private String observaciones;
    private Double latitudEntrega;
    private Double longitudEntrega;
}
```

```java
// OrderItemDto.java — validado en cascada por @Valid en CreateOrderRequest
public class OrderItemDto {

    @NotNull(message = "El ID del producto es requerido")
    private Long idProducto;

    @NotBlank(message = "El tipo de producto es requerido")
    private String tipoProducto;   // "COSECHA_LOTE" o "SUMINISTRO"

    @NotNull(message = "La cantidad es requerida")
    @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;
}
```

> **Técnico:** `@Valid` sobre la lista `items` activa validación en cascada. Sin esta anotación, solo se verificaría que la lista no esté vacía (`@NotEmpty`), pero no el contenido de cada elemento. Con `@Valid`, Spring valida cada `OrderItemDto` individualmente.

### 9.3 Validaciones de negocio: OrderValidationService

**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/service/OrderValidationService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderValidationService {

    private final CatalogServiceClient catalogServiceClient;

    public List<LoteResponse> validarItems(
            List<OrderItemDto> items, Long idComprador,
            Long idVendedor, String authHeader) {

        // Regla 1: No auto-compra en el marketplace
        if (idComprador.equals(idVendedor)) {
            throw new IllegalArgumentException(
                "El comprador no puede ser el mismo que el vendedor");
        }

        return items.stream().map(item -> {

            // Regla 2: Tipo de producto válido
            if (!"COSECHA_LOTE".equals(item.getTipoProducto())
                    && !"SUMINISTRO".equals(item.getTipoProducto())) {
                throw new IllegalArgumentException(
                    "Tipo de producto inválido: " + item.getTipoProducto()
                    + ". Debe ser COSECHA_LOTE o SUMINISTRO");
            }

            // Consulta el catálogo para obtener datos actuales del lote
            LoteResponse lote = catalogServiceClient.getLoteById(
                item.getIdProducto(), authHeader);

            // Regla 3: El lote debe estar disponible
            if (!"DISPONIBLE".equalsIgnoreCase(lote.estadoLote())) {
                throw new IllegalStateException(
                    "El lote " + item.getIdProducto()
                    + " no está disponible. Estado: " + lote.estadoLote());
            }

            // Regla 4: Stock suficiente
            if (lote.cantidadDisponible() == null
                    || lote.cantidadDisponible().compareTo(item.getCantidad()) < 0) {
                throw new InsufficientStockException(
                    item.getIdProducto(),
                    lote.cantidadDisponible() != null
                        ? lote.cantidadDisponible() : BigDecimal.ZERO,
                    item.getCantidad());
            }

            log.debug("Item validado: lote={}, cantidad={}, precio={}",
                item.getIdProducto(), item.getCantidad(), lote.precioUnitario());
            return lote;
        }).toList();
    }
}
```

> **Técnico:** `catalogServiceClient.getLoteById()` es una llamada Feign a `agroflex-catalog-service`. Si ese servicio no responde, Feign lanza `FeignException`, capturada por el `GlobalExceptionHandler` con código `AF-ORD-503`. Esto garantiza que un fallo en el catálogo no genere un error 500 confuso para el cliente.

> **Entendible:** Antes de crear la orden, el sistema consulta en tiempo real el catálogo para verificar: que el producto exista, que esté disponible para compra (no reservado ni vendido), y que haya suficiente cantidad. Todo esto ocurre en fracciones de segundo cuando el usuario hace clic en "Confirmar pedido".

### 9.4 Excepción de stock insuficiente

**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/exception/InsufficientStockException.java`

```java
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(
            Long idProducto, BigDecimal disponible, BigDecimal solicitada) {
        super(String.format(
            "Stock insuficiente para producto %d. Disponible: %s, Solicitado: %s",
            idProducto, disponible, solicitada));
    }
}
```

**Capturada en GlobalExceptionHandler:**

```java
// orders-service/GlobalExceptionHandler.java
@ExceptionHandler(InsufficientStockException.class)
public ResponseEntity<Map<String, Object>> handleInsufficientStock(InsufficientStockException ex) {
    return buildResponse(HttpStatus.CONFLICT, "AF-ORD-409", ex.getMessage());
    // HTTP 409 Conflict: el estado del servidor (stock) entra en conflicto con lo solicitado
}
```

### 9.5 Flujo best-effort: pago y generación de QR

Una vez validada y guardada la orden, el sistema intenta las operaciones complementarias sin fallar si alguna falla:

```java
// OrderService.java — después de guardar la orden en BD
List<String> warnings = new ArrayList<>();

// Paso 7: Retener pago en escrow — si falla, no rompe el flujo
try {
    String paymentIntentId = escrowService.retenerPago(ordenGuardada, authHeader);
    if (paymentIntentId != null) {
        ordenGuardada.setIdTransaccionPago(paymentIntentId);
        ordenGuardada.setEstadoPedido(EstadoPedido.CONFIRMADO);
    } else {
        warnings.add("El pago no pudo ser retenido. Debes completarlo más tarde.");
    }
} catch (Exception e) {
    log.warn("No se pudo retener pago para orden {}: {}", numeroOrden, e.getMessage());
    warnings.add("No se pudo retener el pago automáticamente. Debes completarlo más tarde.");
}

// Paso 8: Generar QR de entrega — si falla, no rompe el flujo
try {
    qrServiceClient.generateQr(qrRequest, authHeader);
} catch (Exception e) {
    log.warn("No se pudo generar QR para orden {}: {}", numeroOrden, e.getMessage());
    warnings.add("No se pudo generar el QR de entrega. Solicítalo manualmente.");
}
```

> **Técnico:** Este patrón es "best-effort" o tolerancia a fallos parciales. La orden se confirma en base de datos independientemente del estado del pago o del QR. Los errores no críticos se acumulan en una lista `warnings` que se devuelve en el `OrderResponse`, permitiendo al frontend mostrar avisos sin bloquear la operación principal.

> **Entendible:** Si el servicio de pagos tarda o falla en ese momento, la orden queda registrada de todas formas. El usuario verá un aviso "El pago no pudo ser retenido automáticamente" pero su pedido existe y puede completar el pago después. El sistema prefiere tener la orden registrada con pago pendiente, antes que perder toda la operación por un problema temporal.

### 9.6 Tabla de errores posibles al crear una orden

| Situación | Excepción | HTTP | Código | Mensaje |
|---|---|---|---|---|
| `idVendedor` no enviado | `@NotNull` falla | 400 | `AF-ORD-400` | `"El vendedor es requerido"` |
| Lista de items vacía | `@NotEmpty` falla | 400 | `AF-ORD-400` | `"Debe incluir al menos un producto"` |
| Comprador = Vendedor | `IllegalArgumentException` | 400 | `AF-ORD-400` | `"El comprador no puede ser el mismo que el vendedor"` |
| Tipo de producto inválido | `IllegalArgumentException` | 400 | `AF-ORD-400` | `"Tipo de producto inválido: ..."` |
| Lote no disponible (reservado/vendido) | `IllegalStateException` | 422 | `AF-ORD-422` | `"El lote X no está disponible. Estado: RESERVADO"` |
| Stock insuficiente | `InsufficientStockException` | 409 | `AF-ORD-409` | `"Stock insuficiente para producto X. Disponible: 2, Solicitado: 5"` |
| catalog-service no responde | `FeignException` | 503 | `AF-ORD-503` | `"Servicio externo no disponible temporalmente"` |

---

## 10. Acción: Pago con Stripe

**Interfaz:** Después de confirmar la orden, el usuario llena los datos de su tarjeta en el formulario de pago.

<!-- 📸 [Insertar captura de pantalla del formulario de tarjeta / pago aquí] -->

### 10.1 Validación del request de pago

**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/dto/CreatePaymentIntentRequest.java`

```java
public class CreatePaymentIntentRequest {

    @NotNull(message = "El ID de orden es requerido")
    private Long idOrden;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "1.00", message = "El monto mínimo es $1.00 MXN")
    private BigDecimal monto;

    @NotNull(message = "El ID del comprador es requerido")
    private Long idComprador;

    @NotNull(message = "El ID del vendedor es requerido")
    private Long idVendedor;
}
```

> **Técnico:** `@DecimalMin("1.00")` valida el monto antes de llamar a la API de Stripe. Stripe rechaza montos menores a su mínimo por divisa, y cada llamada fallida consume tiempo de red. Validar antes evita la llamada innecesaria.

### 10.2 Protección contra pagos duplicados

**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/service/EscrowService.java`

```java
@Transactional
public PaymentIntentResponse retenerPago(CreatePaymentIntentRequest request) {

    // Verificar idempotencia — no duplicar pagos para la misma orden
    if (transaccionRepository.existsByIdOrden(request.getIdOrden())) {
        throw new PaymentAlreadyProcessedException(request.getIdOrden());
        // código: AF-PAY-409 — HTTP 409 Conflict
    }

    // Crear PaymentIntent en Stripe
    PaymentIntent paymentIntent = stripeService.crearPaymentIntent(
        request.getMonto(), moneda, request.getIdOrden());

    // Guardar transacción — NUNCA loguear clientSecret
    Transaccion transaccion = Transaccion.builder()
        .idOrden(request.getIdOrden())
        .idComprador(request.getIdComprador())
        .idVendedor(request.getIdVendedor())
        .monto(request.getMonto())
        .montoComision(comision)
        .montoVendedor(montoVendedor)
        .estadoPago(EstadoPago.PENDIENTE)
        .stripePaymentIntentId(paymentIntent.getId())
        .stripeClientSecret(paymentIntent.getClientSecret())
        .build();

    transaccionRepository.save(transaccion);
    // ...
}
```

> **Técnico:** `PaymentAlreadyProcessedException` protege la idempotencia. Si el cliente intenta crear un segundo `PaymentIntent` para la misma orden (doble clic, reintento de red), el sistema detecta el registro existente y retorna 409 Conflict sin llamar a Stripe nuevamente.

> **Entendible:** Si el usuario hace doble clic en "Pagar" o si la red hace un reintento automático, el sistema detecta que ya existe un pago en proceso para esa orden y no crea un segundo cobro. Esto protege al usuario de ser cobrado dos veces.

### 10.3 Integración segura con Stripe

**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/service/StripeService.java`

```java
public PaymentIntent crearPaymentIntent(BigDecimal monto, String moneda, Long idOrden) {
    // Stripe trabaja en centavos: $100.00 MXN → 10000
    long montoCentavos = monto.multiply(new BigDecimal("100"))
        .setScale(0, RoundingMode.HALF_UP)
        .longValue();

    try {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(montoCentavos)
            .setCurrency(moneda.toLowerCase())
            .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC)
            .putMetadata("idOrden", idOrden.toString())
            .putMetadata("plataforma", "AgroFlex")
            .setDescription("Pago AgroFlex — Orden " + idOrden)
            .build();

        return PaymentIntent.create(params);

    } catch (StripeException e) {
        log.error("Error creando PaymentIntent para orden {}: {}", idOrden, e.getMessage());
        throw new StripeIntegrationException("crearPaymentIntent", e.getMessage());
        // Envuelve el error de Stripe antes de exponerlo al cliente
    }
}
```

**Captura segura del error de Stripe:**

```java
// payments-service/GlobalExceptionHandler.java
@ExceptionHandler(StripeIntegrationException.class)
public ResponseEntity<Map<String, Object>> handleStripe(StripeIntegrationException ex) {
    // El detalle real (puede incluir datos sensibles de Stripe) solo va al log interno
    log.error("Error de integración Stripe: {}", ex.getMessage());
    // El cliente recibe solo un mensaje genérico y seguro
    return build(HttpStatus.BAD_GATEWAY, "AF-PAY-502",
        "Error al comunicarse con el procesador de pago");
}
```

> **Técnico:** `StripeIntegrationException` actúa como envoltura de seguridad. Los mensajes de error de Stripe pueden incluir información sensible (claves parciales, rutas internas). Al envolver el error, el `GlobalExceptionHandler` puede loguear el detalle internamente sin exponerlo al cliente.

> **Entendible:** Si Stripe tiene un problema (caída del servicio, tarjeta rechazada por su sistema), el usuario ve "Error al comunicarse con el procesador de pago". Los detalles técnicos van al log interno para que el equipo pueda investigar, pero nunca llegan al navegador.

### 10.4 Tabla de errores posibles durante el pago

| Situación | Excepción | HTTP | Código | Mensaje al cliente |
|---|---|---|---|---|
| `idOrden` no enviado | `@NotNull` falla | 400 | `AF-PAY-400` | `"El ID de orden es requerido"` |
| Monto menor a $1 MXN | `@DecimalMin` falla | 400 | `AF-PAY-400` | `"El monto mínimo es $1.00 MXN"` |
| Pago ya procesado para esa orden | `PaymentAlreadyProcessedException` | 409 | `AF-PAY-409` | `"Ya existe una transacción de pago para la orden ID: X"` |
| Error al comunicarse con Stripe | `StripeIntegrationException` | 502 | `AF-PAY-502` | `"Error al comunicarse con el procesador de pago"` |
| Webhook de Stripe con firma inválida | `SignatureVerificationException` | 400 | `AF-PAY-400` | `"Firma del webhook inválida"` |
| orders-service no responde | `FeignException` | 503 | `AF-PAY-503` | `"Servicio externo no disponible"` |

---

## 11. Acción: Cambiar estado de una orden

**Interfaz:** El vendedor o el comprador cambia el estado de la orden desde el panel de gestión de pedidos.

<!-- 📸 [Insertar captura de pantalla del panel de gestión de órdenes aquí] -->

### 11.1 GlobalExceptionHandler del orders-service

**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleOrderNotFound(OrderNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "AF-ORD-404", ex.getMessage());
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientStock(InsufficientStockException ex) {
        return buildResponse(HttpStatus.CONFLICT, "AF-ORD-409", ex.getMessage());
    }

    // Transición de estado inválida → 422
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "AF-ORD-422", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "AF-ORD-400", ex.getMessage());
    }

    @ExceptionHandler(feign.FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeign(feign.FeignException ex) {
        log.error("Error comunicando con servicio externo: {}", ex.getMessage());
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, "AF-ORD-503",
            "Servicio externo no disponible temporalmente");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("Error interno en orders-service: {}", ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "AF-ORD-500",
            "Error interno del servidor");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status, String codigo, String mensaje) {
        return ResponseEntity.status(status).body(Map.of(
            "codigo",    codigo,
            "mensaje",   mensaje,
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
```

### 11.2 Máquina de estados y validación de transiciones

```java
// OrderService.java — actualizarEstado()

OrdenTransaccion orden = ordenRepository.findById(idOrden)
    .orElseThrow(() -> new OrderNotFoundException(idOrden));  // → 404 si no existe

EstadoPedido estadoActual = orden.getEstadoPedido();
EstadoPedido estadoNuevo;

try {
    estadoNuevo = EstadoPedido.valueOf(dto.getNuevoEstado().toUpperCase());
} catch (IllegalArgumentException e) {
    throw new IllegalArgumentException(
        "Estado inválido: " + dto.getNuevoEstado());  // → 400
}

// Verificar que la transición sea permitida por la máquina de estados
Set<EstadoPedido> transicionesPermitidas =
    TRANSICIONES_VALIDAS.getOrDefault(estadoActual, Set.of());

if (!transicionesPermitidas.contains(estadoNuevo)) {
    throw new IllegalStateException(
        "Transición inválida: " + estadoActual + " → " + estadoNuevo
        + ". Permitidas: " + transicionesPermitidas);  // → 422
}

// Motivo obligatorio al cancelar o disputar
if ((estadoNuevo == EstadoPedido.CANCELADO || estadoNuevo == EstadoPedido.DISPUTADO)
        && (dto.getMotivo() == null || dto.getMotivo().isBlank())) {
    throw new IllegalArgumentException(
        "El motivo es obligatorio para CANCELADO o DISPUTADO");  // → 400
}

orden.setEstadoPedido(estadoNuevo);
ordenRepository.save(orden);

// Si llega a ENTREGADO, liberar escrow automáticamente (best-effort)
if (estadoNuevo == EstadoPedido.ENTREGADO) {
    try {
        escrowService.liberarPago(idOrden, authHeader);
    } catch (Exception e) {
        log.warn("No se pudo liberar pago para orden {}: {}",
            orden.getNumeroOrden(), e.getMessage());
    }
}
```

> **Técnico:** `TRANSICIONES_VALIDAS` es un `Map<EstadoPedido, Set<EstadoPedido>>` que define la máquina de estados. Solo las transiciones explícitamente definidas son permitidas. Cuando la orden llega a `ENTREGADO`, el sistema libera el escrow automáticamente (best-effort, no bloquea si falla).

> **Entendible:** La orden sigue un camino definido de estados: no se puede marcar como "entregada" si nunca estuvo "en tránsito". El sistema verifica que cada cambio de estado sea lógicamente posible. Si el vendedor intenta cancelar una orden que ya fue entregada, el sistema lo rechaza explicando qué transiciones sí son válidas.

### 11.3 Cancelación de una orden

```java
// OrderService.java — cancelarOrden()
Set<EstadoPedido> cancelables = EnumSet.of(
    EstadoPedido.PENDIENTE, EstadoPedido.CONFIRMADO, EstadoPedido.EN_TRANSITO);

if (!cancelables.contains(orden.getEstadoPedido())) {
    throw new IllegalStateException(
        "No se puede cancelar una orden en estado: " + orden.getEstadoPedido());
    // → 422 Unprocessable Entity
}
```

> **Entendible:** Una orden solo puede cancelarse si está en PENDIENTE, CONFIRMADO o EN_TRANSITO. Si ya fue entregada o completada, no hay cancelación posible — igual que en la vida real.

---

## 12. Acción: Dejar una reseña

**Interfaz:** Después de recibir un pedido, el comprador califica al vendedor con 1 a 5 estrellas.

<!-- 📸 [Insertar captura de pantalla del formulario de reseña / calificación aquí] -->

### 12.1 Validaciones del formulario

**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/dto/CrearReseñaRequest.java`

```java
public class CrearReseñaRequest {

    @NotNull
    private Long idOrden;

    @NotNull
    private Long idCalificado;

    @NotNull
    private String tipoReseña;   // "COMPRADOR" o "PRODUCTOR"

    @NotNull
    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 5, message = "La puntuación máxima es 5")
    private Integer puntuacion;

    @Size(max = 1000)
    private String comentario;   // Opcional
}
```

> **Entendible:** La puntuación debe ser entre 1 y 5 estrellas — el sistema rechaza cualquier valor fuera de ese rango. El comentario es opcional pero tiene un límite de 1000 caracteres.

### 12.2 Validación de reseña duplicada

```java
// UserService.java — crearReseña()
if (reseñaRepository.existsByIdUsuarioAndIdOrden(idUsuario, request.getIdOrden())) {
    throw new ReseñaDuplicadaException(request.getIdOrden());
    // código: AF-USR-409 — HTTP 409 Conflict
    // mensaje: "Ya existe una reseña tuya para la orden X"
}
```

> **Técnico:** `ReseñaDuplicadaException` protege la integridad del sistema de reputación. Si un comprador pudiera dejar múltiples reseñas para la misma transacción, podría inflar o hundir artificialmente la puntuación de un vendedor.

> **Entendible:** Solo se puede dejar una reseña por pedido. Si el usuario intenta calificar una segunda vez la misma compra, el sistema lo detecta y rechaza la operación con un mensaje claro.

---

## 13. Seguridad transversal: JWT y roles

Todas las rutas protegidas pasan primero por el Gateway, que verifica el JWT antes de enrutar la petición al microservicio correspondiente.

<!-- 📸 [Insertar diagrama o captura del flujo de login → JWT → acceso aquí] -->

### 13.1 Rutas públicas (sin JWT requerido)

| Ruta | Por qué es pública |
|---|---|
| `POST /api/auth/login` | Punto de entrada para obtener el token |
| `POST /api/auth/register` | Registro de nuevos usuarios |
| `POST /api/auth/refresh` | Renovación del token |
| `POST /api/auth/forgot-password` | Recuperación de cuenta |
| `POST /api/auth/reset-password` | Reset de contraseña |
| `POST /api/auth/google` | Login con Google OAuth |
| `GET /api/catalog/**` | Catálogo visible a todos |
| `GET /api/productos/**` | Listado de productos |
| `GET /api/geolocation/**` | Datos geográficos de referencia |
| `GET /api/notifications/stream` | SSE — el token viaja como query param `?token=` |

> **Técnico — SSE:** El protocolo Server-Sent Events no permite enviar headers personalizados desde el navegador (limitación del browser). Por eso el Gateway acepta el JWT también como parámetro de URL `?token={JWT}` para ese endpoint, y lo convierte al formato `Bearer` estándar internamente.

### 13.2 Control de acceso por rol (`@PreAuthorize`)

| Endpoint | Roles permitidos | Qué pasa si un rol no permitido accede |
|---|---|---|
| `POST /api/orders` | `COMPRADOR, PRODUCTOR, PROVEEDOR, EMPAQUE` | 403 — ADMIN no puede comprar |
| `GET /api/orders/stats` | `ADMIN` | 403 para cualquier otro rol |
| `POST /api/orders/{id}/release` | `ADMIN` | 403 — liberación manual de escrow |
| `POST /api/catalog/lotes` | `PRODUCTOR, INVERNADERO` | 403 para COMPRADOR |
| `DELETE /api/catalog/lotes/{id}` | `PRODUCTOR, INVERNADERO, ADMIN` | 403 para COMPRADOR |
| `GET /api/users` (listado) | `ADMIN` | 403 para usuarios comunes |
| `PATCH /api/users/{id}/estado` | `ADMIN` | 403 para cualquier otro rol |

### 13.3 Por qué CSRF está deshabilitado

```java
// SecurityConfig de cada microservicio
http.csrf(csrf -> csrf.disable())
    .sessionManagement(sm ->
        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

> **Técnico:** Los ataques CSRF explotan cookies de sesión. Como AgroFlex usa autenticación stateless con JWT en el header `Authorization`, no hay cookies de sesión que atacar. Deshabilitar CSRF es la práctica estándar en APIs REST con JWT.

> **Entendible:** El sistema no usa cookies para recordar al usuario — usa un token que el frontend envía en cada petición. Esto hace innecesario el mecanismo CSRF y además hace el sistema compatible con aplicaciones móviles y otros clientes que no manejan cookies.

---

## 14. Convención de códigos de error

### Formato: `AF-{SERVICIO}-{HTTPCODE}`

| Prefijo | Microservicio |
|---|---|
| `AF-CAT-` | agroflex-catalog-service |
| `AF-ORD-` | agroflex-orders-service |
| `AF-PAY-` | agroflex-payments-service |
| `AF-USR-` | agroflex-users-service |
| `AF-ADM-` | agroflex-admin-service |

### Significado de cada código HTTP

| Código HTTP | Cuándo ocurre | Ejemplo en AgroFlex |
|---|---|---|
| **400 Bad Request** | Dato mal formateado o regla de negocio con dato del cliente | Correo sin `@`, contraseña sin mayúscula, correo ya registrado |
| **401 Unauthorized** | JWT ausente, vencido o inválido | Petición sin `Authorization: Bearer ...` |
| **403 Forbidden** | JWT válido pero el rol no tiene permiso | COMPRADOR intentando publicar un lote |
| **404 Not Found** | Recurso no existe en la base de datos | Orden con ID inexistente, lote eliminado |
| **409 Conflict** | La operación entra en conflicto con el estado actual | Stock insuficiente, pago ya procesado, reseña duplicada |
| **422 Unprocessable Entity** | Datos válidos pero transición de estado imposible | Intentar ir de ENTREGADO a PENDIENTE |
| **500 Internal Server Error** | Error no esperado del servidor | NullPointerException, error de base de datos |
| **502 Bad Gateway** | El servicio recibió respuesta inválida de un upstream | Error en la API de Stripe |
| **503 Service Unavailable** | Microservicio dependiente no responde (Feign timeout) | catalog-service no disponible al crear orden |

---

*Fin del reporte técnico — AgroFlex SOA — Abril 2026*
# Reporte Técnico: Validaciones y Manejo de Excepciones
## Sistema AgroFlex SOA — Orientado a la Interacción del Usuario

**Elaborado por:** Análisis del código fuente  
**Fecha:** Abril 2026  
**Sistema:** AgroFlex SOA — Microservicios Spring Boot 3.2.x

> **Cómo leer este reporte:** Cada sección corresponde a una acción concreta que el usuario realiza en la interfaz. Para cada acción se muestra: el fragmento de código real que la valida, qué falla puede ocurrir, y qué respuesta recibe el usuario. Las explicaciones se presentan en doble registro: **técnico** (cómo funciona el código) y **entendible** (qué significa para el usuario).

---

## Índice

1. [Arquitectura General del Manejo de Errores](#1-arquitectura-general-del-manejo-de-errores)
2. [Acción: Registro de usuario](#2-acción-registro-de-usuario)
3. [Acción: Inicio de sesión](#3-acción-inicio-de-sesión)
4. [Acción: Login con Google](#4-acción-login-con-google)
5. [Acción: Recuperar contraseña](#5-acción-recuperar-contraseña)
6. [Acción: Editar perfil](#6-acción-editar-perfil)
7. [Acción: Explorar el catálogo](#7-acción-explorar-el-catálogo)
8. [Acción: Publicar un lote o producto](#8-acción-publicar-un-lote-o-producto)
9. [Acción: Crear una orden / Comprar](#9-acción-crear-una-orden--comprar)
10. [Acción: Pago con Stripe](#10-acción-pago-con-stripe)
11. [Acción: Cambiar estado de una orden](#11-acción-cambiar-estado-de-una-orden)
12. [Acción: Dejar una reseña](#12-acción-dejar-una-reseña)
13. [Seguridad transversal: JWT y roles](#13-seguridad-transversal-jwt-y-roles)
14. [Convención de códigos de error](#14-convención-de-códigos-de-error)

---

## 1. Arquitectura General del Manejo de Errores

### Flujo general de una excepción

```
Request HTTP
    │
    ▼
Gateway (JwtAuthFilter)
    │  ← 401 Unauthorized si token inválido o ausente
    ▼
Microservicio: SecurityFilterChain
    │  ← 403 Forbidden si el rol no tiene permiso
    ▼
Controller (@Valid en @RequestBody)
    │  ← 400 Bad Request si validación de campo falla (MethodArgumentNotValidException)
    ▼
Service (validaciones de negocio)
    │  ← IllegalArgumentException → 400
    │  ← IllegalStateException    → 422
    │  ← Excepción personalizada  → código propio
    ▼
GlobalExceptionHandler (@RestControllerAdvice)
    │
    ▼
Respuesta JSON estructurada al cliente
```

### Formato de respuesta de error

Todos los microservicios devuelven errores en el mismo formato JSON:

```json
{
  "codigo":    "AF-ORD-404",
  "mensaje":   "Orden no encontrada con ID: 99",
  "timestamp": "2026-04-09T18:30:00.123456"
}
```

El campo `codigo` identifica de forma única el tipo de error: qué servicio lo originó y qué significa. Esto facilita el diagnóstico sin exponer detalles internos del servidor.

---

## 3. Excepciones Personalizadas

### 3.1 agroflex-catalog-service

#### `LoteNoEncontradoException`
- **Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/exception/LoteNoEncontradoException.java`
- **Hereda de:** `RuntimeException`
- **Anotación:** `@ResponseStatus(HttpStatus.NOT_FOUND)`
- **Atributo:** `codigo = "AF-CAT-404"`
- **Por qué existe:** Cuando se solicita un lote por ID que no existe en la base de datos o fue eliminado (soft delete). Se lanza desde `CosechaService` en las operaciones `obtenerLotePorId`, `actualizarLote`, `cambiarEstado` y `eliminarLote`.
- **Mensajes:**
  - `"Lote con ID {idLote} no encontrado o fue eliminado"`
  - Constructor con mensaje personalizado para otros casos
- **Dónde se lanza:**

| Archivo | Operación | Condición |
|---|---|---|
| `CosechaService.java:44` | `obtenerLotePorId()` | `findById()` retorna vacío |
| `CosechaService.java:90` | `actualizarLote()` | Lote no existe o fue eliminado |
| `CosechaService.java:110` | `cambiarEstado()` | Lote no encontrado |
| `CosechaService.java:119` | `eliminarLote()` | Lote no encontrado |

---

### 3.2 agroflex-orders-service

#### `OrderNotFoundException`
- **Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/exception/OrderNotFoundException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 404 (via GlobalExceptionHandler)
- **Código:** `AF-ORD-404`
- **Por qué existe:** Centraliza el caso de "orden no encontrada" en lugar de lanzar excepciones genéricas. Se usa tanto en consultas por ID como por número de orden.
- **Mensajes:**
  - `"Orden no encontrada con ID: {id}"`
  - `"Orden no encontrada con número: {numeroOrden}"`
- **Dónde se lanza:**

| Archivo | Método | Condición |
|---|---|---|
| `OrderService.java` | `obtenerOrden()` | `findById()` retorna vacío |
| `OrderService.java` | `actualizarEstado()` | Orden no existe |
| `OrderService.java` | `cancelarOrden()` | Orden no existe |
| `EscrowService.java` | `liberarPago()` | Orden no encontrada |
| `EscrowService.java` | `reembolsarPago()` | Orden no encontrada |

#### `InsufficientStockException`
- **Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/exception/InsufficientStockException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 409 Conflict (via GlobalExceptionHandler)
- **Código:** `AF-ORD-409`
- **Por qué existe:** Distingue el error de stock insuficiente de los demás errores de validación. Un 409 Conflict es semánticamente correcto: el estado del servidor (stock) entra en conflicto con la cantidad solicitada.
- **Mensaje:** `"Stock insuficiente para producto {id}. Disponible: {disponible}, Solicitado: {solicitado}"`
- **Dónde se lanza:**

| Archivo | Método | Condición |
|---|---|---|
| `OrderValidationService.java:56` | `validarItems()` | `cantidadDisponible < cantidadSolicitada` |

---

### 3.3 agroflex-payments-service

#### `PaymentNotFoundException`
- **Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/exception/PaymentNotFoundException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 404 (via GlobalExceptionHandler)
- **Código:** `AF-PAY-404`
- **Por qué existe:** Diferencia el caso de "pago no encontrado" de cualquier otro error. Se usa cuando se consulta el estado de un pago que no fue procesado o el ID de orden no existe.
- **Mensajes:**
  - `"Transacción no encontrada para orden ID: {idOrden}"`
  - `"Transacción no encontrada con {field}: {value}"`

#### `PaymentAlreadyProcessedException`
- **Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/exception/PaymentAlreadyProcessedException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 409 Conflict (via GlobalExceptionHandler)
- **Código:** `AF-PAY-409`
- **Por qué existe:** Protege la idempotencia del sistema de pagos. Si un cliente intenta crear un segundo PaymentIntent para la misma orden (doble clic, reintento de red), el sistema rechaza la operación en lugar de cobrar dos veces.
- **Mensaje:** `"Ya existe una transacción de pago para la orden ID: {idOrden}"`
- **Dónde se lanza:**

| Archivo | Método | Condición |
|---|---|---|
| `EscrowService.java (payments):38` | `crearPaymentIntent()` | Ya existe registro para ese `idOrden` |

#### `StripeIntegrationException`
- **Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/exception/StripeIntegrationException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 502 Bad Gateway (via GlobalExceptionHandler)
- **Código:** `AF-PAY-502`
- **Por qué existe:** Envuelve los errores de la API de Stripe (`com.stripe.exception.StripeException`) para NO exponer detalles internos (claves, rutas, mensajes de Stripe) al cliente. El GlobalExceptionHandler intercepta esta excepción y devuelve un mensaje genérico seguro: `"Error al comunicarse con el procesador de pago"`.
- **Mensaje interno:** `"Error en operación Stripe [{operation}]: {mensaje de Stripe}"`
- **Dónde se lanza:**

| Archivo | Método | Operación Stripe |
|---|---|---|
| `StripeService.java:53` | `crearPaymentIntent()` | `PaymentIntent.create()` |
| `StripeService.java:68` | `confirmarPago()` | `PaymentIntent.confirm()` |
| `StripeService.java:106` | `reembolsar()` | `Refund.create()` |

---

### 3.4 agroflex-users-service

#### `UsuarioNoEncontradoException`
- **Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/exception/UsuarioNoEncontradoException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 404 (via GlobalExceptionHandler)
- **Código:** `AF-USR-404`
- **Por qué existe:** Centraliza el caso de usuario no encontrado en perfiles, actualizaciones y consultas de administrador.
- **Mensajes:**
  - `"Usuario con id {idUsuario} no encontrado"`
  - Constructor con mensaje libre para casos especiales
- **Dónde se lanza:**

| Archivo | Operación |
|---|---|
| `UserService.java:37` | `obtenerMiPerfil()` |
| `UserService.java:44` | `actualizarPerfil()` |
| `UserService.java:64` | `obtenerPerfilPublico()` |
| `UserService.java:148` | `activar/desactivarUsuario()` |
| `UserService.java:156` | `eliminarUsuario()` |

#### `ReseñaDuplicadaException`
- **Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/exception/ReseñaDuplicadaException.java`
- **Hereda de:** `RuntimeException`
- **HTTP resultante:** 409 Conflict (via GlobalExceptionHandler)
- **Código:** `AF-USR-409`
- **Por qué existe:** Impide que un usuario califique dos veces la misma transacción, lo que distorsionaría el sistema de reputación de productores.
- **Mensaje:** `"Ya existe una reseña tuya para la orden {idOrden}"`
- **Dónde se lanza:**

| Archivo | Método | Condición |
|---|---|---|
| `UserService.java:108` | `crearReseña()` | Ya existe reseña del usuario para ese `idOrden` |

---

## 4. Manejadores Globales de Excepciones

Cada microservicio tiene su propio `@RestControllerAdvice`. Todos siguen la misma estructura: capturan la excepción, determinan el código HTTP y devuelven JSON con `codigo`, `mensaje` y `timestamp`.

### 4.1 agroflex-auth-service — `GlobalExceptionHandler`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/exception/GlobalExceptionHandler.java`

| Excepción capturada | Código HTTP | Código AgroFlex | Mensaje al cliente |
|---|---|---|---|
| `BadCredentialsException` | 401 | `UNAUTHORIZED` | `"Correo o contraseña incorrectos"` |
| `UsernameNotFoundException` | 404 | `USER_NOT_FOUND` | `"Usuario no encontrado"` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` | `"Error en validación de datos"` + mapa de campos |
| `IllegalArgumentException` | 400 | `BAD_REQUEST` | Mensaje original de la excepción |
| `Exception` (genérica) | 500 | `INTERNAL_SERVER_ERROR` | `"Error interno del servidor"` |

**Nota:** La respuesta de validación incluye un objeto `details.fields` con los nombres de campo y sus mensajes de error individuales, útil para resaltar campos en el formulario del frontend.

---

### 4.2 agroflex-catalog-service — `GlobalExceptionHandler`
**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/exception/GlobalExceptionHandler.java`

| Excepción capturada | Código HTTP | Mensaje al cliente |
|---|---|---|
| `ResponseStatusException` | Según excepción | Mensaje de la excepción (`getReason()`) |
| `AccessDeniedException` | 403 | `"No tienes permiso para realizar esta acción"` |
| `MethodArgumentNotValidException` | 400 | Mapa `{campo: mensaje}` |
| `Exception` (genérica) | 500 | `"Error interno del servidor"` |

**Nota:** `LoteNoEncontradoException` usa `@ResponseStatus` directo en la clase, por lo que Spring Boot la resuelve sin pasar por el handler.

---

### 4.3 agroflex-orders-service — `GlobalExceptionHandler`
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/exception/GlobalExceptionHandler.java`

| Excepción capturada | Código HTTP | Código AgroFlex | Mensaje al cliente |
|---|---|---|---|
| `OrderNotFoundException` | 404 | `AF-ORD-404` | Mensaje original |
| `InsufficientStockException` | 409 | `AF-ORD-409` | Mensaje original |
| `IllegalStateException` | 422 | `AF-ORD-422` | Mensaje original |
| `IllegalArgumentException` | 400 | `AF-ORD-400` | Mensaje original |
| `MethodArgumentNotValidException` | 400 | `AF-ORD-400` | Todos los campos concatenados |
| `feign.FeignException` | 503 | `AF-ORD-503` | `"Servicio externo no disponible temporalmente"` |
| `RuntimeException` | 500 | `AF-ORD-500` | `"Error interno del servidor"` |

**Nota importante:** `FeignException` se maneja con 503 (Service Unavailable) para indicar al frontend que el problema es temporal, no un error permanente. El mensaje genérico protege la topología interna de la red de microservicios.

---

### 4.4 agroflex-payments-service — `GlobalExceptionHandler`
**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/exception/GlobalExceptionHandler.java`

| Excepción capturada | Código HTTP | Código AgroFlex | Mensaje al cliente |
|---|---|---|---|
| `PaymentNotFoundException` | 404 | `AF-PAY-404` | Mensaje original |
| `PaymentAlreadyProcessedException` | 409 | `AF-PAY-409` | Mensaje original |
| `StripeIntegrationException` | 502 | `AF-PAY-502` | `"Error al comunicarse con el procesador de pago"` |
| `SignatureVerificationException` | 400 | `AF-PAY-400` | `"Firma del webhook inválida"` |
| `IllegalStateException` | 422 | `AF-PAY-422` | Mensaje original |
| `IllegalArgumentException` | 400 | `AF-PAY-400` | Mensaje original |
| `MethodArgumentNotValidException` | 400 | `AF-PAY-400` | Todos los campos |
| `feign.FeignException` | 503 | `AF-PAY-503` | `"Servicio externo no disponible temporalmente"` |
| `RuntimeException` | 500 | `AF-PAY-500` | `"Error interno del servidor"` |

**Nota de seguridad:** `StripeIntegrationException` devuelve un 502 con mensaje genérico. El detalle real (mensaje de la API de Stripe, que puede incluir información sensible) solo se escribe en el log del servidor, nunca en la respuesta HTTP.

---

### 4.5 agroflex-users-service — `GlobalExceptionHandler`
**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/exception/GlobalExceptionHandler.java`

| Excepción capturada | Código HTTP | Código AgroFlex | Mensaje al cliente |
|---|---|---|---|
| `UsuarioNoEncontradoException` | 404 | `AF-USR-404` | Mensaje de la excepción |
| `ReseñaDuplicadaException` | 409 | `AF-USR-409` | Mensaje de la excepción |
| `AccessDeniedException` | 403 | `AF-USR-403` | `"No tienes permiso para esta acción"` |
| `MethodArgumentNotValidException` | 400 | _(campo por campo)_ | Mapa `{campo: mensaje}` |
| `Exception` (genérica) | 500 | `AF-USR-500` | `"Error interno del servidor"` |

---

## 5. Validaciones de Entrada (DTOs)

Las validaciones de entrada se aplican mediante la anotación `@Valid` en el parámetro `@RequestBody` de los controllers. Spring activa el Bean Validation (Jakarta Validation API) y lanza `MethodArgumentNotValidException` automáticamente si algún campo falla.

### 5.1 agroflex-auth-service

#### `RegisterRequest`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/RegisterRequest.java`  
**Usado en:** `POST /api/auth/register`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `nombre` | `@NotBlank` | "El nombre es requerido" |
| `apellidos` | `@NotBlank` | "Los apellidos son requeridos" |
| `correo` | `@NotBlank`, `@Email` | "El correo es requerido" / "El correo debe ser válido" |
| `password` | `@NotBlank`, `@Size(min=8)`, `@Pattern(...)` | "La contraseña debe tener al menos 8 caracteres" / "Debe incluir al menos 1 mayúscula y 1 número" |
| `telefono` | `@Pattern(regex="^[+]?[0-9]{7,20}$")` | "El teléfono debe tener entre 7 y 20 dígitos" |

**Por qué:** El patrón de contraseña evita contraseñas débiles desde el primer registro. El patrón de teléfono acepta números internacionales con `+` pero rechaza letras u otros caracteres.

#### `LoginRequest`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/LoginRequest.java`  
**Usado en:** `POST /api/auth/login`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `correo` | `@NotBlank`, `@Email` | "El correo es requerido" / "El correo debe ser válido" |
| `password` | `@NotBlank`, `@Size(min=8)` | "La contraseña es requerida" / "La contraseña debe tener al menos 8 caracteres" |

**Por qué:** El `@Size(min=8)` en login evita búsquedas en base de datos cuando la contraseña enviada es claramente inválida (optimización + validación semántica).

#### `ForgotPasswordRequest`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/ForgotPasswordRequest.java`  
**Usado en:** `POST /api/auth/forgot-password`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `correo` | `@NotBlank`, `@Email` | "El correo es requerido" / "El correo debe ser válido" |

#### `ResetPasswordRequest`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/ResetPasswordRequest.java`  
**Usado en:** `POST /api/auth/reset-password`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `token` | `@NotBlank` | "El token es requerido" |
| `newPassword` | `@NotBlank`, `@Size(min=8)`, `@Pattern(...)` | Igual que registro |

#### `SolicitudInsigniaRequest`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/dto/SolicitudInsigniaRequest.java`  
**Usado en:** `POST /api/auth/solicitar-insignia`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `rol` | `@NotBlank` | "El rol es requerido" |
| `nombreNegocio` | `@NotBlank` | "El nombre del negocio es requerido" |
| `municipio` | `@NotBlank` | "El municipio es requerido" |
| `estado` | `@NotBlank` | "El estado es requerido" |

---

### 5.2 agroflex-catalog-service

#### `LoteRequest`
**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/dto/LoteRequest.java`  
**Usado en:** `POST /api/catalog/lotes`, `PUT /api/catalog/lotes/{id}`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `nombreProducto` | `@NotBlank`, `@Size(max=200)` | "El nombre del producto es obligatorio" |
| `descripcion` | `@Size(max=5000)` | — |
| `precio` | `@NotNull`, `@DecimalMin(value="0.01")` | "El precio es obligatorio" / "El precio debe ser mayor a 0" |
| `ubicacion` | `@NotBlank`, `@Size(max=500)` | "La ubicación es obligatoria" |
| `cantidadDisponible` | `@NotNull`, `@DecimalMin(value="0.001")` | "La cantidad disponible es obligatoria" / "La cantidad debe ser mayor a 0" |
| `unidadVenta` | `@NotBlank`, `@Size(max=30)` | "La unidad de venta es obligatoria" |
| `contacto` | `@Size(max=200)` | — |

**Por qué:** `@DecimalMin("0.001")` en `cantidadDisponible` permite cantidades muy pequeñas (ej. 0.5 kg de semillas) sin llegar a cero, previniendo publicaciones con stock vacío.

#### `CrearProductoRequest`
**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/dto/CrearProductoRequest.java`  
**Usado en:** `POST /api/productos`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `tipo` | `@NotBlank`, `@Pattern(regexp="cosecha\|suministro")` | "El tipo es requerido" / "tipo debe ser 'cosecha' o 'suministro'" |
| `nombre` | `@NotBlank`, `@Size(max=200)` | "El nombre es requerido" |
| `descripcion` | `@Size(max=2000)` | — |
| `precio` | `@NotNull`, `@DecimalMin(value="0.01")` | "El precio es requerido" / "El precio debe ser mayor a 0" |
| `unidad` | `@NotBlank`, `@Size(max=50)` | "La unidad es requerida" |
| `stock` | `@NotNull`, `@Min(value=0)` | "El stock es requerido" / "El stock no puede ser negativo" |
| `municipio` | `@NotBlank` | "El municipio es requerido" |
| `estadoRepublica` | `@NotBlank` | "El estado es requerido" |

---

### 5.3 agroflex-orders-service

#### `CreateOrderRequest`
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/dto/CreateOrderRequest.java`  
**Usado en:** `POST /api/orders`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `idVendedor` | `@NotNull` | "El vendedor es requerido" |
| `items` | `@NotEmpty`, `@Valid` | "Debe incluir al menos un producto" |

#### `OrderItemDto` (validado en cascada por `@Valid` en `CreateOrderRequest`)
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/dto/OrderItemDto.java`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `idProducto` | `@NotNull` | "El ID del producto es requerido" |
| `tipoProducto` | `@NotBlank` | "El tipo de producto es requerido" |
| `cantidad` | `@NotNull`, `@DecimalMin(value="0.01")` | "La cantidad es requerida" / "La cantidad debe ser mayor a 0" |

**Por qué `@Valid` en cascada:** La lista `items` lleva `@Valid` para que cada `OrderItemDto` dentro de la lista sea validado individualmente. Sin esto, solo se validaría que la lista no esté vacía, pero no el contenido de cada elemento.

#### `OrderStatusUpdateDto`
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/dto/OrderStatusUpdateDto.java`  
**Usado en:** `PUT /api/orders/{orderId}/status`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `nuevoEstado` | `@NotBlank` | "El nuevo estado es requerido" |

---

### 5.4 agroflex-payments-service

#### `CreatePaymentIntentRequest`
**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/dto/CreatePaymentIntentRequest.java`  
**Usado en:** `POST /api/payments/create-intent`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `idOrden` | `@NotNull` | "El ID de orden es requerido" |
| `monto` | `@NotNull`, `@DecimalMin(value="1.00")` | "El monto es requerido" / "El monto mínimo es $1.00 MXN" |
| `idComprador` | `@NotNull` | "El ID del comprador es requerido" |
| `idVendedor` | `@NotNull` | "El ID del vendedor es requerido" |

**Por qué `@DecimalMin("1.00")`:** Stripe rechaza montos menores a su mínimo por divisa. Validar antes evita una llamada fallida a la API externa.

---

### 5.5 agroflex-users-service

#### `ActualizarPerfilRequest`
**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/dto/ActualizarPerfilRequest.java`  
**Usado en:** `PUT /api/users/me`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `nombre` | `@Size(max=120)` | — |
| `apellidos` | `@Size(max=120)` | — |
| `telefono` | `@Pattern(regex="^[+]?[0-9]{7,20}$")` | "Teléfono inválido" |
| `direccion` | `@Size(max=255)` | — |
| `estadoRepublica` | `@Size(max=80)` | — |
| `municipio` | `@Size(max=80)` | — |

#### `CrearReseñaRequest`
**Archivo:** `agroflex-users-service/src/main/java/com/agroflex/users/dto/CrearReseñaRequest.java`  
**Usado en:** `POST /api/users/me/reseñas`

| Campo | Anotaciones | Mensaje de error |
|---|---|---|
| `idOrden` | `@NotNull` | — |
| `idCalificado` | `@NotNull` | — |
| `tipoReseña` | `@NotNull` | — |
| `puntuacion` | `@NotNull`, `@Min(1)`, `@Max(5)` | Puntuación entre 1 y 5 |
| `comentario` | `@Size(max=1000)` | — |

---

### 5.6 agroflex-qr-service

#### `QrGenerateRequest`
**Archivo:** `agroflex-qr-service/src/main/java/com/agroflex/qr/dto/QrGenerateRequest.java`  
**Usado en:** `POST /api/qr/generate` (llamado interno desde orders-service)

| Campo | Anotaciones |
|---|---|
| `idOrden` | `@NotNull` |
| `numeroOrden` | `@NotNull` |
| `idVendedor` | `@NotNull` |
| `idComprador` | `@NotNull` |

#### `QrValidateRequest`
**Archivo:** `agroflex-qr-service/src/main/java/com/agroflex/qr/dto/QrValidateRequest.java`  
**Usado en:** `POST /api/qr/validate`

| Campo | Anotaciones |
|---|---|
| `token` | `@NotBlank` |
| `idOrden` | `@NotNull` |

---

## 6. Validaciones de Negocio (Services)

A diferencia de las validaciones de entrada (que son estructurales), las validaciones de negocio verifican **reglas del dominio** que no pueden expresarse con anotaciones simples.

### 6.1 agroflex-auth-service — `AuthService`
**Archivo:** `agroflex-auth-service/src/main/java/com/agroflex/auth/service/AuthService.java`

| Línea | Excepción | Mensaje | Por qué existe |
|---|---|---|---|
| ~79 | `IllegalArgumentException` | "El correo ya está registrado" | Unicidad de correo antes de insertar (más claro que dejar falla la DB) |
| ~125 | `IllegalArgumentException` | "Refresh token ha expirado" | El JWT de refresh venció; fuerza nuevo login |
| ~138 | `IllegalArgumentException` | "Token inválido o expirado" | Token de refresh manipulado o ya usado |
| ~172 | `IllegalArgumentException` | "Token ha expirado" | Token de reset de contraseña venció (ventana de 1h) |
| ~196 | `IllegalArgumentException` | "Rol no válido para insignia: {rol}" | Solo PRODUCTOR, INVERNADERO y PROVEEDOR pueden solicitar insignia |
| ~202 | `IllegalArgumentException` | "Ya tienes la insignia de {rol}" | Evita asignación duplicada de roles |
| ~206 | `IllegalArgumentException` | "Ya tienes una solicitud registrada para {rol}" | Una solicitud pendiente por rol a la vez |
| ~250 | `IllegalStateException` | "Firebase Admin SDK no está inicializado..." | Configuración incorrecta del servidor (no del cliente) |
| ~259 | `IllegalArgumentException` | "Token de Google inválido o expirado" | Fallo en verificación con Firebase Auth |

**`RolService`:**

| Línea | Excepción | Mensaje | Por qué |
|---|---|---|---|
| ~18 | `IllegalArgumentException` | "Rol no encontrado: {rolNombre}" | El nombre del rol no existe en la tabla `roles` |
| ~20 | `IllegalArgumentException` | "Rol inválido: {rolNombre}" | El string no puede convertirse al enum `NombreRol` |

---

### 6.2 agroflex-orders-service — `OrderValidationService`
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/service/OrderValidationService.java`

| Línea | Excepción | Mensaje | Por qué existe |
|---|---|---|---|
| 35 | `IllegalArgumentException` | "El comprador no puede ser el mismo que el vendedor" | Regla de negocio fundamental: no auto-compra en el marketplace |
| 41 | `IllegalArgumentException` | "Tipo de producto inválido: {tipo}. Debe ser COSECHA_LOTE o SUMINISTRO" | Valor de enumeración inválido que no puede ser capturado en DTO por ser string libre |
| 49 | `IllegalStateException` | "El lote {id} no está disponible. Estado: {estado}" | El lote existe pero está en estado RESERVADO, VENDIDO u otro que impide compra |
| 56 | `InsufficientStockException` | "Stock insuficiente para producto {id}..." | Stock actual menor a cantidad pedida |

**`OrderService` — validación de estados:**
**Archivo:** `agroflex-orders-service/src/main/java/com/agroflex/orders/service/OrderService.java`

| Línea | Excepción | Mensaje | Por qué existe |
|---|---|---|---|
| 141 | `IllegalArgumentException` | "Estado inválido: {estado}" | El string enviado no corresponde a ningún `EstadoPedido` válido |
| 148 | `IllegalStateException` | "Transición inválida: {actual} → {nuevo}. Permitidas: {lista}" | Máquina de estados: no se puede ir de ENTREGADO a PENDIENTE, por ejemplo |
| 155 | `IllegalArgumentException` | "El motivo es obligatorio para CANCELADO o DISPUTADO" | Al cancelar o disputar, se requiere justificación para auditoría |
| 185 | `IllegalStateException` | "No se puede cancelar una orden en estado: {estado}" | Solo PENDIENTE, CONFIRMADO y EN_TRANSITO son cancelables |

---

### 6.3 agroflex-payments-service — `EscrowService` (payments)
**Archivo:** `agroflex-payments-service/src/main/java/com/agroflex/payments/service/EscrowService.java`

| Línea | Excepción | Mensaje | Por qué existe |
|---|---|---|---|
| ~38 | `PaymentAlreadyProcessedException` | "Ya existe una transacción de pago para la orden ID: {id}" | Idempotencia: doble llamada desde orders-service o red |
| ~135 | `IllegalStateException` | "Solo se puede liberar el escrow de una transacción en estado PAGADO. Estado actual: {estado}" | El dinero solo se libera al vendedor si el pago fue retenido correctamente |
| ~181 | `IllegalStateException` | "No se puede reembolsar un pago que ya fue liberado al vendedor" | El dinero ya fue transferido; no se puede reembolsar |
| ~185 | `IllegalStateException` | "Solo se puede reembolsar una transacción en estado PAGADO..." | Estado inválido para reembolso |

**`StripeService`:**

| Línea | Excepción | Operación | Por qué |
|---|---|---|---|
| ~53 | `StripeIntegrationException` | `crearPaymentIntent()` | Error de red o configuración con Stripe |
| ~68 | `StripeIntegrationException` | `confirmarPago()` | Tarjeta rechazada u otro error de Stripe |
| ~106 | `StripeIntegrationException` | `reembolsar()` | Error al procesar reembolso en Stripe |

---

### 6.4 agroflex-catalog-service — `CosechaService`
**Archivo:** `agroflex-catalog-service/src/main/java/com/agroflex/catalog/service/CosechaService.java`

| Línea | Excepción | Condición | Por qué |
|---|---|---|---|
| 44 | `LoteNoEncontradoException` | `findById()` vacío | Lote no existe |
| 90 | `LoteNoEncontradoException` | Lote eliminado | Soft-delete: el registro existe pero `deletedAt` no es null |
| 110 | `LoteNoEncontradoException` | `findById()` vacío | En cambio de estado |
| 119 | `LoteNoEncontradoException` | `findById()` vacío | En eliminación |
| 129 | `ResponseStatusException(403)` | El productor no es dueño del lote | Protección de recursos: un productor no puede editar lotes de otro |

---

### 6.5 agroflex-qr-service — `QrGeneratorService`

| Línea | Excepción | Mensaje | Por qué |
|---|---|---|---|
| ~54 | `IllegalStateException` | "Ya existe un QR activo para la orden {id}" | Un QR por orden, sin excepciones. Evita duplicados en la tabla `seguridad_qr` |

---

## 7. Seguridad y Control de Acceso

### 7.1 Gateway — Filtro JWT Global
**Archivo:** `agroflex-gateway/src/main/java/com/agroflex/gateway/filters/JwtAuthFilter.java`

El Gateway intercepta **todas** las peticiones antes de enrutarlas. Si el JWT es inválido o ausente, responde **401 Unauthorized** sin que la petición llegue al microservicio.

**Rutas públicas (sin JWT requerido):**

| Ruta | Justificación |
|---|---|
| `/api/auth/login` | Punto de entrada para obtener el token |
| `/api/auth/register` | Registro de nuevos usuarios |
| `/api/auth/refresh` | Renovación de token |
| `/api/auth/forgot-password` | Recuperación de cuenta |
| `/api/auth/reset-password` | Reset de contraseña |
| `/api/auth/google` | Login con Google OAuth |
| `/api/catalog/**` | Catálogo público (productores visibles a todos) |
| `/api/productos/**` | Listado de productos |
| `/api/geolocation/**` | Datos geográficos de referencia |
| `/api/notifications/stream` | SSE — token viaja como query param `?token=` |

**Rutas protegidas:** Todo lo demás requiere `Authorization: Bearer {JWT}` válido.

**Funcionalidad especial — SSE (Server-Sent Events):**  
El protocolo SSE no permite headers personalizados (limitación del browser). Para `/api/notifications/stream`, el Gateway también acepta el token como parámetro de URL: `?token={JWT}`, y lo convierte al formato `Bearer` estándar internamente.

---

### 7.2 Control de Acceso por Rol (`@PreAuthorize`)

| Endpoint | Roles permitidos | Justificación |
|---|---|---|
| `POST /api/orders` | `COMPRADOR, PRODUCTOR, PROVEEDOR, EMPAQUE` | Solo roles de compra pueden crear órdenes; ADMIN no compra |
| `GET /api/orders/stats` | `ADMIN` | Solo administradores ven estadísticas globales |
| `POST /api/orders/{id}/release` | `ADMIN` | Liberación manual de escrow — acción administrativa |
| `GET /api/orders/status/{status}` | `ADMIN` | Listado por estado para dashboard admin |
| `GET /api/payments/transactions` (listado global) | `ADMIN` | Solo admin ve todas las transacciones |
| `POST /api/catalog/lotes` | `PRODUCTOR, INVERNADERO` | Solo productores pueden publicar cosechas |
| `PATCH /api/catalog/lotes/{id}/estado` | `PRODUCTOR, INVERNADERO, ADMIN` | Admin puede intervenir en estados |
| `DELETE /api/catalog/lotes/{id}` | `PRODUCTOR, INVERNADERO, ADMIN` | Admin puede eliminar contenido inapropiado |
| `GET /api/users` (listado) | `ADMIN` | Gestión de usuarios |
| `PATCH /api/users/{id}/estado` | `ADMIN` | Activar/desactivar usuarios |
| `DELETE /api/users/{id}` | `ADMIN` | Eliminación de cuentas |
| `POST /api/productos` | `PRODUCTOR, INVERNADERO, PROVEEDOR, ADMIN` | Publicación de suministros |

---

### 7.3 Configuración SecurityConfig por Microservicio

| Microservicio | CSRF | Session | Endpoints públicos | Nota especial |
|---|---|---|---|---|
| `auth-service` | Deshabilitado | STATELESS | `POST /api/auth/**` | Genera los JWT |
| `catalog-service` | Deshabilitado | STATELESS | `GET /api/catalog/**` | GET público, escritura autenticada |
| `orders-service` | Deshabilitado | STATELESS | `/actuator/health` | Todos autenticados |
| `payments-service` | Deshabilitado | STATELESS | `/api/webhooks/stripe`, `/actuator/health` | Webhook de Stripe sin JWT |
| `qr-service` | Deshabilitado | STATELESS | `/actuator/health` | Todos autenticados |
| `admin-service` | Deshabilitado | STATELESS | Ninguno | Solo `ADMIN` — `denyAll()` para el resto |

**Nota sobre CSRF:** CSRF está deshabilitado en todos los servicios porque utilizan autenticación stateless con JWT en el header `Authorization`. Los ataques CSRF solo afectan a cookies de sesión, que este sistema no usa.

**Nota sobre `/api/webhooks/stripe`:** Los webhooks de Stripe son llamadas server-to-server desde los servidores de Stripe. No llevan JWT de usuario, pero sí una firma HMAC-SHA256 en el header `Stripe-Signature` que es verificada por el servicio. Si la firma no coincide, se lanza `SignatureVerificationException` → 400 Bad Request.

---

## 8. Convención de Códigos de Error

El sistema usa una convención `AF-{SERVICIO}-{HTTPCODE}` en todos los códigos de error:

| Prefijo | Microservicio |
|---|---|
| `AF-CAT-` | agroflex-catalog-service |
| `AF-ORD-` | agroflex-orders-service |
| `AF-PAY-` | agroflex-payments-service |
| `AF-USR-` | agroflex-users-service |
| `AF-ADM-` | agroflex-admin-service |

### Tabla de códigos HTTP utilizados

| Código HTTP | Significado en el sistema | Ejemplo de uso |
|---|---|---|
| **400 Bad Request** | Datos de entrada inválidos, regla de negocio violada con dato del cliente | Correo ya registrado, campo requerido vacío |
| **401 Unauthorized** | JWT ausente, expirado o inválido | Petición sin header Authorization |
| **403 Forbidden** | JWT válido pero rol insuficiente | COMPRADOR intentando publicar un lote |
| **404 Not Found** | Recurso no existe | Orden/lote/usuario con ID inexistente |
| **409 Conflict** | Operación entra en conflicto con el estado actual | Stock insuficiente, pago ya procesado, reseña duplicada |
| **422 Unprocessable Entity** | Datos válidos estructuralmente pero transición de estado imposible | PENDIENTE → COMPLETADO directo (sin pasos previos) |
| **500 Internal Server Error** | Error no esperado del servidor | NullPointerException, error de base de datos |
| **502 Bad Gateway** | El servicio recibió respuesta inválida de un upstream | Error en API de Stripe |
| **503 Service Unavailable** | Microservicio dependiente no responde (Feign timeout) | catalog-service no disponible al crear orden |

---

## 9. Análisis por Microservicio

### Resumen comparativo

| Microservicio | Excepciones propias | @ExceptionHandlers | DTOs con @Valid | Validaciones de negocio |
|---|---|---|---|---|
| auth-service | 0 | 5 | 6 | 9 |
| catalog-service | 1 | 4 | 3 | 5 |
| orders-service | 2 | 7 | 2 | 7 |
| payments-service | 3 | 9 | 1 | 4 + 3 (Stripe) |
| users-service | 2 | 5 | 2 | 6 |
| qr-service | 0 | 0 | 3 | 1 |
| notifications-service | 0 | 0 | 1 | 0 |
| gateway | 0 | n/a | n/a | JWT global |
| **TOTAL** | **8** | **30+** | **18** | **35+** |

### Observaciones

1. **payments-service** es el más robusto en manejo de excepciones, con 3 excepciones propias, 9 handlers y un tratamiento especial para errores de Stripe que garantiza no exponer información sensible.

2. **orders-service** tiene la lógica de validación de negocio más compleja, con una máquina de estados completa que valida cada transición permitida entre los 9 estados posibles de una orden.

3. **auth-service** no tiene excepciones propias pero cubre todos los casos de autenticación con `IllegalArgumentException` e `IllegalStateException`, delegando la conversión a código HTTP en el GlobalExceptionHandler.

4. **gateway** actúa como primera línea de defensa: si el JWT no es válido, ninguna petición protegida llega siquiera al microservicio correspondiente.

5. **admin-service** tiene la configuración de seguridad más restrictiva: `denyAll()` para cualquier petición que no sea del rol ADMIN, sin excepciones de rutas públicas.

---

*Fin del reporte técnico — AgroFlex SOA*
