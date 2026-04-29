---
name: agroflex-prompt-generator
description: >
  Genera prompts optimizados para GitHub Copilot y Claude Code para
  desarrollar módulos del proyecto AgroFlex. Usa esta skill SIEMPRE
  que el usuario pida un prompt, instrucción o contexto para que su
  agente de IA desarrolle algo del proyecto. También úsala cuando
  mencione: "prompt", "instrucción para Copilot", "dile al agente",
  "genera el prompt", "qué le digo a Claude Code", "cómo le explico",
  o cuando pida desarrollar un módulo nuevo de AgroFlex sin pedir
  el código directamente.
---

# AgroFlex — Prompt Generator Skill

Genera prompts listos para pegar en GitHub Copilot (`@workspace`)
o Claude Code, con todo el contexto del proyecto AgroFlex incluido.

---

## Contexto base que todo prompt debe incluir

```
Proyecto: AgroFlex — ecosistema digital agrícola mexicano
Objetivo: Conectar productores con compradores eliminando intermediarios
Stack: React 18 + Vite + Tailwind (frontend) / Spring Boot 3.x Java 21 (backend)
DB: MySQL 8.0 — schema agroflex_db
Seguridad: JWT + Spring Security + RBAC
Paleta: Verde #1E7A45 (logo "AGRO") + Gris #3A4A52 (logo "FLEX") + Lima #6ABF3A
Roles: PRODUCTOR | INVERNADERO | PROVEEDOR | EMPAQUE | COMPRADOR | ADMIN
```

---

## Módulos del sistema y su estado

| Módulo | Estado | Microservicio / Página |
|--------|--------|----------------------|
| Design System | ✅ Listo | tailwind.config.js + index.css |
| Landing Page | ✅ Listo | LandingPage.jsx |
| Autenticación | ✅ Listo | agroflex-auth-service |
| Catálogo Lotes | 🔄 Pendiente | agroflex-catalog-service |
| Publicar Lote | 🔄 Pendiente | PublishHarvestPage.jsx |
| Transacción Escrow | 🔄 Pendiente | agroflex-orders-service |
| QR + GPS Validación | 🔄 Pendiente | agroflex-qr-service |
| Pagos Stripe | 🔄 Pendiente | agroflex-payments-service |
| Notificaciones | 🔄 Pendiente | agroflex-notifications-service |
| Dashboard Producer | 🔄 Pendiente | DashboardProducer.jsx |
| Dashboard Buyer | 🔄 Pendiente | DashboardBuyer.jsx |
| Perfil + Reputación | 🔄 Pendiente | ProfilePage.jsx |

---

## Plantillas de prompt por tipo de tarea

### TIPO 1 — Nuevo módulo Full Stack
```
@workspace Eres un desarrollador Full Stack Senior trabajando en AgroFlex,
un ecosistema digital agrícola mexicano. Lee los archivos del proyecto
antes de escribir código.

CONTEXTO: [descripción del módulo]
ROLES QUE LO USAN: [roles de AgroFlex]

BACKEND — agroflex-{nombre}-service (puerto {puerto}):
[lista de archivos Java a generar]

FRONTEND — agroflex-frontend:
[lista de archivos JSX/JS a generar]

PALETA: Verde principal green-600 (#1E7A45) · Lima lime-500 (#6ABF3A)
        Gris body slate-700 (#3A4A52) · Títulos slate-900 (#1E2A30)

REGLAS:
- Backend: Spring Boot 3.x, Java 21, Lombok, JWT, @Valid, @Transactional
- Frontend: Airbnb Style Guide, Tailwind clases del design system, mobile-first
- Errores backend: formato { codigo, mensaje, timestamp } — nunca exponer stack trace
- Tests: JUnit5+Mockito (BE) y Vitest+Testing Library (FE), cobertura ≥ 80%
- NUNCA hardcodear colores hex — usar clases Tailwind del tailwind.config.js
```

### TIPO 2 — Solo Backend (microservicio)
```
@workspace Implementa en agroflex-{nombre}-service:
[descripción de lo que necesita]

Stack: Spring Boot 3.x + Java 21 + MySQL 8.0
Puerto: {puerto} | Eureka: registrado | Seguridad: JWT Bearer

Archivos a crear:
1. model/{Entidad}.java — @Entity JPA + Lombok + tabla {Tabla_DB}
2. repository/{Entidad}Repository.java — JpaRepository<{Entidad}, Long>
3. dto/{Nombre}Request.java — validaciones @Valid
4. dto/{Nombre}Response.java — campos a exponer
5. service/{Nombre}Service.java — @Transactional, inyección por constructor
6. controller/{Nombre}Controller.java — REST, @PreAuthorize por rol
7. exception/{Nombre}Exception.java — código AF-XXX-000
8. test/{Nombre}ServiceTest.java — JUnit5 + Mockito, ≥ 80% cobertura

Excepciones ya existentes (no recrear): UsuarioNoEncontradoException,
LoteNoDisponibleException, QRExpiradoException, GPSFueraDeRangoException,
PagoFallidoException, InsigniaNoVerificadaException

Respuesta de error estándar:
{ "codigo": "AF-XXX-000", "mensaje": "...", "timestamp": "..." }
```

### TIPO 3 — Solo Frontend (componente o página)
```
@workspace Implementa en agroflex-frontend:
[descripción del componente o página]

Stack: React 18 + Vite + Tailwind CSS
Roles que lo ven: [roles]
Ruta: [ruta del router]

Paleta de colores (usar SOLO estas clases Tailwind):
- Fondos oscuros (navbar/hero): bg-green-900 (#0F4C2A)
- Botón principal: btn-primary (bg-green-600)
- Botón outline: btn-secondary (border-green-600)
- Acento/verificado: lime-500 (#6ABF3A)
- Texto body: text-slate-700 | Títulos: text-slate-900

Componentes disponibles: Badge, Button, Card, Input, Modal, Spinner, Toast,
HarvestCard, EscrowStatus, QRGenerator, QRScanner, PrivateRoute

Hooks disponibles: useAuth, useGeolocation, useQRScanner, usePWAInstall

Archivos a crear:
1. src/pages/{rol}/{Nombre}Page.jsx — componente principal
2. src/pages/{rol}/{Nombre}Page.test.jsx — Vitest + Testing Library

Reglas: Airbnb Style Guide · mobile-first (375px base) ·
        botones mínimo 44px alto · sin imágenes externas
```

### TIPO 4 — Migración SQL
```
@workspace Crea una migración SQL para agroflex_db en MySQL 8.0:
[descripción del cambio]

Convenciones:
- Engine: InnoDB | Charset: utf8mb4_unicode_ci
- IDs: BIGINT UNSIGNED AUTO_INCREMENT
- Timestamps: created_at + updated_at + deleted_at (soft delete)
- Índices: idx_* para búsqueda, uq_* para únicos, fk_* para FK
- Formato: V{N}__{descripcion}.sql

Tablas existentes (solo ALTER, no recrear):
Usuarios, Roles, Cosechas_Lote, Suministros_Tienda, Ordenes_Transaccion,
Seguridad_QR, Imagenes_Galeria, Notificaciones, Disputas, Reseñas_Calificaciones

Triggers existentes (no duplicar):
trg_generar_numero_orden, trg_actualizar_reputacion,
trg_historial_orden, trg_reducir_stock_suministro
```

### TIPO 5 — Fix / Corrección de bug
```
@workspace En el proyecto AgroFlex hay un bug en [archivo/módulo]:

PROBLEMA: [descripción del bug]
COMPORTAMIENTO ESPERADO: [qué debería pasar]
COMPORTAMIENTO ACTUAL: [qué está pasando]

Stack afectado: [Frontend React / Backend Spring Boot / SQL]

Lee el archivo [ruta del archivo] y corrígelo manteniendo:
- Las convenciones del design system de AgroFlex
- El formato de errores estándar { codigo, mensaje, timestamp }
- La cobertura de tests ≥ 80%
- Airbnb Style Guide en el frontend
```

---

## Proceso de generación de prompts

Cuando el usuario pida un prompt para su agente:

1. **Identificar** qué módulo es (ver tabla de estado arriba)
2. **Seleccionar** la plantilla correcta (Full Stack / Backend / Frontend / SQL / Fix)
3. **Completar** la plantilla con los detalles específicos del módulo
4. **Agregar** el orden recomendado de implementación
5. **Indicar** qué archivos existentes debe leer el agente primero
6. **Especificar** qué herramienta usar**: `@workspace` para Copilot,
   descripción directa para Claude Code

---

## Orden recomendado de desarrollo AgroFlex

Para no romper dependencias, desarrollar en este orden:

```
Fase 1 ✅: Design System → Landing → Auth
Fase 2 🔄: Catálogo → Publicar Lote → Dashboard Producer
Fase 3 ⏳: Órdenes + Escrow → QR + GPS → Stripe Pagos
Fase 4 ⏳: Notificaciones → Disputas → Reputación
Fase 5 ⏳: Dashboard Admin → Reportes → ML Recomendaciones
```

---

## Referencia adicional

Para arquitectura completa del sistema:
`SOArquitectura/agroflex-arquitectura-overview.md`

Para estructura de carpetas:
`SOArquitectura/agroflex-frontend-structure.md`
`SOArquitectura/agroflex-backend-structure.md`
