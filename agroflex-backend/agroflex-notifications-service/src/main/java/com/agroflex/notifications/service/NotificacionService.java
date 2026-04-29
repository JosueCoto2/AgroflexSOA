package com.agroflex.notifications.service;

import com.agroflex.notifications.dto.EnviarNotificacionRequest;
import com.agroflex.notifications.dto.NotificacionResponse;
import com.agroflex.notifications.model.Notificacion;
import com.agroflex.notifications.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final EmailService emailService;
    private final PushNotificationService pushService;
    private final TwilioSmsService smsService;
    private final SseService sseService;

    // ─── ENVÍO ────────────────────────────────────────────────────────────────

    /**
     * Envía notificación IN_APP (siempre) + Email + Push si se proporcionan datos.
     * Registra el resultado en la tabla notificaciones.
     */
    @Transactional
    public NotificacionResponse enviar(EnviarNotificacionRequest req) {
        // 1. Registrar la notificación in-app
        Notificacion notif = Notificacion.builder()
                .idUsuario(req.idUsuario())
                .tipo(Notificacion.TipoNotificacion.IN_APP)
                .categoria(req.categoria())
                .titulo(req.titulo())
                .cuerpo(req.cuerpo())
                .datosExtra(req.datosExtra())
                .build();

        // 2. Intentar envíos externos en paralelo
        boolean emailOk  = false;
        boolean pushOk   = false;
        boolean smsOk    = false;
        StringBuilder errores = new StringBuilder();

        if (req.correoUsuario() != null && !req.correoUsuario().isBlank()) {
            emailOk = emailService.enviar(req.correoUsuario(), req.titulo(), req.cuerpo());
            if (!emailOk) errores.append("EMAIL_FAIL;");
        }

        if (req.fcmToken() != null && !req.fcmToken().isBlank()) {
            pushOk = pushService.enviar(req.fcmToken(), req.titulo(), req.cuerpo());
            if (!pushOk) errores.append("PUSH_FAIL;");
        }

        if (req.telefono() != null && !req.telefono().isBlank()) {
            smsOk = smsService.enviar(req.telefono(), req.titulo() + ": " + req.cuerpo());
            if (!smsOk) errores.append("SMS_FAIL;");
        }

        boolean algunEnvioExitoso = emailOk || pushOk || smsOk;
        notif.setEnviada(algunEnvioExitoso);
        notif.setEnviadaAt(algunEnvioExitoso ? LocalDateTime.now() : null);
        if (!errores.isEmpty()) {
            notif.setErrorEnvio(errores.toString());
        }

        Notificacion saved = notificacionRepository.save(notif);
        log.info("Notificación registrada: id={} usuario={} categoria={} email={} push={} sms={}",
                saved.getIdNotif(), req.idUsuario(), req.categoria(), emailOk, pushOk, smsOk);

        // Empujar en tiempo real via SSE si el usuario está conectado
        sseService.enviar(req.idUsuario(), "notificacion", toResponse(saved));

        return toResponse(saved);
    }

    // ─── LECTURA ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificacionResponse> getMisNotificaciones(Long idUsuario, Pageable pageable) {
        return notificacionRepository
                .findByIdUsuarioOrderByCreatedAtDesc(idUsuario, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(Long idUsuario) {
        return notificacionRepository.countByIdUsuarioAndLeidaFalse(idUsuario);
    }

    // ─── ACTUALIZAR ───────────────────────────────────────────────────────────

    @Transactional
    public void marcarLeida(Long idNotif, Long idUsuario) {
        notificacionRepository.findById(idNotif).ifPresent(n -> {
            if (n.getIdUsuario().equals(idUsuario) && !n.getLeida()) {
                n.setLeida(true);
                n.setLeidaAt(LocalDateTime.now());
                notificacionRepository.save(n);
            }
        });
    }

    @Transactional
    public int marcarTodasLeidas(Long idUsuario) {
        return notificacionRepository.marcarTodasLeidas(idUsuario);
    }

    // ─── MAPPER ───────────────────────────────────────────────────────────────

    private NotificacionResponse toResponse(Notificacion n) {
        return new NotificacionResponse(
                n.getIdNotif(),
                n.getTipo().name(),
                n.getCategoria(),
                n.getTitulo(),
                n.getCuerpo(),
                n.getDatosExtra(),
                n.getEnviada(),
                n.getLeida(),
                n.getCreatedAt(),
                n.getLeidaAt()
        );
    }
}
