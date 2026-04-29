-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-03-2026 a las 20:31:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `agroflexsoa`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_suministro`
--

CREATE TABLE `categorias_suministro` (
  `id_categoria` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias_suministro`
--

INSERT INTO `categorias_suministro` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Herbicidas', NULL),
(2, 'Insecticidas', NULL),
(3, 'Fungicidas', NULL),
(4, 'Fertilizantes', NULL),
(5, 'Bioestimulantes', NULL),
(6, 'Semillas', NULL),
(7, 'Sustratos', NULL),
(8, 'Equipos de Riego', NULL),
(9, 'Herramientas', NULL),
(10, 'Equipos de Protección', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cosechas_lote`
--

CREATE TABLE `cosechas_lote` (
  `id_lote` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_productor` bigint(20) UNSIGNED NOT NULL COMMENT 'FK a Usuarios',
  `id_cultivo` smallint(5) UNSIGNED NOT NULL COMMENT 'FK a Tipos_Cultivo',
  `nombre_producto` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `imagen_url` varchar(512) DEFAULT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `cantidad_disponible` decimal(12,3) NOT NULL,
  `unidad_venta` varchar(50) NOT NULL,
  `contacto` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_lote`),
  KEY `idx_cl_productor` (`id_productor`),
  KEY `idx_cl_cultivo` (`id_cultivo`),
  KEY `idx_cl_ubicacion` (`ubicacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lotes de cosecha (publicaciones con campos simplificados para formulario)';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disputas`
--

CREATE TABLE `disputas` (
  `id_disputa` bigint(20) UNSIGNED NOT NULL,
  `id_orden` bigint(20) UNSIGNED NOT NULL,
  `id_iniciador` bigint(20) UNSIGNED NOT NULL,
  `motivo` enum('PRODUCTO_NO_RECIBIDO','PRODUCTO_DIFERENTE','CALIDAD_INFERIOR','CANTIDAD_INCORRECTA','PROBLEMA_GPS','OTRO') NOT NULL,
  `descripcion` text NOT NULL,
  `estado_disputa` enum('ABIERTA','EN_REVISION','RESUELTA_VENDEDOR','RESUELTA_COMPRADOR','CERRADA') NOT NULL DEFAULT 'ABIERTA',
  `resolucion` text DEFAULT NULL,
  `id_admin_resolutor` bigint(20) UNSIGNED DEFAULT NULL,
  `monto_reembolso` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `resuelta_at` datetime DEFAULT NULL,
  `admin_asignado` varchar(180) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `evidencia_url` varchar(500) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_resolucion` datetime(6) DEFAULT NULL,
  `id_pedido` bigint(20) NOT NULL,
  `id_reportante` bigint(20) NOT NULL,
  `tipo_reporte` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `escrow`
--

CREATE TABLE `escrow` (
  `id` bigint(20) NOT NULL,
  `estado` varchar(30) NOT NULL,
  `fecha_liberacion` datetime(6) DEFAULT NULL,
  `fecha_retencion` datetime(6) NOT NULL,
  `id_orden` bigint(20) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `razon` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estados_orden`
--

CREATE TABLE `historial_estados_orden` (
  `id_historial` bigint(20) UNSIGNED NOT NULL,
  `id_orden` bigint(20) UNSIGNED NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `id_usuario_accion` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Quién realizó el cambio',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Datos adicionales del evento' CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Auditoría de cambios de estado en órdenes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_galeria`
--

CREATE TABLE `imagenes_galeria` (
  `id_imagen` bigint(20) UNSIGNED NOT NULL,
  `entidad_tipo` varchar(20) DEFAULT NULL,
  `entidad_id` bigint(20) UNSIGNED NOT NULL,
  `firebase_url` varchar(512) NOT NULL COMMENT 'URL pública de descarga',
  `firebase_path` varchar(512) NOT NULL COMMENT 'Path interno en Firebase Storage',
  `firebase_bucket` varchar(255) DEFAULT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `tipo_mime` varchar(80) DEFAULT NULL COMMENT 'image/jpeg, image/webp...',
  `tamaño_bytes` int(10) UNSIGNED DEFAULT NULL,
  `ancho_px` int(11) DEFAULT NULL,
  `alto_px` int(11) DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Imagen principal del listado',
  `orden_display` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `tamano_bytes` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Galería de imágenes con referencias a Firebase Storage';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insignias_vendedor`
--

CREATE TABLE `insignias_vendedor` (
  `id_insignia` bigint(20) UNSIGNED NOT NULL,
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `tipo_documento` varchar(60) NOT NULL COMMENT 'INE, RFC, ACTA_CONSTITUTIVA, PERMISO_SAGARPA',
  `firebase_doc_url` varchar(512) NOT NULL COMMENT 'URL del documento almacenado en Firebase Storage',
  `firebase_doc_path` varchar(512) DEFAULT NULL COMMENT 'Path interno en Firebase para gestión',
  `nombre_negocio` varchar(180) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `descripcion_negocio` text DEFAULT NULL,
  `estado_verificacion` varchar(20) DEFAULT NULL,
  `motivo_rechazo` varchar(255) DEFAULT NULL,
  `verificado_por` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'id_usuario del admin',
  `fecha_verificacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documentos e insignias de productores/proveedores verificadas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `items_pedido`
--

CREATE TABLE `items_pedido` (
  `id` bigint(20) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `id_producto` bigint(20) NOT NULL,
  `nombre_producto` varchar(200) DEFAULT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tipo_producto` varchar(50) NOT NULL,
  `unidad_venta` varchar(50) DEFAULT NULL,
  `id_orden` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_escrow`
--

CREATE TABLE `movimientos_escrow` (
  `id` bigint(20) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_movimiento` datetime(6) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `stripe_event_id` varchar(100) DEFAULT NULL,
  `tipo_movimiento` enum('RETENCION','LIBERACION','REEMBOLSO','COMISION') NOT NULL,
  `id_transaccion` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notif` bigint(20) UNSIGNED NOT NULL,
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('PUSH','SMS','EMAIL','IN_APP') NOT NULL,
  `categoria` varchar(60) DEFAULT NULL COMMENT 'orden_nueva, pago_liberado, qr_generado...',
  `titulo` varchar(200) NOT NULL,
  `cuerpo` text DEFAULT NULL,
  `datos_extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Deep link, id_orden, etc.' CHECK (json_valid(`datos_extra`)),
  `enviada` tinyint(1) NOT NULL DEFAULT 0,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `error_envio` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `enviada_at` datetime DEFAULT NULL,
  `leida_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_transaccion`
--

CREATE TABLE `ordenes_transaccion` (
  `id_orden` bigint(20) UNSIGNED NOT NULL,
  `numero_orden` varchar(20) NOT NULL COMMENT 'AGF-2024-000001',
  `id_comprador` bigint(20) UNSIGNED NOT NULL,
  `id_vendedor` bigint(20) UNSIGNED NOT NULL,
  `tipo_producto` enum('COSECHA_LOTE','SUMINISTRO') NOT NULL,
  `id_producto` bigint(20) UNSIGNED NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `unidad` varchar(50) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL COMMENT 'cantidad * precio_unitario',
  `comision_plataforma` decimal(12,2) NOT NULL COMMENT 'AgroFlex cobra % de la transacción',
  `porcentaje_comision` decimal(5,2) NOT NULL DEFAULT 3.50 COMMENT '% cobrado por AgroFlex',
  `comision_pasarela` decimal(12,2) DEFAULT NULL COMMENT 'Comisión Stripe/PayPal',
  `monto_total` decimal(12,2) NOT NULL COMMENT 'subtotal + comision_plataforma',
  `monto_vendedor` decimal(12,2) NOT NULL COMMENT 'Lo que recibe el productor',
  `moneda` char(3) NOT NULL DEFAULT 'MXN',
  `estado_pago` enum('PENDIENTE_PAGO','PAGO_RETENIDO','EN_TRANSITO','LISTO_VALIDACION','PAGO_LIBERADO','REEMBOLSADO','DISPUTADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE_PAGO',
  `pasarela_pago` enum('STRIPE','PAYPAL') DEFAULT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL COMMENT 'Stripe PaymentIntent ID o PayPal Order ID',
  `transfer_id` varchar(255) DEFAULT NULL COMMENT 'ID de transferencia al vendedor',
  `metodo_entrega` enum('EN_PARCELA','EN_SUCURSAL','ENVIO_LOGISTICA') NOT NULL,
  `direccion_entrega` varchar(255) DEFAULT NULL,
  `latitud_entrega` decimal(10,8) DEFAULT NULL,
  `longitud_entrega` decimal(11,8) DEFAULT NULL,
  `notas_comprador` text DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `fecha_orden` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_pago` datetime DEFAULT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `fecha_liberacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime(6) DEFAULT NULL,
  `estado` enum('PENDIENTE','CONFIRMADO','EN_TRANSITO','LISTO_ENTREGA','ENTREGADO','COMPLETADO','CANCELADO','DISPUTADO','REEMBOLSADO') NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `id_transaccion_pago` varchar(100) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `monto_escrow` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `total_monto` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Órdenes y sistema de escrow — núcleo transaccional de AgroFlex';

--
-- Disparadores `ordenes_transaccion`
--
DELIMITER $$
CREATE TRIGGER `trg_generar_numero_orden` BEFORE INSERT ON `ordenes_transaccion` FOR EACH ROW BEGIN
  DECLARE next_id BIGINT;
  SET next_id = (SELECT AUTO_INCREMENT FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Ordenes_Transaccion');
  SET NEW.numero_orden = CONCAT('AGF-', YEAR(NOW()), '-', LPAD(next_id, 6, '0'));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_historial_orden` AFTER UPDATE ON `ordenes_transaccion` FOR EACH ROW BEGIN
  IF OLD.estado_pago <> NEW.estado_pago THEN
    INSERT INTO Historial_Estados_Orden (id_orden, estado_anterior, estado_nuevo)
    VALUES (NEW.id_orden, OLD.estado_pago, NEW.estado_pago);
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_reducir_stock_suministro` AFTER INSERT ON `ordenes_transaccion` FOR EACH ROW BEGIN
  IF NEW.tipo_producto = 'SUMINISTRO' THEN
    UPDATE Suministros_Tienda
    SET stock = stock - CAST(NEW.cantidad AS UNSIGNED)
    WHERE id_suministro = NEW.id_producto AND stock >= NEW.cantidad;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_reducir_cantidad_cosecha` AFTER INSERT ON `ordenes_transaccion` FOR EACH ROW BEGIN
  IF NEW.tipo_producto = 'COSECHA_LOTE' THEN
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto AND stock >= NEW.cantidad;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos_transaccion`
--

CREATE TABLE `pagos_transaccion` (
  `id` bigint(20) NOT NULL,
  `id_orden` bigint(20) NOT NULL,
  `referencia_stripe` varchar(100) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_comision` decimal(10,2) DEFAULT NULL,
  `monto_vendedor` decimal(10,2) DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'PENDIENTE',
  `metodo` varchar(50) DEFAULT NULL,
  `simulado` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_liberacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` bigint(20) NOT NULL,
  `activo` bit(1) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `destacado` bit(1) DEFAULT NULL,
  `disponibilidad` varchar(20) DEFAULT NULL,
  `estado_republica` varchar(80) DEFAULT NULL,
  `id_vendedor` bigint(20) NOT NULL,
  `imagen_principal` varchar(500) DEFAULT NULL,
  `municipio` varchar(80) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `nombre_vendedor` varchar(150) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `rol_vendedor` varchar(30) DEFAULT NULL,
  `stock` decimal(12,3) DEFAULT NULL COMMENT 'Solo para suministros. NULL para cosechas (se vende el lote completo, todo o nada).',
  `tipo` varchar(20) NOT NULL,
  `unidad` varchar(50) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `vendedor_verificado` bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `activo`, `created_at`, `descripcion`, `destacado`, `disponibilidad`, `estado_republica`, `id_vendedor`, `imagen_principal`, `municipio`, `nombre`, `nombre_vendedor`, `precio`, `rol_vendedor`, `stock`, `tipo`, `unidad`, `updated_at`, `vendedor_verificado`) VALUES
(1, b'1', '2026-03-16 16:44:14.000000', 'Cosecha fresca', b'0', 'disponible', 'Puebla', 99, NULL, 'Tepeaca', 'Chile Poblano Test', 'Carlos Hernandez', 8.50, 'PRODUCTOR', 2500, 'cosecha', 'kg', '2026-03-16 16:44:14.000000', b'0'),
(2, b'1', '2026-03-17 23:50:54.000000', 'Chile habanero de primera calidad', b'0', 'disponible', 'Puebla', 9, NULL, 'Tepeaca', 'Chile Habanero Lote #001', 'Maria', 15.00, 'PRODUCTOR', 500, 'cosecha', 'kg', '2026-03-17 23:50:54.000000', b'0'),
(3, b'1', '2026-03-17 23:52:35.000000', 'Vendo chiles de invernaderos frescos.', b'0', 'disponible', 'Puebla', 10, NULL, 'tepeaca', 'chile publano', 'Josue', 5000.00, 'PRODUCTOR', 10000, 'cosecha', 'tonelada', '2026-03-17 23:52:35.000000', b'0'),
(4, b'1', '2026-03-18 12:45:40.000000', 'AS<XZDCFVBGBN', b'0', 'disponible', 'Jalisco', 11, NULL, 'TECA', 'PLATTANOS', 'Sofia', 150000.00, 'PRODUCTOR', 225565, 'cosecha', 'tonelada', '2026-03-18 12:45:40.000000', b'0'),
(5, b'1', '2026-03-19 22:59:53.000000', 'vendo milpero por bultos', b'0', 'disponible', 'Puebla', 10, NULL, 'tepeaca', 'Milpero', 'Josue', 50000.00, 'PRODUCTOR', 2000, 'cosecha', 'saco', '2026-03-19 22:59:53.000000', b'0'),
(6, b'1', '2026-03-19 23:09:47.000000', 'qwafqwafqw', b'0', 'disponible', 'Guerrero', 10, 'https://res.cloudinary.com/do5jln6yw/image/upload/v1773983374/agroflex/productos/10/uktjhjjvr5ngexmswora.jpg', 'wtsegeadsv', 'wdq3wfd', 'Josue', 4555.00, 'PRODUCTOR', 727721, 'cosecha', 'rollo', '2026-03-19 23:09:47.000000', b'0');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reseñas_calificaciones`
--

CREATE TABLE `reseñas_calificaciones` (
  `id_reseña` bigint(20) UNSIGNED NOT NULL,
  `id_orden` bigint(20) UNSIGNED NOT NULL,
  `id_calificador` bigint(20) UNSIGNED NOT NULL COMMENT 'Quien escribe la reseña',
  `id_calificado` bigint(20) UNSIGNED NOT NULL COMMENT 'Quien recibe la reseña',
  `tipo_reseña` enum('COMPRADOR_A_VENDEDOR','VENDEDOR_A_COMPRADOR') NOT NULL,
  `puntuacion` tinyint(3) UNSIGNED NOT NULL COMMENT '1 a 5',
  `comentario` text DEFAULT NULL,
  `aspectos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '{"calidad_producto": 5, "puntualidad": 4, "comunicacion": 5}' CHECK (json_valid(`aspectos`)),
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `reportada` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Disparadores `reseñas_calificaciones`
--
DELIMITER $$
CREATE TRIGGER `trg_actualizar_reputacion` AFTER INSERT ON `reseñas_calificaciones` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `nombre_rol` varchar(50) NOT NULL COMMENT 'PRODUCTOR, INVERNADERO, PROVEEDOR, EMPAQUE, COMPRADOR, ADMIN',
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'PRODUCTOR', 'Agricultor que vende lotes de cosecha directamente'),
(2, 'INVERNADERO', 'Operador de invernadero con producción controlada'),
(3, 'PROVEEDOR', 'Proveedor de agroinsumos y agroquímicos'),
(4, 'EMPAQUE', 'Centro de empaque y procesamiento'),
(5, 'COMPRADOR', 'Comprador de lotes o suministros'),
(6, 'ADMIN', 'Administrador de la plataforma AgroFlex');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguridad_qr`
--

CREATE TABLE `seguridad_qr` (
  `id_qr` bigint(20) UNSIGNED NOT NULL,
  `id_orden` bigint(20) UNSIGNED NOT NULL COMMENT 'Un QR por orden',
  `token_qr` varchar(128) NOT NULL COMMENT 'UUID v4 + HMAC-SHA256 firmado',
  `token_hash` varchar(255) NOT NULL COMMENT 'Hash seguro del token (verificación)',
  `estado_qr` enum('GENERADO','ESCANEADO','VALIDADO','EXPIRADO','INVALIDO') NOT NULL DEFAULT 'GENERADO',
  `fecha_generacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL COMMENT 'Token válido por 48h desde generación',
  `fecha_escaneo` datetime DEFAULT NULL COMMENT 'Momento exacto del escaneo',
  `fecha_validacion` datetime DEFAULT NULL COMMENT 'Momento de validación exitosa',
  `latitud_escaneo` decimal(10,7) DEFAULT NULL COMMENT 'GPS del comprador al escanear',
  `longitud_escaneo` decimal(10,7) DEFAULT NULL,
  `precision_gps_m` decimal(6,1) DEFAULT NULL COMMENT 'Precisión GPS en metros',
  `latitud_esperada` decimal(10,7) DEFAULT NULL,
  `longitud_esperada` decimal(10,7) DEFAULT NULL,
  `radio_tolerancia_m` decimal(6,1) NOT NULL DEFAULT 500.0 COMMENT 'Radio aceptable en metros',
  `distancia_calculada` decimal(8,2) DEFAULT NULL COMMENT 'Distancia en metros entre GPS real vs esperado',
  `geo_validado` tinyint(1) DEFAULT NULL COMMENT '1=dentro del radio, 0=fuera de rango',
  `id_escaneado_por` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'FK al usuario comprador que escaneó',
  `ip_escaneo` varchar(45) DEFAULT NULL COMMENT 'IP del dispositivo (IPv4/IPv6)',
  `user_agent_escaneo` varchar(512) DEFAULT NULL,
  `intentos_fallidos` int(11) NOT NULL,
  `max_intentos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Códigos QR para validación de entrega física y liberación de escrow';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_insignia`
--

CREATE TABLE `solicitudes_insignia` (
  `id` bigint(20) NOT NULL,
  `admin_revisor` varchar(180) DEFAULT NULL,
  `correo_usuario` varchar(180) DEFAULT NULL,
  `documento_url` varchar(500) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_resolucion` datetime(6) DEFAULT NULL,
  `fecha_solicitud` datetime(6) NOT NULL,
  `id_usuario` bigint(20) NOT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `motivo_solicitud` text DEFAULT NULL,
  `nombre_usuario` varchar(150) DEFAULT NULL,
  `rol_solicitado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

--
-- Volcado de datos para la tabla `solicitudes_insignia`
--

INSERT INTO `solicitudes_insignia` (`id`, `admin_revisor`, `correo_usuario`, `documento_url`, `estado`, `fecha_resolucion`, `fecha_solicitud`, `id_usuario`, `motivo_rechazo`, `motivo_solicitud`, `nombre_usuario`, `rol_solicitado`) VALUES
(1, 'AUTO_APROBADO', 'maria@test.com', NULL, 'APROBADA', '2026-03-17 23:43:38.000000', '2026-03-17 23:43:38.000000', 9, NULL, 'Rancho La Esperanza - Tepeaca, Puebla. Cultivamos jitomate y chile', 'Maria Lopez', 'PRODUCTOR'),
(2, 'AUTO_APROBADO', 'joscot222@gmail.com', NULL, 'APROBADA', '2026-03-17 23:45:59.000000', '2026-03-17 23:45:59.000000', 10, NULL, 'Candelaria purificacion  - tepeaca, Puebla. Vendemos cosechas ', 'Josue Coto Reyes', 'PRODUCTOR'),
(3, 'AUTO_APROBADO', 'kimsofyv1995@gmail.com', NULL, 'APROBADA', '2026-03-18 12:44:28.000000', '2026-03-18 12:44:28.000000', 11, NULL, 'XOCHI - TECA, Tlaxcala. VENDO TACOS', 'Sofia Rosas Ruiz', 'PRODUCTOR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suministros_tienda`
--

CREATE TABLE `suministros_tienda` (
  `id_suministro` bigint(20) UNSIGNED NOT NULL,
  `id_proveedor` bigint(20) UNSIGNED NOT NULL,
  `id_categoria` smallint(5) UNSIGNED NOT NULL,
  `nombre_comercial` varchar(200) NOT NULL,
  `nombre_generico` varchar(200) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `numero_registro` varchar(80) DEFAULT NULL COMMENT 'Registro COFEPRIS/SENASICA',
  `presentacion` varchar(100) NOT NULL COMMENT 'Ej: Bolsa 1kg, Frasco 1L, Caja 20pz',
  `contenido_neto` decimal(10,3) NOT NULL,
  `unidad_medida` enum('KG','G','L','ML','PIEZA','CAJA','LITRO') NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `moneda` char(3) NOT NULL DEFAULT 'MXN',
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_minimo` int(10) UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Alerta de stock bajo',
  `descripcion` text DEFAULT NULL,
  `ingrediente_activo` varchar(255) DEFAULT NULL,
  `modo_accion` text DEFAULT NULL,
  `hoja_seguridad_url` varchar(512) DEFAULT NULL COMMENT 'URL Firebase del PDF',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de agroinsumos de proveedores verificados';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_cultivo`
--

CREATE TABLE `tipos_cultivo` (
  `id_cultivo` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` varchar(60) DEFAULT NULL COMMENT 'Hortalizas, Frutas, Granos, Flores...',
  `temporada` varchar(60) DEFAULT NULL COMMENT 'Todo el año, Verano, Invierno...',
  `imagen_url` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipos_cultivo`
--

INSERT INTO `tipos_cultivo` (`id_cultivo`, `nombre`, `categoria`, `temporada`, `imagen_url`) VALUES
(1, 'Tomate Rojo (Jitomate)', 'Hortalizas', NULL, NULL),
(2, 'Chile Jalapeño', 'Hortalizas', NULL, NULL),
(3, 'Chile Serrano', 'Hortalizas', NULL, NULL),
(4, 'Pepino', 'Hortalizas', NULL, NULL),
(5, 'Calabacita', 'Hortalizas', NULL, NULL),
(6, 'Pimiento Morrón', 'Hortalizas', NULL, NULL),
(7, 'Lechuga', 'Hortalizas', NULL, NULL),
(8, 'Espinaca', 'Hortalizas', NULL, NULL),
(9, 'Brócoli', 'Hortalizas', NULL, NULL),
(10, 'Cebolla', 'Hortalizas', NULL, NULL),
(11, 'Aguacate Hass', 'Frutas', NULL, NULL),
(12, 'Fresa', 'Frutas', NULL, NULL),
(13, 'Melón', 'Frutas', NULL, NULL),
(14, 'Sandía', 'Frutas', NULL, NULL),
(15, 'Mango Ataulfo', 'Frutas', NULL, NULL),
(16, 'Maíz Blanco', 'Granos', NULL, NULL),
(17, 'Trigo', 'Granos', NULL, NULL),
(18, 'Sorgo', 'Granos', NULL, NULL),
(19, 'Rosa', 'Flores', NULL, NULL),
(20, 'Crisantemo', 'Flores', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id` bigint(20) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `estado_pago` enum('PENDIENTE','PROCESANDO','PAGADO','LIBERADO','REEMBOLSADO','FALLIDO','DISPUTADO') NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_liberacion` datetime(6) DEFAULT NULL,
  `fecha_pago` datetime(6) DEFAULT NULL,
  `id_comprador` bigint(20) NOT NULL,
  `id_orden` bigint(20) NOT NULL,
  `id_vendedor` bigint(20) NOT NULL,
  `metodo_pago` enum('STRIPE','PAYPAL') DEFAULT NULL,
  `moneda` varchar(3) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_comision` decimal(10,2) DEFAULT NULL,
  `monto_vendedor` decimal(10,2) DEFAULT NULL,
  `stripe_charge_id` varchar(100) DEFAULT NULL,
  `stripe_client_secret` varchar(300) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(100) DEFAULT NULL,
  `stripe_transfer_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellidos` varchar(120) NOT NULL,
  `correo` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'BCrypt hash',
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL COMMENT 'Coordenada GPS latitud',
  `longitud` decimal(10,7) DEFAULT NULL COMMENT 'Coordenada GPS longitud',
  `estado_republica` varchar(80) DEFAULT NULL,
  `municipio` varchar(80) DEFAULT NULL,
  `puntuacion_rep` decimal(38,2) DEFAULT NULL,
  `total_reseñas` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `validado` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=pendiente, 1=verificado',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `firebase_uid` varchar(128) DEFAULT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Todos los actores: productores, compradores, proveedores, admins';

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellidos`, `correo`, `password_hash`, `telefono`, `direccion`, `latitud`, `longitud`, `estado_republica`, `municipio`, `puntuacion_rep`, `total_reseñas`, `validado`, `activo`, `firebase_uid`, `fcm_token`, `created_at`, `updated_at`, `deleted_at`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'Super', 'Admin', 'admin@agroflex.mx', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqdaXBWlBRkVqJnqvkRKX.5F2rqO', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 1, 1, NULL, NULL, '2026-03-15 15:21:44', '2026-03-15 15:21:44', NULL, NULL, NULL),
(3, 'Carlos', 'Hernandez', 'productor@agroflex.mx', '$2y$10$WgRJ/AhvJ8QiuGzqZhuJLeAau/QikuM92LnWEaAhaywmILDeW3Shu', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 1, 1, NULL, NULL, '2026-03-16 20:20:33', '2026-03-16 21:16:55', NULL, NULL, NULL),
(5, 'Administrador', 'AgroFlex', 'adminn@agroflex.mx', '$2y$10$6caSz2MdOdhnD514q3C.SuD3UtBj2WIg8J4l4.f/UGjpmzsEkjcwS', '5500000000', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, NULL, NULL, '2026-03-17 10:32:24', '2026-03-17 10:32:24', NULL, NULL, NULL),
(7, 'Test', 'Usuario', 'test123@test.com', '$2a$10$X0TEbquWb.INtuDfXL925O.YAb1YzbOtAQ3Yq5hsTkpljHfcGFSaW', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-17 14:25:13', '2026-03-17 14:25:13', NULL, NULL, NULL),
(8, 'Test', 'Usuario', 'test@test.com', '$2a$10$boeU9cb10Lxn3HZd19UOpOMLBHCRvX/SNyZ.TCv4tbGN9AWCSrMja', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-17 22:59:22', '2026-03-17 22:59:22', NULL, NULL, NULL),
(9, 'Maria', 'Lopez', 'maria@test.com', '$2a$10$hp8JMZv0LbtxdY4A/31MEeZXqL23T5HZO1DBkuZS50x6ruo4NLzFm', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 1, 1, NULL, NULL, '2026-03-17 23:07:17', '2026-03-17 23:43:38', NULL, NULL, NULL),
(10, 'Josue', 'Coto Reyes', 'joscot222@gmail.com', '$2a$10$lTtbkJV4ZHHE/KzhUQMPAebFNKt/KbfcDfQj/zKt951nigzdYhQ.W', '+522231176388', NULL, NULL, NULL, NULL, NULL, 0.00, 0, 1, 1, 'nkioyeBImCVLVvU00nFefXoAiT73', NULL, '2026-03-17 23:10:56', '2026-03-20 00:13:01', NULL, NULL, NULL),
(11, 'Sofia', 'Rosas Ruiz', 'kimsofyv1995@gmail.com', '$2a$10$30K2rLY7GOUqfry8EdXo6eP/UHuPOssHRUvl342lMB/e76l1WtdOa', '2491106450', NULL, NULL, NULL, NULL, NULL, 0.00, 0, 1, 1, NULL, NULL, '2026-03-18 09:17:20', '2026-03-18 12:44:28', NULL, NULL, NULL),
(12, 'Susana', 'Torres', 'susanatorres28351@gmail.com', 'GOOGLE_ddwEJWzaBCTIrEmzucckkEVCB483', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, 'ddwEJWzaBCTIrEmzucckkEVCB483', NULL, '2026-03-20 00:11:43', '2026-03-20 00:11:43', NULL, NULL, NULL),
(13, 'Test', 'User', 'test2@test.com', '$2a$10$rt7LfYEwVld9oj2GTM8mf.vhAPn9lJSx8OP1FYck/0bQDuhuXMMdm', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-22 16:59:05', '2026-03-22 16:59:05', NULL, NULL, NULL),
(14, 'Test', 'User', 'test3@test.com', '$2a$10$1k7iyo.TRcgm1ecIe2ddeuyb4HJA.kGDpEkjxnZQt37hYYuj6CCka', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-22 16:59:29', '2026-03-22 16:59:29', NULL, NULL, NULL),
(15, 'Test', 'User', 'debugtest@test.com', '$2a$10$PUQi9nIk6ZEjHtNECJK0Te7k2j16HzCo4eHvdgLg56gXGmYfooCV.', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-23 22:59:01', '2026-03-23 22:59:01', NULL, NULL, NULL),
(16, 'Test', 'Productor', 'testprod@agroflex.mx', '$2a$10$mAI90Wku1snGrcbkXQ1qvuXLQcOOZ5CuLjsgGQZJeB56k8SkLXjZe', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-24 12:53:34', '2026-03-24 12:53:34', NULL, NULL, NULL),
(17, 'Test', 'Productor', 'testprod2@agroflex.mx', '$2a$10$TCLh1QyQOZ64iove6L/O5uPbq8Vj6PNc8WxviGl4rTyLqizgxrK5a', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-24 12:54:52', '2026-03-24 12:54:52', NULL, NULL, NULL),
(18, 'Test', 'Productor', 'testprod3@agroflex.mx', '$2a$10$p/50aSFfbohKKpGG9WjUqe9rRtUnsxqZPU8Qqcvp8KwPFppgt/ZMe', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, NULL, NULL, '2026-03-24 12:55:19', '2026-03-24 12:55:19', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_roles`
--

CREATE TABLE `usuarios_roles` (
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `asignado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios_roles`
--

INSERT INTO `usuarios_roles` (`id_usuario`, `id_rol`, `asignado_en`) VALUES
(1, 6, '2026-03-15 15:21:44'),
(3, 1, '2026-03-16 20:20:33'),
(5, 6, '2026-03-17 10:35:20'),
(7, 5, '2026-03-17 14:25:14'),
(8, 5, '2026-03-17 22:59:22'),
(9, 1, '2026-03-17 23:43:38'),
(9, 5, '2026-03-17 23:07:17'),
(10, 1, '2026-03-17 23:45:59'),
(10, 5, '2026-03-17 23:10:56'),
(11, 1, '2026-03-18 12:44:28'),
(11, 5, '2026-03-18 09:17:20'),
(12, 5, '2026-03-20 00:11:43'),
(13, 5, '2026-03-22 16:59:06'),
(14, 5, '2026-03-22 16:59:29'),
(15, 5, '2026-03-23 22:59:01'),
(16, 5, '2026-03-24 12:53:34'),
(17, 1, '2026-03-24 12:54:52'),
(18, 1, '2026-03-24 12:55:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `validaciones_qr`
--

CREATE TABLE `validaciones_qr` (
  `id` bigint(20) NOT NULL,
  `codigo_qr` varchar(100) NOT NULL,
  `id_orden` bigint(20) NOT NULL,
  `id_comprador` bigint(20) NOT NULL,
  `id_vendedor` bigint(20) NOT NULL,
  `lat_entrega` double DEFAULT NULL,
  `lng_entrega` double DEFAULT NULL,
  `lat_validacion` double DEFAULT NULL,
  `lng_validacion` double DEFAULT NULL,
  `distancia_metros` double DEFAULT NULL,
  `validado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `intentos_fallidos` int(11) DEFAULT 0,
  `fecha_generacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_validacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=sjis COLLATE=sjis_bin;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_lotes_disponibles`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_lotes_disponibles` (
`id_lote` bigint(20) unsigned
,`titulo` varchar(200)
,`descripcion` text
,`tipo_cultivo` varchar(100)
,`categoria_cultivo` varchar(60)
,`variedad` varchar(100)
,`cantidad_disponible` decimal(12,3)
,`unidad_venta` varchar(30)
,`precio_unitario` decimal(10,2)
,`moneda` varchar(10)
,`grado_calidad` varchar(20)
,`es_organico` tinyint(1)
,`fecha_disponible` date
,`fecha_vencimiento` date
,`estado_republica` varchar(80)
,`municipio` varchar(80)
,`latitud` double
,`longitud` double
,`id_productor` bigint(20) unsigned
,`nombre_productor` varchar(120)
,`reputacion_productor` decimal(38,2)
,`productor_verificado` tinyint(1)
,`imagen_principal_url` varchar(512)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ordenes_dashboard`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ordenes_dashboard` (
`id_orden` bigint(20) unsigned
,`numero_orden` varchar(20)
,`tipo_producto` enum('COSECHA_LOTE','SUMINISTRO')
,`id_producto` bigint(20) unsigned
,`cantidad` decimal(12,2)
,`unidad` varchar(50)
,`monto_total` decimal(12,2)
,`comision_plataforma` decimal(12,2)
,`monto_vendedor` decimal(12,2)
,`moneda` char(3)
,`estado_pago` enum('PENDIENTE_PAGO','PAGO_RETENIDO','EN_TRANSITO','LISTO_VALIDACION','PAGO_LIBERADO','REEMBOLSADO','DISPUTADO','CANCELADO')
,`metodo_entrega` enum('EN_PARCELA','EN_SUCURSAL','ENVIO_LOGISTICA')
,`fecha_orden` datetime
,`fecha_entrega` datetime
,`fecha_liberacion` datetime
,`id_comprador` bigint(20) unsigned
,`nombre_comprador` varchar(120)
,`correo_comprador` varchar(180)
,`id_vendedor` bigint(20) unsigned
,`nombre_vendedor` varchar(120)
,`correo_vendedor` varchar(180)
,`id_qr` bigint(20) unsigned
,`estado_qr` enum('GENERADO','ESCANEADO','VALIDADO','EXPIRADO','INVALIDO')
,`qr_expiracion` datetime
,`geo_validado` tinyint(1)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_lotes_disponibles`
--
DROP TABLE IF EXISTS `v_lotes_disponibles`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_lotes_disponibles`  AS SELECT `cl`.`id_lote` AS `id_lote`, `cl`.`titulo` AS `titulo`, `cl`.`descripcion` AS `descripcion`, `tc`.`nombre` AS `tipo_cultivo`, `tc`.`categoria` AS `categoria_cultivo`, `cl`.`variedad` AS `variedad`, `cl`.`cantidad_disponible` AS `cantidad_disponible`, `cl`.`unidad_venta` AS `unidad_venta`, `cl`.`precio_unitario` AS `precio_unitario`, `cl`.`moneda` AS `moneda`, `cl`.`grado_calidad` AS `grado_calidad`, `cl`.`es_organico` AS `es_organico`, `cl`.`fecha_disponible` AS `fecha_disponible`, `cl`.`fecha_vencimiento` AS `fecha_vencimiento`, `cl`.`estado_republica` AS `estado_republica`, `cl`.`municipio` AS `municipio`, `cl`.`latitud` AS `latitud`, `cl`.`longitud` AS `longitud`, `u`.`id_usuario` AS `id_productor`, `u`.`nombre` AS `nombre_productor`, `u`.`puntuacion_rep` AS `reputacion_productor`, `u`.`validado` AS `productor_verificado`, (select `ig`.`firebase_url` from `imagenes_galeria` `ig` where `ig`.`entidad_tipo` = 'COSECHA_LOTE' and `ig`.`entidad_id` = `cl`.`id_lote` and `ig`.`es_principal` = 1 limit 1) AS `imagen_principal_url` FROM ((`cosechas_lote` `cl` join `usuarios` `u` on(`u`.`id_usuario` = `cl`.`id_productor`)) join `tipos_cultivo` `tc` on(`tc`.`id_cultivo` = `cl`.`id_cultivo`)) WHERE `cl`.`estado_lote` = 'DISPONIBLE' AND `cl`.`deleted_at` is null AND `u`.`activo` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ordenes_dashboard`
--
DROP TABLE IF EXISTS `v_ordenes_dashboard`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ordenes_dashboard`  AS SELECT `ot`.`id_orden` AS `id_orden`, `ot`.`numero_orden` AS `numero_orden`, `ot`.`tipo_producto` AS `tipo_producto`, `ot`.`id_producto` AS `id_producto`, `ot`.`cantidad` AS `cantidad`, `ot`.`unidad` AS `unidad`, `ot`.`monto_total` AS `monto_total`, `ot`.`comision_plataforma` AS `comision_plataforma`, `ot`.`monto_vendedor` AS `monto_vendedor`, `ot`.`moneda` AS `moneda`, `ot`.`estado_pago` AS `estado_pago`, `ot`.`metodo_entrega` AS `metodo_entrega`, `ot`.`fecha_orden` AS `fecha_orden`, `ot`.`fecha_entrega` AS `fecha_entrega`, `ot`.`fecha_liberacion` AS `fecha_liberacion`, `uc`.`id_usuario` AS `id_comprador`, `uc`.`nombre` AS `nombre_comprador`, `uc`.`correo` AS `correo_comprador`, `uv`.`id_usuario` AS `id_vendedor`, `uv`.`nombre` AS `nombre_vendedor`, `uv`.`correo` AS `correo_vendedor`, `sqr`.`id_qr` AS `id_qr`, `sqr`.`estado_qr` AS `estado_qr`, `sqr`.`fecha_expiracion` AS `qr_expiracion`, `sqr`.`geo_validado` AS `geo_validado` FROM (((`ordenes_transaccion` `ot` join `usuarios` `uc` on(`uc`.`id_usuario` = `ot`.`id_comprador`)) join `usuarios` `uv` on(`uv`.`id_usuario` = `ot`.`id_vendedor`)) left join `seguridad_qr` `sqr` on(`sqr`.`id_orden` = `ot`.`id_orden`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias_suministro`
--
ALTER TABLE `categorias_suministro`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `uq_cat_nombre` (`nombre`);

--
-- Indices de la tabla `cosechas_lote`
--
ALTER TABLE `cosechas_lote`
  ADD PRIMARY KEY (`id_lote`),
  ADD KEY `idx_cl_productor` (`id_productor`),
  ADD KEY `idx_cl_cultivo` (`id_cultivo`),
  ADD KEY `idx_cl_ubicacion` (`ubicacion`),
  ADD KEY `idx_cl_precio` (`precio`),
  ADD KEY `idx_cl_disponible` (`cantidad_disponible`);

--
-- Indices de la tabla `disputas`
--
ALTER TABLE `disputas`
  ADD PRIMARY KEY (`id_disputa`),
  ADD KEY `fk_d_iniciador` (`id_iniciador`),
  ADD KEY `fk_d_admin` (`id_admin_resolutor`),
  ADD KEY `idx_d_orden` (`id_orden`),
  ADD KEY `idx_d_estado` (`estado_disputa`);

--
-- Indices de la tabla `escrow`
--
ALTER TABLE `escrow`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_np1jyvk9cvn0tj5onr0r1kiyl` (`id_orden`);

--
-- Indices de la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_heo_usuario` (`id_usuario_accion`),
  ADD KEY `idx_heo_orden` (`id_orden`),
  ADD KEY `idx_heo_fecha` (`created_at`);

--
-- Indices de la tabla `imagenes_galeria`
--
ALTER TABLE `imagenes_galeria`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `idx_ig_entidad` (`entidad_tipo`,`entidad_id`),
  ADD KEY `idx_ig_principal` (`es_principal`);

--
-- Indices de la tabla `insignias_vendedor`
--
ALTER TABLE `insignias_vendedor`
  ADD PRIMARY KEY (`id_insignia`),
  ADD KEY `fk_iv_verificado_por` (`verificado_por`),
  ADD KEY `idx_iv_usuario` (`id_usuario`),
  ADD KEY `idx_iv_estado` (`estado_verificacion`),
  ADD KEY `idx_iv_rol` (`id_rol`);

--
-- Indices de la tabla `items_pedido`
--
ALTER TABLE `items_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_orden` (`id_orden`);

--
-- Indices de la tabla `movimientos_escrow`
--
ALTER TABLE `movimientos_escrow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mov_transaccion` (`id_transaccion`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notif`),
  ADD KEY `idx_n_usuario` (`id_usuario`),
  ADD KEY `idx_n_leida` (`leida`),
  ADD KEY `idx_n_fecha` (`created_at`);

--
-- Indices de la tabla `ordenes_transaccion`
--
ALTER TABLE `ordenes_transaccion`
  ADD PRIMARY KEY (`id_orden`),
  ADD UNIQUE KEY `uq_numero_orden` (`numero_orden`),
  ADD KEY `idx_ot_comprador` (`id_comprador`),
  ADD KEY `idx_ot_vendedor` (`id_vendedor`),
  ADD KEY `idx_ot_estado` (`estado_pago`),
  ADD KEY `idx_ot_producto` (`tipo_producto`,`id_producto`),
  ADD KEY `idx_ot_fecha` (`fecha_orden`),
  ADD KEY `idx_ot_intent` (`payment_intent_id`),
  ADD KEY `idx_ot_comprador_fecha` (`id_comprador`,`fecha_orden`),
  ADD KEY `idx_ot_vendedor_fecha` (`id_vendedor`,`fecha_orden`),
  ADD KEY `idx_comprador` (`id_comprador`),
  ADD KEY `idx_vendedor` (`id_vendedor`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha` (`fecha_creacion`);

--
-- Indices de la tabla `pagos_transaccion`
--
ALTER TABLE `pagos_transaccion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia_stripe` (`referencia_stripe`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `reseñas_calificaciones`
--
ALTER TABLE `reseñas_calificaciones`
  ADD PRIMARY KEY (`id_reseña`),
  ADD UNIQUE KEY `uq_reseña_orden_tipo` (`id_orden`,`tipo_reseña`) COMMENT 'Una reseña por tipo por orden',
  ADD KEY `fk_rc_calificador` (`id_calificador`),
  ADD KEY `idx_rc_calificado` (`id_calificado`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uq_nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `seguridad_qr`
--
ALTER TABLE `seguridad_qr`
  ADD PRIMARY KEY (`id_qr`),
  ADD UNIQUE KEY `id_orden` (`id_orden`),
  ADD UNIQUE KEY `uq_token_qr` (`token_qr`),
  ADD KEY `fk_sqr_escaneador` (`id_escaneado_por`),
  ADD KEY `idx_sqr_estado` (`estado_qr`),
  ADD KEY `idx_sqr_expiracion` (`fecha_expiracion`),
  ADD KEY `idx_sqr_token` (`token_qr`);

--
-- Indices de la tabla `solicitudes_insignia`
--
ALTER TABLE `solicitudes_insignia`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `suministros_tienda`
--
ALTER TABLE `suministros_tienda`
  ADD PRIMARY KEY (`id_suministro`),
  ADD KEY `idx_st_proveedor` (`id_proveedor`),
  ADD KEY `idx_st_categoria` (`id_categoria`),
  ADD KEY `idx_st_nombre` (`nombre_comercial`),
  ADD KEY `idx_st_activo` (`activo`);
ALTER TABLE `suministros_tienda` ADD FULLTEXT KEY `idx_ft_suministro` (`nombre_comercial`,`nombre_generico`,`descripcion`);

--
-- Indices de la tabla `tipos_cultivo`
--
ALTER TABLE `tipos_cultivo`
  ADD PRIMARY KEY (`id_cultivo`),
  ADD UNIQUE KEY `uq_nombre_cultivo` (`nombre`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_beumwd1cvlqpaqysr0r1mej8i` (`id_orden`),
  ADD KEY `idx_trans_orden` (`id_orden`),
  ADD KEY `idx_trans_comprador` (`id_comprador`),
  ADD KEY `idx_trans_vendedor` (`id_vendedor`),
  ADD KEY `idx_trans_estado` (`estado_pago`),
  ADD KEY `idx_trans_stripe_pi` (`stripe_payment_intent_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uq_correo` (`correo`),
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`),
  ADD KEY `idx_estado_municipio` (`estado_republica`,`municipio`),
  ADD KEY `idx_validado` (`validado`),
  ADD KEY `idx_puntuacion` (`puntuacion_rep`);

--
-- Indices de la tabla `usuarios_roles`
--
ALTER TABLE `usuarios_roles`
  ADD PRIMARY KEY (`id_usuario`,`id_rol`),
  ADD KEY `fk_ur_rol` (`id_rol`);

--
-- Indices de la tabla `validaciones_qr`
--
ALTER TABLE `validaciones_qr`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_qr` (`codigo_qr`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias_suministro`
--
ALTER TABLE `categorias_suministro`
  MODIFY `id_categoria` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `cosechas_lote`
--
ALTER TABLE `cosechas_lote`
  MODIFY `id_lote` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `disputas`
--
ALTER TABLE `disputas`
  MODIFY `id_disputa` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `escrow`
--
ALTER TABLE `escrow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  MODIFY `id_historial` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imagenes_galeria`
--
ALTER TABLE `imagenes_galeria`
  MODIFY `id_imagen` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insignias_vendedor`
--
ALTER TABLE `insignias_vendedor`
  MODIFY `id_insignia` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `items_pedido`
--
ALTER TABLE `items_pedido`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientos_escrow`
--
ALTER TABLE `movimientos_escrow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notif` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes_transaccion`
--
ALTER TABLE `ordenes_transaccion`
  MODIFY `id_orden` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos_transaccion`
--
ALTER TABLE `pagos_transaccion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `reseñas_calificaciones`
--
ALTER TABLE `reseñas_calificaciones`
  MODIFY `id_reseña` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `seguridad_qr`
--
ALTER TABLE `seguridad_qr`
  MODIFY `id_qr` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitudes_insignia`
--
ALTER TABLE `solicitudes_insignia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `suministros_tienda`
--
ALTER TABLE `suministros_tienda`
  MODIFY `id_suministro` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_cultivo`
--
ALTER TABLE `tipos_cultivo`
  MODIFY `id_cultivo` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `validaciones_qr`
--
ALTER TABLE `validaciones_qr`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cosechas_lote`
--
ALTER TABLE `cosechas_lote`
  ADD CONSTRAINT `fk_cl_cultivo` FOREIGN KEY (`id_cultivo`) REFERENCES `tipos_cultivo` (`id_cultivo`),
  ADD CONSTRAINT `fk_cl_productor` FOREIGN KEY (`id_productor`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `disputas`
--
ALTER TABLE `disputas`
  ADD CONSTRAINT `fk_d_admin` FOREIGN KEY (`id_admin_resolutor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_d_iniciador` FOREIGN KEY (`id_iniciador`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_d_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_transaccion` (`id_orden`);

--
-- Filtros para la tabla `historial_estados_orden`
--
ALTER TABLE `historial_estados_orden`
  ADD CONSTRAINT `fk_heo_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_transaccion` (`id_orden`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_heo_usuario` FOREIGN KEY (`id_usuario_accion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `insignias_vendedor`
--
ALTER TABLE `insignias_vendedor`
  ADD CONSTRAINT `fk_iv_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  ADD CONSTRAINT `fk_iv_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_iv_verificado_por` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `movimientos_escrow`
--
ALTER TABLE `movimientos_escrow`
  ADD CONSTRAINT `FKgytrukygfxq1gr7puoqi9pb4g` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_n_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ordenes_transaccion`
--
ALTER TABLE `ordenes_transaccion`
  ADD CONSTRAINT `fk_ot_comprador` FOREIGN KEY (`id_comprador`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_ot_vendedor` FOREIGN KEY (`id_vendedor`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `reseñas_calificaciones`
--
ALTER TABLE `reseñas_calificaciones`
  ADD CONSTRAINT `fk_rc_calificado` FOREIGN KEY (`id_calificado`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_rc_calificador` FOREIGN KEY (`id_calificador`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_rc_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_transaccion` (`id_orden`) ON DELETE CASCADE;

--
-- Filtros para la tabla `seguridad_qr`
--
ALTER TABLE `seguridad_qr`
  ADD CONSTRAINT `fk_sqr_escaneador` FOREIGN KEY (`id_escaneado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sqr_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_transaccion` (`id_orden`) ON DELETE CASCADE;

--
-- Filtros para la tabla `suministros_tienda`
--
ALTER TABLE `suministros_tienda`
  ADD CONSTRAINT `fk_st_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_suministro` (`id_categoria`),
  ADD CONSTRAINT `fk_st_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `usuarios_roles`
--
ALTER TABLE `usuarios_roles`
  ADD CONSTRAINT `fk_ur_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  ADD CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
