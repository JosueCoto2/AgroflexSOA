package com.agroflex.notifications.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long idNotif,
        String tipo,
        String categoria,
        String titulo,
        String cuerpo,
        String datosExtra,
        Boolean enviada,
        Boolean leida,
        LocalDateTime createdAt,
        LocalDateTime leidaAt
) {}
