-- ============================================================
-- PATCH: Agregar foto de perfil a usuarios y publicaciones
-- Aplica si la columna no existe (idempotente con IF NOT EXISTS vía procedimiento)
-- ============================================================

-- 1. foto_perfil en tabla usuarios (si aún no existe)
ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `foto_perfil` VARCHAR(500) DEFAULT NULL COMMENT 'URL de la foto de perfil del usuario';

-- 2. foto_perfil_productor en cosechas_lote (denormalizada al momento de publicar)
ALTER TABLE `cosechas_lote`
  ADD COLUMN IF NOT EXISTS `foto_perfil_productor` VARCHAR(500) DEFAULT NULL COMMENT 'URL de foto de perfil del productor al momento de publicar el lote';
