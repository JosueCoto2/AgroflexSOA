package com.agroflex.admin.service;

import com.agroflex.admin.dto.BroadcastRequest;
import com.agroflex.admin.model.Notificacion;
import com.agroflex.admin.model.Usuario;
import com.agroflex.admin.repository.AdminNotificacionRepository;
import com.agroflex.admin.repository.AdminUsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBroadcastService {

    private final AdminUsuarioRepository usuarioRepository;
    private final AdminNotificacionRepository notificacionRepository;

    @Transactional
    public Map<String, Object> enviar(BroadcastRequest req) {
        List<Usuario> destinatarios = obtenerDestinatarios(req.segmento());

        List<Notificacion> notificaciones = destinatarios.stream()
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .map(u -> Notificacion.builder()
                        .idUsuario(u.getIdUsuario())
                        .titulo(req.titulo())
                        .cuerpo(req.mensaje())
                        .categoria("admin_broadcast")
                        .tipo(Notificacion.TipoNotif.IN_APP)
                        .build())
                .toList();

        notificacionRepository.saveAll(notificaciones);

        log.info("Broadcast enviado: {} notificaciones para segmento '{}'",
                notificaciones.size(), req.segmento() != null ? req.segmento() : "TODOS");

        return Map.of(
                "enviadas", notificaciones.size(),
                "segmento", req.segmento() != null ? req.segmento() : "TODOS",
                "titulo", req.titulo()
        );
    }

    private List<Usuario> obtenerDestinatarios(String segmento) {
        if (segmento == null || segmento.isBlank()) {
            return usuarioRepository.findAll();
        }
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getAuthority().equalsIgnoreCase(segmento)))
                .toList();
    }
}
