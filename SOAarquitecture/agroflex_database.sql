-- =============================================================================
-- AgroFlex — Script SQL Completo
-- Motor: MySQL 8.0
-- Versión: 1.0.0
-- Descripción: Ecosistema digital agrícola — Base de datos principal
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =============================================================================
-- SCHEMA
-- =============================================================================
CREATE DATABASE IF NOT EXISTS agroflex_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agroflex_db;

-- =============================================================================
-- TABLA 1: Usuarios
-- Almacena todos los actores del ecosistema.
-- El campo `validado` indica si la insignia fue verificada por admin.
-- =============================================================================
CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario        BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(120)        NOT NULL,
  apellidos         VARCHAR(120)        NOT NULL,
  correo            VARCHAR(180)        NOT NULL,
  password_hash     VARCHAR(255)        NOT NULL  COMMENT 'BCrypt hash',
  telefono          VARCHAR(20)         NULL,
  -- Ubicación principal (municipio/estado)
  direccion         VARCHAR(255)        NULL,
  latitud           DECIMAL(10, 7)      NULL       COMMENT 'Coordenada GPS latitud',
  longitud          DECIMAL(10, 7)      NULL       COMMENT 'Coordenada GPS longitud',
  estado_republica  VARCHAR(80)         NULL,
  municipio         VARCHAR(80)         NULL,
  -- Reputación y estado
  puntuacion_rep    DECIMAL(3, 2)       NOT NULL   DEFAULT 0.00 COMMENT 'Escala 0.00 - 5.00',
  total_reseñas     INT UNSIGNED        NOT NULL   DEFAULT 0,
  validado          TINYINT(1)          NOT NULL   DEFAULT 0    COMMENT '0=pendiente, 1=verificado',
  activo            TINYINT(1)          NOT NULL   DEFAULT 1,
  -- Firebase UID para sincronización en tiempo real
  firebase_uid      VARCHAR(128)        NULL       UNIQUE,
  -- Token para notificaciones push (FCM)
  fcm_token         VARCHAR(255)        NULL,
  -- Timestamps
  created_at        DATETIME            NOT NULL   DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME            NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME            NULL       COMMENT 'Soft delete',

  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_correo (correo),
  INDEX idx_estado_municipio (estado_republica, municipio),
  INDEX idx_validado (validado),
  INDEX idx_puntuacion (puntuacion_rep)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Todos los actores: productores, compradores, proveedores, admins';

-- =============================================================================
-- TABLA 2: Roles
-- Catálogo de roles del sistema (RBAC)
-- =============================================================================
CREATE TABLE IF NOT EXISTS Roles (
  id_rol      TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre_rol  VARCHAR(50)       NOT NULL COMMENT 'PRODUCTOR, INVERNADERO, PROVEEDOR, EMPAQUE, COMPRADOR, ADMIN',
  descripcion VARCHAR(255)      NULL,

  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles base del sistema
INSERT INTO Roles (nombre_rol, descripcion) VALUES
  ('PRODUCTOR',   'Agricultor que vende lotes de cosecha directamente'),
  ('INVERNADERO', 'Operador de invernadero con producción controlada'),
  ('PROVEEDOR',   'Proveedor de agroinsumos y agroquímicos'),
  ('EMPAQUE',     'Centro de empaque y procesamiento'),
  ('COMPRADOR',   'Comprador de lotes o suministros'),
  ('ADMIN',       'Administrador de la plataforma AgroFlex');

-- =============================================================================
-- TABLA 3: Usuarios_Roles (relación M:N con atributos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS Usuarios_Roles (
  id_usuario  BIGINT UNSIGNED   NOT NULL,
  id_rol      TINYINT UNSIGNED  NOT NULL,
  asignado_en DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_usuario, id_rol),
  CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_ur_rol     FOREIGN KEY (id_rol)     REFERENCES Roles(id_rol)         ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA 4: Insignias_Vendedor
-- Vincula usuario con su rol productivo y documentos de identidad en Firebase.
-- Un usuario puede tener múltiples insignias (ej: productor + proveedor).
-- =============================================================================
CREATE TABLE IF NOT EXISTS Insignias_Vendedor (
  id_insignia             BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_usuario              BIGINT UNSIGNED     NOT NULL,
  id_rol                  TINYINT UNSIGNED    NOT NULL,
  -- Documento oficial (INE, RFC, acta constitutiva, etc.)
  tipo_documento          VARCHAR(60)         NOT NULL COMMENT 'INE, RFC, ACTA_CONSTITUTIVA, PERMISO_SAGARPA',
  firebase_doc_url        VARCHAR(512)        NOT NULL COMMENT 'URL del documento almacenado en Firebase Storage',
  firebase_doc_path       VARCHAR(512)        NULL     COMMENT 'Path interno en Firebase para gestión',
  -- Información del negocio
  nombre_negocio          VARCHAR(180)        NULL,
  rfc                     VARCHAR(13)         NULL,
  descripcion_negocio     TEXT                NULL,
  -- Estado de verificación
  estado_verificacion     ENUM('PENDIENTE','APROBADA','RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  motivo_rechazo          VARCHAR(255)        NULL,
  verificado_por          BIGINT UNSIGNED     NULL     COMMENT 'id_usuario del admin',
  fecha_verificacion      DATETIME            NULL,
  -- Timestamps
  created_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_insignia),
  CONSTRAINT fk_iv_usuario        FOREIGN KEY (id_usuario)    REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_iv_rol            FOREIGN KEY (id_rol)        REFERENCES Roles(id_rol)         ON DELETE RESTRICT,
  CONSTRAINT fk_iv_verificado_por FOREIGN KEY (verificado_por) REFERENCES Usuarios(id_usuario) ON DELETE SET NULL,
  INDEX idx_iv_usuario   (id_usuario),
  INDEX idx_iv_estado    (estado_verificacion),
  INDEX idx_iv_rol       (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Documentos e insignias de productores/proveedores verificadas';

-- =============================================================================
-- TABLA 5: Tipos_Cultivo
-- Catálogo maestro de cultivos (normalizado)
-- =============================================================================
CREATE TABLE IF NOT EXISTS Tipos_Cultivo (
  id_cultivo    SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100)        NOT NULL,
  categoria     VARCHAR(60)         NULL     COMMENT 'Hortalizas, Frutas, Granos, Flores...',
  temporada     VARCHAR(60)         NULL     COMMENT 'Todo el año, Verano, Invierno...',
  imagen_url    VARCHAR(512)        NULL,

  PRIMARY KEY (id_cultivo),
  UNIQUE KEY uq_nombre_cultivo (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de cultivo iniciales
INSERT INTO Tipos_Cultivo (nombre, categoria) VALUES
  ('Tomate Rojo (Jitomate)',   'Hortalizas'),
  ('Chile Jalapeño',           'Hortalizas'),
  ('Chile Serrano',            'Hortalizas'),
  ('Pepino',                   'Hortalizas'),
  ('Calabacita',               'Hortalizas'),
  ('Pimiento Morrón',          'Hortalizas'),
  ('Lechuga',                  'Hortalizas'),
  ('Espinaca',                 'Hortalizas'),
  ('Brócoli',                  'Hortalizas'),
  ('Cebolla',                  'Hortalizas'),
  ('Aguacate Hass',            'Frutas'),
  ('Fresa',                    'Frutas'),
  ('Melón',                    'Frutas'),
  ('Sandía',                   'Frutas'),
  ('Mango Ataulfo',            'Frutas'),
  ('Maíz Blanco',              'Granos'),
  ('Trigo',                    'Granos'),
  ('Sorgo',                    'Granos'),
  ('Rosa',                     'Flores'),
  ('Crisantemo',               'Flores');

-- =============================================================================
-- TABLA 6: Cosechas_Lote
-- Publicaciones de lotes disponibles para venta.
-- =============================================================================
CREATE TABLE IF NOT EXISTS Cosechas_Lote (
  id_lote               BIGINT UNSIGNED       NOT NULL AUTO_INCREMENT,
  id_productor          BIGINT UNSIGNED       NOT NULL COMMENT 'FK a Usuarios',
  id_cultivo            SMALLINT UNSIGNED     NOT NULL,
  -- Descripción del lote
  titulo                VARCHAR(200)          NOT NULL,
  descripcion           TEXT                  NULL,
  variedad              VARCHAR(100)          NULL     COMMENT 'Ej: Tomate Saladette, Saladet...',
  -- Cantidades y precio
  cantidad_total        DECIMAL(12, 2)        NOT NULL,
  cantidad_disponible   DECIMAL(12, 2)        NOT NULL,
  unidad_venta          ENUM('TONELADA','KILOGRAMO','CAJA','COSTAL','PIEZA','DOCENA','PALLET') NOT NULL,
  precio_unitario       DECIMAL(10, 2)        NOT NULL COMMENT 'Precio por unidad_venta',
  precio_minimo_negoc   DECIMAL(10, 2)        NULL     COMMENT 'Precio mínimo negociable (confidencial)',
  moneda                CHAR(3)               NOT NULL DEFAULT 'MXN',
  -- Calidad y certificaciones
  grado_calidad         ENUM('EXTRA','PRIMERA','SEGUNDA','INDUSTRIAL') NULL,
  es_organico           TINYINT(1)            NOT NULL DEFAULT 0,
  certificaciones       VARCHAR(255)          NULL     COMMENT 'JSON array de certificaciones',
  -- Logística
  fecha_cosecha         DATE                  NULL,
  fecha_disponible      DATE                  NOT NULL,
  fecha_vencimiento     DATE                  NULL     COMMENT 'Fecha límite de disponibilidad',
  requiere_refrigeracion TINYINT(1)           NOT NULL DEFAULT 0,
  -- Ubicación del lote
  latitud               DECIMAL(10, 7)        NULL,
  longitud              DECIMAL(10, 7)        NULL,
  estado_republica      VARCHAR(80)           NULL,
  municipio             VARCHAR(80)           NULL,
  direccion_parcela     VARCHAR(255)          NULL,
  -- Estado
  estado_lote           ENUM('BORRADOR','DISPONIBLE','RESERVADO','VENDIDO','EXPIRADO','CANCELADO') NOT NULL DEFAULT 'BORRADOR',
  -- SEO y búsqueda semántica
  vector_embedding      JSON                  NULL     COMMENT 'Embedding de OpenAI para búsqueda semántica',
  -- Timestamps
  created_at            DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME              NULL,

  PRIMARY KEY (id_lote),
  CONSTRAINT fk_cl_productor FOREIGN KEY (id_productor) REFERENCES Usuarios(id_usuario)      ON DELETE RESTRICT,
  CONSTRAINT fk_cl_cultivo   FOREIGN KEY (id_cultivo)   REFERENCES Tipos_Cultivo(id_cultivo) ON DELETE RESTRICT,
  INDEX idx_cl_estado        (estado_lote),
  INDEX idx_cl_productor     (id_productor),
  INDEX idx_cl_cultivo       (id_cultivo),
  INDEX idx_cl_ubicacion     (estado_republica, municipio),
  INDEX idx_cl_disponible    (fecha_disponible),
  INDEX idx_cl_precio        (precio_unitario),
  INDEX idx_cl_geo           (latitud, longitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lotes de cosecha publicados por productores e invernaderos';

-- =============================================================================
-- TABLA 7: Categorias_Suministro
-- Catálogo de categorías de agroinsumos
-- =============================================================================
CREATE TABLE IF NOT EXISTS Categorias_Suministro (
  id_categoria  SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100)        NOT NULL,
  descripcion   VARCHAR(255)        NULL,

  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_cat_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Categorias_Suministro (nombre) VALUES
  ('Herbicidas'), ('Insecticidas'), ('Fungicidas'), ('Fertilizantes'),
  ('Bioestimulantes'), ('Semillas'), ('Sustratos'), ('Equipos de Riego'),
  ('Herramientas'), ('Equipos de Protección');

-- =============================================================================
-- TABLA 8: Suministros_Tienda
-- Productos de agroinsumos publicados por proveedores.
-- =============================================================================
CREATE TABLE IF NOT EXISTS Suministros_Tienda (
  id_suministro     BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_proveedor      BIGINT UNSIGNED     NOT NULL,
  id_categoria      SMALLINT UNSIGNED   NOT NULL,
  -- Identificación del producto
  nombre_comercial  VARCHAR(200)        NOT NULL,
  nombre_generico   VARCHAR(200)        NULL,
  marca             VARCHAR(100)        NULL,
  numero_registro   VARCHAR(80)         NULL     COMMENT 'Registro COFEPRIS/SENASICA',
  -- Presentación
  presentacion      VARCHAR(100)        NOT NULL COMMENT 'Ej: Bolsa 1kg, Frasco 1L, Caja 20pz',
  contenido_neto    DECIMAL(10, 3)      NOT NULL,
  unidad_medida     ENUM('KG','G','L','ML','PIEZA','CAJA','LITRO') NOT NULL,
  -- Precio e inventario
  precio_unitario   DECIMAL(10, 2)      NOT NULL,
  moneda            CHAR(3)             NOT NULL DEFAULT 'MXN',
  stock             INT UNSIGNED        NOT NULL DEFAULT 0,
  stock_minimo      INT UNSIGNED        NOT NULL DEFAULT 5  COMMENT 'Alerta de stock bajo',
  -- Información técnica
  descripcion       TEXT                NULL,
  ingrediente_activo VARCHAR(255)       NULL,
  modo_accion       TEXT                NULL,
  hoja_seguridad_url VARCHAR(512)       NULL     COMMENT 'URL Firebase del PDF',
  -- Estado
  activo            TINYINT(1)          NOT NULL DEFAULT 1,
  -- Timestamps
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_suministro),
  CONSTRAINT fk_st_proveedor  FOREIGN KEY (id_proveedor) REFERENCES Usuarios(id_usuario)                ON DELETE RESTRICT,
  CONSTRAINT fk_st_categoria  FOREIGN KEY (id_categoria) REFERENCES Categorias_Suministro(id_categoria) ON DELETE RESTRICT,
  INDEX idx_st_proveedor  (id_proveedor),
  INDEX idx_st_categoria  (id_categoria),
  INDEX idx_st_nombre     (nombre_comercial),
  INDEX idx_st_activo     (activo),
  FULLTEXT idx_ft_suministro (nombre_comercial, nombre_generico, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de agroinsumos de proveedores verificados';

-- =============================================================================
-- TABLA 9: Imagenes_Galeria
-- Referencias a imágenes almacenadas en Firebase Storage.
-- Polimórfica: puede asociarse a lotes, suministros o perfiles de usuario.
-- =============================================================================
CREATE TABLE IF NOT EXISTS Imagenes_Galeria (
  id_imagen         BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  -- Referencia polimórfica
  entidad_tipo      ENUM('COSECHA_LOTE','SUMINISTRO','USUARIO','INSIGNIA') NOT NULL,
  entidad_id        BIGINT UNSIGNED     NOT NULL,
  -- Firebase
  firebase_url      VARCHAR(512)        NOT NULL COMMENT 'URL pública de descarga',
  firebase_path     VARCHAR(512)        NOT NULL COMMENT 'Path interno en Firebase Storage',
  firebase_bucket   VARCHAR(255)        NULL,
  -- Metadatos
  nombre_archivo    VARCHAR(255)        NULL,
  tipo_mime         VARCHAR(80)         NULL     COMMENT 'image/jpeg, image/webp...',
  tamaño_bytes      INT UNSIGNED        NULL,
  ancho_px          SMALLINT UNSIGNED   NULL,
  alto_px           SMALLINT UNSIGNED   NULL,
  es_principal      TINYINT(1)          NOT NULL DEFAULT 0  COMMENT 'Imagen principal del listado',
  orden_display     TINYINT UNSIGNED    NOT NULL DEFAULT 0,
  -- Timestamps
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_imagen),
  INDEX idx_ig_entidad (entidad_tipo, entidad_id),
  INDEX idx_ig_principal (es_principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Galería de imágenes con referencias a Firebase Storage';

-- =============================================================================
-- TABLA 10: Ordenes_Transaccion
-- Corazón transaccional del sistema. Maneja el ciclo de vida del escrow.
-- Estados del pago escrow:
--   INICIADA → PAGO_RETENIDO → EN_TRANSITO → ENTREGADA → LIBERADO / DISPUTADO
-- =============================================================================
CREATE TABLE IF NOT EXISTS Ordenes_Transaccion (
  id_orden              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  -- Identificador único legible para el usuario
  numero_orden          VARCHAR(20)         NOT NULL COMMENT 'AGF-2024-000001',
  -- Partes involucradas
  id_comprador          BIGINT UNSIGNED     NOT NULL,
  id_vendedor           BIGINT UNSIGNED     NOT NULL,
  -- Producto (puede ser lote o suministro)
  tipo_producto         ENUM('COSECHA_LOTE','SUMINISTRO') NOT NULL,
  id_producto           BIGINT UNSIGNED     NOT NULL,
  -- Detalles de la orden
  cantidad              DECIMAL(12, 2)      NOT NULL,
  unidad                VARCHAR(50)         NOT NULL,
  precio_unitario       DECIMAL(10, 2)      NOT NULL,
  subtotal              DECIMAL(12, 2)      NOT NULL  COMMENT 'cantidad * precio_unitario',
  -- Comisiones
  comision_plataforma   DECIMAL(12, 2)      NOT NULL  COMMENT 'AgroFlex cobra % de la transacción',
  porcentaje_comision   DECIMAL(5, 2)       NOT NULL  DEFAULT 3.50 COMMENT '% cobrado por AgroFlex',
  comision_pasarela     DECIMAL(12, 2)      NULL      COMMENT 'Comisión Stripe/PayPal',
  monto_total           DECIMAL(12, 2)      NOT NULL  COMMENT 'subtotal + comision_plataforma',
  monto_vendedor        DECIMAL(12, 2)      NOT NULL  COMMENT 'Lo que recibe el productor',
  moneda                CHAR(3)             NOT NULL  DEFAULT 'MXN',
  -- Escrow y pago
  estado_pago           ENUM(
                          'PENDIENTE_PAGO',
                          'PAGO_RETENIDO',
                          'EN_TRANSITO',
                          'LISTO_VALIDACION',
                          'PAGO_LIBERADO',
                          'REEMBOLSADO',
                          'DISPUTADO',
                          'CANCELADO'
                        ) NOT NULL DEFAULT 'PENDIENTE_PAGO',
  -- Pasarela de pago
  pasarela_pago         ENUM('STRIPE','PAYPAL') NULL,
  payment_intent_id     VARCHAR(255)        NULL      COMMENT 'Stripe PaymentIntent ID o PayPal Order ID',
  transfer_id           VARCHAR(255)        NULL      COMMENT 'ID de transferencia al vendedor',
  -- Método de entrega
  metodo_entrega        ENUM('EN_PARCELA','EN_SUCURSAL','ENVIO_LOGISTICA') NOT NULL,
  direccion_entrega     VARCHAR(255)        NULL,
  latitud_entrega       DECIMAL(10, 7)      NULL,
  longitud_entrega      DECIMAL(10, 7)      NULL,
  -- Notas
  notas_comprador       TEXT                NULL,
  notas_internas        TEXT                NULL,
  -- Timestamps
  fecha_orden           DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_pago            DATETIME            NULL,
  fecha_envio           DATETIME            NULL,
  fecha_entrega         DATETIME            NULL,
  fecha_liberacion      DATETIME            NULL,
  created_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_orden),
  UNIQUE KEY uq_numero_orden (numero_orden),
  CONSTRAINT fk_ot_comprador FOREIGN KEY (id_comprador) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_ot_vendedor  FOREIGN KEY (id_vendedor)  REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
  INDEX idx_ot_comprador  (id_comprador),
  INDEX idx_ot_vendedor   (id_vendedor),
  INDEX idx_ot_estado     (estado_pago),
  INDEX idx_ot_producto   (tipo_producto, id_producto),
  INDEX idx_ot_fecha      (fecha_orden),
  INDEX idx_ot_intent     (payment_intent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Órdenes y sistema de escrow — núcleo transaccional de AgroFlex';

-- =============================================================================
-- TABLA 11: Seguridad_QR
-- Token único por transacción para validación en punto de entrega física.
-- El QR es el mecanismo que libera el pago escrow.
-- =============================================================================
CREATE TABLE IF NOT EXISTS Seguridad_QR (
  id_qr               BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_orden            BIGINT UNSIGNED     NOT NULL UNIQUE COMMENT 'Un QR por orden',
  -- Token único e irrepetible
  token_qr            VARCHAR(128)        NOT NULL COMMENT 'UUID v4 + HMAC-SHA256 firmado',
  token_hash          VARCHAR(255)        NOT NULL COMMENT 'Hash seguro del token (verificación)',
  -- Estado del ciclo de vida del QR
  estado_qr           ENUM('GENERADO','ESCANEADO','VALIDADO','EXPIRADO','INVALIDO') NOT NULL DEFAULT 'GENERADO',
  -- Tiempos
  fecha_generacion    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion    DATETIME            NOT NULL COMMENT 'Token válido por 48h desde generación',
  fecha_escaneo       DATETIME            NULL     COMMENT 'Momento exacto del escaneo',
  fecha_validacion    DATETIME            NULL     COMMENT 'Momento de validación exitosa',
  -- Coordenadas GPS del lugar de entrega (capturadas al momento del escaneo)
  latitud_escaneo     DECIMAL(10, 7)      NULL     COMMENT 'GPS del comprador al escanear',
  longitud_escaneo    DECIMAL(10, 7)      NULL,
  precision_gps_m     DECIMAL(6, 1)       NULL     COMMENT 'Precisión GPS en metros',
  -- Coordenadas esperadas (definidas al crear la orden)
  latitud_esperada    DECIMAL(10, 7)      NULL,
  longitud_esperada   DECIMAL(10, 7)      NULL,
  radio_tolerancia_m  DECIMAL(6, 1)       NOT NULL DEFAULT 500.0 COMMENT 'Radio aceptable en metros',
  -- Resultado de validación geográfica
  distancia_calculada DECIMAL(8, 2)       NULL     COMMENT 'Distancia en metros entre GPS real vs esperado',
  geo_validado        TINYINT(1)          NULL     COMMENT '1=dentro del radio, 0=fuera de rango',
  -- Quién escaneó
  id_escaneado_por    BIGINT UNSIGNED     NULL     COMMENT 'FK al usuario comprador que escaneó',
  ip_escaneo          VARCHAR(45)         NULL     COMMENT 'IP del dispositivo (IPv4/IPv6)',
  user_agent_escaneo  VARCHAR(512)        NULL,
  -- Intentos fallidos (seguridad anti-fraude)
  intentos_fallidos   TINYINT UNSIGNED    NOT NULL DEFAULT 0,
  max_intentos        TINYINT UNSIGNED    NOT NULL DEFAULT 3,

  PRIMARY KEY (id_qr),
  UNIQUE KEY uq_token_qr (token_qr),
  CONSTRAINT fk_sqr_orden      FOREIGN KEY (id_orden)          REFERENCES Ordenes_Transaccion(id_orden) ON DELETE CASCADE,
  CONSTRAINT fk_sqr_escaneador FOREIGN KEY (id_escaneado_por)  REFERENCES Usuarios(id_usuario)          ON DELETE SET NULL,
  INDEX idx_sqr_estado   (estado_qr),
  INDEX idx_sqr_expiracion (fecha_expiracion),
  INDEX idx_sqr_token    (token_qr)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Códigos QR para validación de entrega física y liberación de escrow';

-- =============================================================================
-- TABLA 12: Historial_Estados_Orden
-- Auditoría completa de cambios de estado en órdenes
-- =============================================================================
CREATE TABLE IF NOT EXISTS Historial_Estados_Orden (
  id_historial      BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_orden          BIGINT UNSIGNED     NOT NULL,
  estado_anterior   VARCHAR(50)         NULL,
  estado_nuevo      VARCHAR(50)         NOT NULL,
  motivo            VARCHAR(255)        NULL,
  id_usuario_accion BIGINT UNSIGNED     NULL     COMMENT 'Quién realizó el cambio',
  metadata          JSON                NULL     COMMENT 'Datos adicionales del evento',
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_historial),
  CONSTRAINT fk_heo_orden   FOREIGN KEY (id_orden)          REFERENCES Ordenes_Transaccion(id_orden) ON DELETE CASCADE,
  CONSTRAINT fk_heo_usuario FOREIGN KEY (id_usuario_accion) REFERENCES Usuarios(id_usuario)          ON DELETE SET NULL,
  INDEX idx_heo_orden (id_orden),
  INDEX idx_heo_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Auditoría de cambios de estado en órdenes';

-- =============================================================================
-- TABLA 13: Reseñas_Calificaciones
-- Sistema de reputación bilateral (comprador califica vendedor y viceversa)
-- =============================================================================
CREATE TABLE IF NOT EXISTS Reseñas_Calificaciones (
  id_reseña         BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_orden          BIGINT UNSIGNED     NOT NULL,
  id_calificador    BIGINT UNSIGNED     NOT NULL COMMENT 'Quien escribe la reseña',
  id_calificado     BIGINT UNSIGNED     NOT NULL COMMENT 'Quien recibe la reseña',
  tipo_reseña       ENUM('COMPRADOR_A_VENDEDOR','VENDEDOR_A_COMPRADOR') NOT NULL,
  -- Calificación
  puntuacion        TINYINT UNSIGNED    NOT NULL COMMENT '1 a 5',
  comentario        TEXT                NULL,
  -- Aspectos específicos (JSON)
  aspectos          JSON                NULL     COMMENT '{"calidad_producto": 5, "puntualidad": 4, "comunicacion": 5}',
  -- Moderación
  visible           TINYINT(1)          NOT NULL DEFAULT 1,
  reportada         TINYINT(1)          NOT NULL DEFAULT 0,
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_reseña),
  UNIQUE KEY uq_reseña_orden_tipo (id_orden, tipo_reseña) COMMENT 'Una reseña por tipo por orden',
  CONSTRAINT fk_rc_orden        FOREIGN KEY (id_orden)       REFERENCES Ordenes_Transaccion(id_orden) ON DELETE CASCADE,
  CONSTRAINT fk_rc_calificador  FOREIGN KEY (id_calificador) REFERENCES Usuarios(id_usuario)          ON DELETE RESTRICT,
  CONSTRAINT fk_rc_calificado   FOREIGN KEY (id_calificado)  REFERENCES Usuarios(id_usuario)          ON DELETE RESTRICT,
  INDEX idx_rc_calificado (id_calificado),
  CONSTRAINT chk_puntuacion CHECK (puntuacion BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA 14: Notificaciones
-- Registro de todas las notificaciones enviadas al usuario
-- =============================================================================
CREATE TABLE IF NOT EXISTS Notificaciones (
  id_notif          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_usuario        BIGINT UNSIGNED     NOT NULL,
  tipo              ENUM('PUSH','SMS','EMAIL','IN_APP') NOT NULL,
  categoria         VARCHAR(60)         NULL     COMMENT 'orden_nueva, pago_liberado, qr_generado...',
  titulo            VARCHAR(200)        NOT NULL,
  cuerpo            TEXT                NULL,
  datos_extra       JSON                NULL     COMMENT 'Deep link, id_orden, etc.',
  -- Estado
  enviada           TINYINT(1)          NOT NULL DEFAULT 0,
  leida             TINYINT(1)          NOT NULL DEFAULT 0,
  error_envio       VARCHAR(255)        NULL,
  -- Timestamps
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enviada_at        DATETIME            NULL,
  leida_at          DATETIME            NULL,

  PRIMARY KEY (id_notif),
  CONSTRAINT fk_n_usuario FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_n_usuario  (id_usuario),
  INDEX idx_n_leida    (leida),
  INDEX idx_n_fecha    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLA 15: Disputas
-- Manejo de conflictos entre comprador y vendedor
-- =============================================================================
CREATE TABLE IF NOT EXISTS Disputas (
  id_disputa          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
  id_orden            BIGINT UNSIGNED     NOT NULL,
  id_iniciador        BIGINT UNSIGNED     NOT NULL,
  motivo              ENUM(
                        'PRODUCTO_NO_RECIBIDO',
                        'PRODUCTO_DIFERENTE',
                        'CALIDAD_INFERIOR',
                        'CANTIDAD_INCORRECTA',
                        'PROBLEMA_GPS',
                        'OTRO'
                      ) NOT NULL,
  descripcion         TEXT                NOT NULL,
  -- Resolución
  estado_disputa      ENUM('ABIERTA','EN_REVISION','RESUELTA_VENDEDOR','RESUELTA_COMPRADOR','CERRADA') NOT NULL DEFAULT 'ABIERTA',
  resolucion          TEXT                NULL,
  id_admin_resolutor  BIGINT UNSIGNED     NULL,
  monto_reembolso     DECIMAL(12, 2)      NULL,
  -- Timestamps
  created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resuelta_at         DATETIME            NULL,

  PRIMARY KEY (id_disputa),
  CONSTRAINT fk_d_orden     FOREIGN KEY (id_orden)           REFERENCES Ordenes_Transaccion(id_orden) ON DELETE RESTRICT,
  CONSTRAINT fk_d_iniciador FOREIGN KEY (id_iniciador)       REFERENCES Usuarios(id_usuario)          ON DELETE RESTRICT,
  CONSTRAINT fk_d_admin     FOREIGN KEY (id_admin_resolutor) REFERENCES Usuarios(id_usuario)          ON DELETE SET NULL,
  INDEX idx_d_orden  (id_orden),
  INDEX idx_d_estado (estado_disputa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TRIGGER: Generar número de orden automáticamente
-- =============================================================================
DELIMITER $$
CREATE TRIGGER trg_generar_numero_orden
BEFORE INSERT ON Ordenes_Transaccion
FOR EACH ROW
BEGIN
  DECLARE next_id BIGINT;
  SET next_id = (SELECT AUTO_INCREMENT FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Ordenes_Transaccion');
  SET NEW.numero_orden = CONCAT('AGF-', YEAR(NOW()), '-', LPAD(next_id, 6, '0'));
END$$
DELIMITER ;

-- =============================================================================
-- TRIGGER: Actualizar puntuación de reputación al insertar reseña
-- =============================================================================
DELIMITER $$
CREATE TRIGGER trg_actualizar_reputacion
AFTER INSERT ON Reseñas_Calificaciones
FOR EACH ROW
BEGIN
  UPDATE Usuarios
  SET
    puntuacion_rep = (
      SELECT ROUND(AVG(puntuacion), 2)
      FROM Reseñas_Calificaciones
      WHERE id_calificado = NEW.id_calificado AND visible = 1
    ),
    total_reseñas = (
      SELECT COUNT(*)
      FROM Reseñas_Calificaciones
      WHERE id_calificado = NEW.id_calificado AND visible = 1
    )
  WHERE id_usuario = NEW.id_calificado;
END$$
DELIMITER ;

-- =============================================================================
-- TRIGGER: Auditoría automática de cambios de estado en órdenes
-- =============================================================================
DELIMITER $$
CREATE TRIGGER trg_historial_orden
AFTER UPDATE ON Ordenes_Transaccion
FOR EACH ROW
BEGIN
  IF OLD.estado_pago <> NEW.estado_pago THEN
    INSERT INTO Historial_Estados_Orden (id_orden, estado_anterior, estado_nuevo)
    VALUES (NEW.id_orden, OLD.estado_pago, NEW.estado_pago);
  END IF;
END$$
DELIMITER ;

-- =============================================================================
-- TRIGGER: Reducir stock de suministro al crear orden
-- =============================================================================
DELIMITER $$
CREATE TRIGGER trg_reducir_stock_suministro
AFTER INSERT ON Ordenes_Transaccion
FOR EACH ROW
BEGIN
  IF NEW.tipo_producto = 'SUMINISTRO' THEN
    UPDATE Suministros_Tienda
    SET stock = stock - CAST(NEW.cantidad AS UNSIGNED)
    WHERE id_suministro = NEW.id_producto AND stock >= NEW.cantidad;
  END IF;
END$$
DELIMITER ;

-- =============================================================================
-- VIEWS útiles para reportes y dashboards
-- =============================================================================

-- Vista: Lotes disponibles con datos del productor
CREATE OR REPLACE VIEW v_lotes_disponibles AS
SELECT
  cl.id_lote,
  cl.titulo,
  cl.descripcion,
  tc.nombre          AS tipo_cultivo,
  tc.categoria       AS categoria_cultivo,
  cl.variedad,
  cl.cantidad_disponible,
  cl.unidad_venta,
  cl.precio_unitario,
  cl.moneda,
  cl.grado_calidad,
  cl.es_organico,
  cl.fecha_disponible,
  cl.fecha_vencimiento,
  cl.estado_republica,
  cl.municipio,
  cl.latitud,
  cl.longitud,
  u.id_usuario       AS id_productor,
  u.nombre           AS nombre_productor,
  u.puntuacion_rep   AS reputacion_productor,
  u.validado         AS productor_verificado,
  (SELECT firebase_url FROM Imagenes_Galeria ig
   WHERE ig.entidad_tipo = 'COSECHA_LOTE' AND ig.entidad_id = cl.id_lote
     AND ig.es_principal = 1 LIMIT 1) AS imagen_principal_url
FROM Cosechas_Lote cl
  JOIN Usuarios u        ON u.id_usuario = cl.id_productor
  JOIN Tipos_Cultivo tc  ON tc.id_cultivo = cl.id_cultivo
WHERE cl.estado_lote = 'DISPONIBLE'
  AND cl.deleted_at IS NULL
  AND u.activo = 1;

-- Vista: Dashboard de órdenes con estado de escrow
CREATE OR REPLACE VIEW v_ordenes_dashboard AS
SELECT
  ot.id_orden,
  ot.numero_orden,
  ot.tipo_producto,
  ot.id_producto,
  ot.cantidad,
  ot.unidad,
  ot.monto_total,
  ot.comision_plataforma,
  ot.monto_vendedor,
  ot.moneda,
  ot.estado_pago,
  ot.metodo_entrega,
  ot.fecha_orden,
  ot.fecha_entrega,
  ot.fecha_liberacion,
  -- Comprador
  uc.id_usuario      AS id_comprador,
  uc.nombre          AS nombre_comprador,
  uc.correo          AS correo_comprador,
  -- Vendedor
  uv.id_usuario      AS id_vendedor,
  uv.nombre          AS nombre_vendedor,
  uv.correo          AS correo_vendedor,
  -- QR
  sqr.id_qr,
  sqr.estado_qr,
  sqr.fecha_expiracion AS qr_expiracion,
  sqr.geo_validado
FROM Ordenes_Transaccion ot
  JOIN Usuarios uc       ON uc.id_usuario = ot.id_comprador
  JOIN Usuarios uv       ON uv.id_usuario = ot.id_vendedor
  LEFT JOIN Seguridad_QR sqr ON sqr.id_orden = ot.id_orden;

-- =============================================================================
-- ÍNDICES COMPUESTOS adicionales para rendimiento en consultas frecuentes
-- =============================================================================

-- Búsqueda de lotes por cultivo + estado + precio (filtros del catálogo)
CREATE INDEX idx_cl_filtros ON Cosechas_Lote(id_cultivo, estado_lote, precio_unitario);

-- Órdenes recientes por comprador
CREATE INDEX idx_ot_comprador_fecha ON Ordenes_Transaccion(id_comprador, fecha_orden DESC);

-- Órdenes recientes por vendedor
CREATE INDEX idx_ot_vendedor_fecha ON Ordenes_Transaccion(id_vendedor, fecha_orden DESC);

-- =============================================================================
-- DATOS SEMILLA: Usuario Admin inicial
-- Password: Admin@Agroflex2024! (BCrypt)
-- =============================================================================
INSERT INTO Usuarios (nombre, apellidos, correo, password_hash, validado, activo) VALUES
  ('Super', 'Admin', 'admin@agroflex.mx',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqdaXBWlBRkVqJnqvkRKX.5F2rqO',
   1, 1);

INSERT INTO Usuarios_Roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM Usuarios u, Roles r
WHERE u.correo = 'admin@agroflex.mx' AND r.nombre_rol = 'ADMIN';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- FIN DEL SCRIPT — AgroFlex v1.0.0
-- Tablas: 15 | Triggers: 4 | Views: 2 | Índices adicionales: 3
-- =============================================================================
