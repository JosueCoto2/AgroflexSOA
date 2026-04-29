package com.agroflex.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EnviarNotificacionRequest(

        @NotNull
        Long idUsuario,

        @NotBlank @Size(max = 200)
        String titulo,

        @Size(max = 2000)
        String cuerpo,

        // Categoría: orden_nueva, pago_confirmado, qr_generado, qr_validado, disputa_abierta, etc.
        @Size(max = 60)
        String categoria,

        // JSON libre para deep links: {"idOrden": 123, "url": "/mis-pedidos/123"}
        String datosExtra,

        // Correo del usuario (para EMAIL)
        String correoUsuario,

        // FCM token (para PUSH)
        String fcmToken,

        // Teléfono (para SMS)
        String telefono
) {}
