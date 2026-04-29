package com.agroflex.notifications.controller;

import com.agroflex.notifications.dto.EnviarNotificacionRequest;
import com.agroflex.notifications.dto.NotificacionResponse;
import com.agroflex.notifications.service.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint interno: usado por otros microservicios (orders, payments, qr)
 * para disparar notificaciones. No requiere JWT (tráfico interno).
 *
 * Ejemplo de uso desde orders-service:
 *   POST /api/notifications/internal/enviar
 *   Body: { idUsuario, titulo, cuerpo, categoria, correoUsuario, fcmToken }
 */
@RestController
@RequestMapping("/api/notifications/internal")
@RequiredArgsConstructor
public class InternalNotificationController {

    private final NotificacionService notificacionService;

    @PostMapping("/enviar")
    public ResponseEntity<NotificacionResponse> enviar(
            @Valid @RequestBody EnviarNotificacionRequest request) {
        return ResponseEntity.status(201)
                .body(notificacionService.enviar(request));
    }
}
