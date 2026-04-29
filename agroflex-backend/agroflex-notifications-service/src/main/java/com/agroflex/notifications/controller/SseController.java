package com.agroflex.notifications.controller;

import com.agroflex.notifications.security.JwtAuthPrincipal;
import com.agroflex.notifications.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Endpoint SSE — el frontend conecta aquí al cargar la app.
 * GET /api/notifications/stream   (requiere JWT)
 *
 * El cliente usa EventSource con el header Authorization inyectado
 * a través del polyfill @microsoft/fetch-event-source.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal JwtAuthPrincipal principal) {
        return sseService.registrar(principal.idUsuario());
    }
}
