-- =============================================================================
-- AgroFlex — Orders Service Schema
-- Versión: V2 — Tablas de pedidos y escrow
-- Schema: agroflexsoa
-- Requiere que la tabla Usuarios ya exista (creada por auth-service)
-- =============================================================================

USE agroflexsoa;

CREATE TABLE IF NOT EXISTS ordenes_transaccion (
    id                   BIGINT          PRIMARY KEY AUTO_INCREMENT,
    numero_orden         VARCHAR(50)     UNIQUE NOT NULL           COMMENT 'Formato: AGF-YYYY-NNNNNN',
    id_comprador         BIGINT          NOT NULL                  COMMENT 'FK a Usuarios.id_usuario',
    id_vendedor          BIGINT          NOT NULL                  COMMENT 'FK a Usuarios.id_usuario',
    estado               VARCHAR(30)     NOT NULL DEFAULT 'PENDIENTE',
    total_monto          DECIMAL(10,2)   NOT NULL,
    monto_escrow         DECIMAL(10,2)   NOT NULL DEFAULT 0,
    metodo_pago          VARCHAR(50)     DEFAULT 'STRIPE',
    id_transaccion_pago  VARCHAR(100)    NULL                      COMMENT 'ID de Stripe/PayPal',
    latitud_entrega      DECIMAL(10,8)   NULL,
    longitud_entrega     DECIMAL(11,8)   NULL,
    observaciones        TEXT            NULL,
    deleted_at           DATETIME        NULL,
    fecha_creacion       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_comprador (id_comprador),
    INDEX idx_vendedor  (id_vendedor),
    INDEX idx_estado    (estado),
    INDEX idx_fecha     (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Órdenes de compra-venta entre usuarios de AgroFlex';

CREATE TABLE IF NOT EXISTS items_pedido (
    id               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    id_orden         BIGINT          NOT NULL,
    id_producto      BIGINT          NOT NULL                  COMMENT 'ID del lote o suministro en catalog-service',
    tipo_producto    VARCHAR(50)     NOT NULL DEFAULT 'COSECHA_LOTE',
    cantidad         DECIMAL(10,2)   NOT NULL,
    precio_unitario  DECIMAL(10,2)   NOT NULL,
    subtotal         DECIMAL(10,2)   NOT NULL,
    nombre_producto  VARCHAR(200)    NULL                      COMMENT 'Snapshot del nombre al momento de compra',
    unidad_venta     VARCHAR(50)     NULL,

    CONSTRAINT fk_item_orden FOREIGN KEY (id_orden)
        REFERENCES ordenes_transaccion(id) ON DELETE CASCADE,
    INDEX idx_item_orden (id_orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS escrow (
    id               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    id_orden         BIGINT          NOT NULL UNIQUE,
    monto            DECIMAL(10,2)   NOT NULL,
    estado           VARCHAR(30)     NOT NULL DEFAULT 'RETENIDO'  COMMENT 'RETENIDO|LIBERADO|REEMBOLSADO',
    fecha_retencion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_liberacion TIMESTAMP       NULL,
    razon            VARCHAR(255)    NULL,

    CONSTRAINT fk_escrow_orden FOREIGN KEY (id_orden)
        REFERENCES ordenes_transaccion(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tablas de orders creadas correctamente' AS resultado;
