-- =============================================================================
-- AgroFlex — Payments Service Schema
-- Versión: V3 — Tablas de transacciones y escrow
-- Schema: agroflexsoa
-- Requiere: ordenes_transaccion (creada por V2__orders_tables.sql)
-- =============================================================================

USE agroflexsoa;

CREATE TABLE IF NOT EXISTS transacciones (
    id                         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    id_orden                   BIGINT          NOT NULL UNIQUE            COMMENT 'FK a ordenes_transaccion.id',
    id_comprador               BIGINT          NOT NULL,
    id_vendedor                BIGINT          NOT NULL,
    monto                      DECIMAL(10,2)   NOT NULL                  COMMENT 'Monto total cobrado en MXN',
    monto_comision             DECIMAL(10,2)   NOT NULL DEFAULT 0        COMMENT 'Comisión AgroFlex 3.5%',
    monto_vendedor             DECIMAL(10,2)   NOT NULL DEFAULT 0        COMMENT 'Monto neto para el vendedor',
    moneda                     VARCHAR(3)      NOT NULL DEFAULT 'MXN',
    metodo_pago                VARCHAR(20)     NOT NULL DEFAULT 'STRIPE',
    estado_pago                VARCHAR(20)     NOT NULL DEFAULT 'PENDIENTE',
    stripe_payment_intent_id   VARCHAR(100)    NULL                      COMMENT 'pi_xxxxx de Stripe',
    stripe_client_secret       VARCHAR(300)    NULL                      COMMENT 'Para confirmar desde frontend — NUNCA exponer en logs',
    stripe_transfer_id         VARCHAR(100)    NULL                      COMMENT 'transfer_xxxxx al liberar',
    stripe_charge_id           VARCHAR(100)    NULL                      COMMENT 'ch_xxxxx de Stripe',
    deleted_at                 DATETIME        NULL,
    fecha_creacion             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_pago                 TIMESTAMP       NULL                      COMMENT 'Cuando se confirma el pago',
    fecha_liberacion           TIMESTAMP       NULL                      COMMENT 'Cuando se libera al vendedor',

    CONSTRAINT fk_trans_orden FOREIGN KEY (id_orden)
        REFERENCES ordenes_transaccion(id),
    INDEX idx_trans_orden     (id_orden),
    INDEX idx_trans_comprador (id_comprador),
    INDEX idx_trans_vendedor  (id_vendedor),
    INDEX idx_trans_estado    (estado_pago),
    INDEX idx_trans_stripe_pi (stripe_payment_intent_id),
    INDEX idx_trans_charge    (stripe_charge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Transacciones de pago con Stripe para el sistema de escrow AgroFlex';

CREATE TABLE IF NOT EXISTS movimientos_escrow (
    id                BIGINT          PRIMARY KEY AUTO_INCREMENT,
    id_transaccion    BIGINT          NOT NULL,
    tipo_movimiento   VARCHAR(20)     NOT NULL              COMMENT 'RETENCION|LIBERACION|REEMBOLSO|COMISION',
    monto             DECIMAL(10,2)   NOT NULL,
    descripcion       VARCHAR(255)    NULL,
    stripe_event_id   VARCHAR(100)    NULL                  COMMENT 'ID del evento de Stripe',
    fecha_movimiento  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mov_transaccion FOREIGN KEY (id_transaccion)
        REFERENCES transacciones(id) ON DELETE CASCADE,
    INDEX idx_mov_trans (id_transaccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de movimientos de dinero en escrow';

SELECT 'Tablas de payments creadas correctamente' AS resultado;
