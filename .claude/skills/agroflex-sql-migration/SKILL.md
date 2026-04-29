---
name: agroflex-sql-migration
description: >
  Genera scripts SQL para el proyecto AgroFlex respetando el schema
  existente en MySQL 8.0. Usa esta skill SIEMPRE que el usuario pida
  crear o modificar tablas, columnas, índices, triggers, views, datos
  semilla, o cualquier cambio en la base de datos de AgroFlex. También
  úsala cuando mencione: "tabla", "columna", "SQL", "migración",
  "base de datos", "schema", "índice", "trigger", "view", "INSERT",
  "ALTER", "CREATE TABLE", o nombres de tablas existentes como
  "Usuarios", "Cosechas_Lote", "Ordenes_Transaccion", "Seguridad_QR".
---

# AgroFlex — SQL Migration Skill

Genera scripts SQL para MySQL 8.0 siguiendo las convenciones
del schema `agroflex_db` ya definido en el proyecto.

---

## Configuración de la base de datos

- **Motor**: MySQL 8.0
- **Schema**: `agroflex_db`
- **Charset**: `utf8mb4` + `utf8mb4_unicode_ci` en todas las tablas
- **Engine**: `InnoDB` siempre
- **Zona horaria**: `America/Mexico_City`

---

## Tablas existentes (nunca recrear, solo modificar con ALTER)

| Tabla | Descripción |
|-------|-------------|
| `Usuarios` | Todos los actores del sistema |
| `Roles` | Catálogo de roles RBAC |
| `Usuarios_Roles` | Relación M:N usuario-rol |
| `Insignias_Vendedor` | Documentos verificados de productores |
| `Tipos_Cultivo` | Catálogo de cultivos |
| `Cosechas_Lote` | Lotes publicados por productores |
| `Categorias_Suministro` | Catálogo de categorías de agroinsumos |
| `Suministros_Tienda` | Productos de proveedores |
| `Imagenes_Galeria` | Referencias a Firebase Storage |
| `Ordenes_Transaccion` | Órdenes y estado del escrow |
| `Seguridad_QR` | Tokens QR para validación de entrega |
| `Historial_Estados_Orden` | Auditoría de cambios de estado |
| `Reseñas_Calificaciones` | Sistema de reputación bilateral |
| `Notificaciones` | Registro de notificaciones enviadas |
| `Disputas` | Conflictos entre comprador y vendedor |

---

## Triggers existentes (no duplicar)

- `trg_generar_numero_orden` — genera `AGF-YYYY-000001` automáticamente
- `trg_actualizar_reputacion` — recalcula puntuación al insertar reseña
- `trg_historial_orden` — audita cambios de `estado_pago`
- `trg_reducir_stock_suministro` — descuenta stock al crear orden

---

## Views existentes (no duplicar)

- `v_lotes_disponibles` — catálogo público con datos del productor
- `v_ordenes_dashboard` — órdenes con estado QR y escrow

---

## Reglas de escritura SQL obligatorias

### Estructura de toda nueva tabla
```sql
CREATE TABLE IF NOT EXISTS NombreTabla (
  id_tabla    BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  -- campos del negocio aquí
  created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME          NULL     COMMENT 'Soft delete',

  PRIMARY KEY (id_tabla),
  -- índices aquí
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Descripción de la tabla';
```

### Tipos de datos estándar del proyecto
```sql
IDs:           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT
Textos cortos: VARCHAR(n)      — siempre definir longitud máxima
Textos largos: TEXT
Decimales:     DECIMAL(10, 2)  — precios | DECIMAL(10, 7) — coordenadas GPS
Booleanos:     TINYINT(1)      NOT NULL DEFAULT 0
Estados/Enum:  ENUM('VAL1','VAL2')
Fechas:        DATETIME        (no DATE salvo que sea solo fecha)
JSON:          JSON            — para datos variables (embeddings, metadata)
```

### Convenciones de nombres
```sql
-- Tablas: PascalCase en español
Cosechas_Lote, Seguridad_QR, Ordenes_Transaccion

-- Columnas: snake_case con prefijo del contexto
id_usuario, id_lote, fecha_creacion, estado_pago

-- Índices: prefijo según tipo
PRIMARY KEY: pk_*        → pk_usuarios
UNIQUE:      uq_*        → uq_correo
INDEX:       idx_*       → idx_estado_lote
FOREIGN KEY: fk_*        → fk_cl_productor
FULLTEXT:    idx_ft_*    → idx_ft_suministro

-- Triggers: trg_{tabla}_{accion}
trg_ordenes_generar_numero

-- Views: v_{nombre_descriptivo}
v_lotes_disponibles
```

### Foreign Keys (siempre con comportamiento explícito)
```sql
-- Hacia Usuarios: casi siempre RESTRICT (no borrar si tiene datos)
CONSTRAINT fk_{tabla}_{campo} FOREIGN KEY (id_usuario)
  REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE

-- Hacia tablas de catálogo: SET NULL si el registro hijo puede existir sin padre
ON DELETE SET NULL

-- Tablas de detalle/historial: CASCADE (borrar junto con el padre)
ON DELETE CASCADE
```

### ENUMs de estados ya definidos
```sql
-- Ordenes_Transaccion.estado_pago
ENUM('PENDIENTE_PAGO','PAGO_RETENIDO','EN_TRANSITO',
     'LISTO_VALIDACION','PAGO_LIBERADO','REEMBOLSADO','DISPUTADO','CANCELADO')

-- Seguridad_QR.estado_qr
ENUM('GENERADO','ESCANEADO','VALIDADO','EXPIRADO','INVALIDO')

-- Cosechas_Lote.estado_lote
ENUM('BORRADOR','DISPONIBLE','RESERVADO','VENDIDO','EXPIRADO','CANCELADO')

-- Insignias_Vendedor.estado_verificacion
ENUM('PENDIENTE','APROBADA','RECHAZADA')
```

---

## Formato de scripts de migración

Cada migración nueva debe seguir este formato:

```sql
-- =============================================================================
-- AgroFlex Migration: V{numero}__{descripcion_corta}
-- Fecha: YYYY-MM-DD
-- Autor: {nombre}
-- Descripción: {qué hace esta migración}
-- =============================================================================

USE agroflex_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Cambios aquí

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación (SELECT que confirma que funcionó)
SELECT 'Migración V{numero} aplicada correctamente' AS resultado;
```

### Numeración de migraciones
- El schema base es `V1__initial_schema.sql`
- Cada nueva migración incrementa: `V2__`, `V3__`, etc.
- Nunca modificar migraciones ya aplicadas — siempre crear una nueva

---

## Datos semilla (INSERT)

```sql
-- Siempre usar INSERT IGNORE para datos de catálogo (idempotente)
INSERT IGNORE INTO Tipos_Cultivo (nombre, categoria) VALUES
  ('Nuevo Cultivo', 'Hortalizas');

-- Para datos de configuración usar ON DUPLICATE KEY UPDATE
INSERT INTO Roles (nombre_rol, descripcion)
VALUES ('NUEVO_ROL', 'Descripción')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
```

---

## Proceso de generación

Cuando el usuario pida un cambio en la base de datos:

1. **Verificar** si la tabla ya existe en la lista de arriba
2. **Determinar** si es CREATE (nueva) o ALTER (modificar existente)
3. **Generar** el script con el formato de migración estándar
4. **Incluir** índices necesarios para las consultas más frecuentes
5. **Agregar** la verificación SELECT al final
6. **Advertir** si el cambio puede afectar triggers o views existentes

---

## Referencia adicional

Para el schema completo con todas las tablas y relaciones:
`SOArquitectura/agroflex_database.sql`
