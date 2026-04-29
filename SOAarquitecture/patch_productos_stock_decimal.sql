-- =============================================================================
-- AgroFlex — Parche: productos.stock INT → DECIMAL(12,3)
-- Ejecutar UNA SOLA VEZ sobre la base de datos existente
-- =============================================================================

USE agroflexsoa;

-- 1. Cambiar tipo de columna stock de INT a DECIMAL para soportar
--    cantidades fraccionarias de cosechas (kg, toneladas, etc.)
ALTER TABLE `productos`
  MODIFY COLUMN `stock` DECIMAL(12,3) NOT NULL
  COMMENT 'Para cosechas: cantidad en su unidad (kg/ton/saco). Para suministros: unidades enteras.';

-- 2. Agregar trigger que reduce la cantidad disponible en productos
--    cuando se crea una orden de tipo COSECHA_LOTE
--    (el trigger de suministros ya existía)
DROP TRIGGER IF EXISTS `trg_reducir_cantidad_cosecha`;

DELIMITER $$
CREATE TRIGGER `trg_reducir_cantidad_cosecha`
AFTER INSERT ON `ordenes_transaccion`
FOR EACH ROW
BEGIN
  IF NEW.tipo_producto = 'COSECHA_LOTE' THEN
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto
      AND stock >= NEW.cantidad;
  END IF;
END$$
DELIMITER ;
