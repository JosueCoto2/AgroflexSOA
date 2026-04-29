package com.agroflex.notifications.controller;

import com.agroflex.notifications.dto.NoLeidasCountResponse;
import com.agroflex.notifications.dto.NotificacionResponse;
import com.agroflex.notifications.security.JwtAuthPrincipal;
import com.agroflex.notifications.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints para el usuario autenticado: consultar y marcar sus notificaciones.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-notificaciones")
    public ResponseEntity<Page<NotificacionResponse>> getMisNotificaciones(
            @AuthenticationPrincipal JwtAuthPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                notificacionService.getMisNotificaciones(principal.idUsuario(), pageable));
    }

    @GetMapping("/no-leidas/count")
    public ResponseEntity<NoLeidasCountResponse> contarNoLeidas(
            @AuthenticationPrincipal JwtAuthPrincipal principal) {
        long count = notificacionService.contarNoLeidas(principal.idUsuario());
        return ResponseEntity.ok(new NoLeidasCountResponse(count));
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Void> marcarLeida(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtAuthPrincipal principal) {
        notificacionService.marcarLeida(id, principal.idUsuario());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(
            @AuthenticationPrincipal JwtAuthPrincipal principal) {
        notificacionService.marcarTodasLeidas(principal.idUsuario());
        return ResponseEntity.noContent().build();
    }
}
