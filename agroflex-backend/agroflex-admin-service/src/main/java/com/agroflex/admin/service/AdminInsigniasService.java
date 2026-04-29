package com.agroflex.admin.service;

import com.agroflex.admin.model.SolicitudInsignia;
import com.agroflex.admin.model.Usuario;
import com.agroflex.admin.repository.AdminInsigniaRepository;
import com.agroflex.admin.repository.AdminUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminInsigniasService {

    private final AdminInsigniaRepository insigniaRepository;
    private final AdminUsuarioRepository usuarioRepository;

    public List<SolicitudInsignia> getPendientes() {
        return insigniaRepository.findByEstadoOrderByFechaSolicitudAsc("PENDIENTE");
    }

    public Page<SolicitudInsignia> listar(String estado, Pageable pageable) {
        if (estado != null && !estado.isBlank()) {
            return insigniaRepository.findByEstado(estado, pageable);
        }
        return insigniaRepository.findAll(pageable);
    }

    public SolicitudInsignia getById(Long id) {
        return insigniaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
    }

    public SolicitudInsignia aprobar(Long id, String comentario, String adminCorreo) {
        SolicitudInsignia s = getById(id);
        if (!"PENDIENTE".equals(s.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue procesada");
        }
        s.setEstado("APROBADA");
        s.setFechaResolucion(LocalDateTime.now());
        s.setAdminRevisor(adminCorreo);

        // Actualizar validado=true en usuario
        usuarioRepository.findById(s.getIdUsuario()).ifPresent(u -> {
            u.setValidado(true);
            usuarioRepository.save(u);
        });

        return insigniaRepository.save(s);
    }

    public SolicitudInsignia rechazar(Long id, String motivoRechazo, String adminCorreo) {
        SolicitudInsignia s = getById(id);
        if (!"PENDIENTE".equals(s.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue procesada");
        }
        if (motivoRechazo == null || motivoRechazo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El motivo de rechazo es obligatorio");
        }
        s.setEstado("RECHAZADA");
        s.setMotivoRechazo(motivoRechazo);
        s.setFechaResolucion(LocalDateTime.now());
        s.setAdminRevisor(adminCorreo);
        return insigniaRepository.save(s);
    }

    public Map<String, Long> getStats() {
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        return Map.of(
                "pendientes", insigniaRepository.countByEstado("PENDIENTE"),
                "aprobadas", insigniaRepository.countByEstado("APROBADA"),
                "rechazadas", insigniaRepository.countByEstado("RECHAZADA"),
                "aprobadasEsteMes", insigniaRepository.countByEstadoAndFechaResolucionAfter("APROBADA", inicioMes),
                "rechazadasEsteMes", insigniaRepository.countByEstadoAndFechaResolucionAfter("RECHAZADA", inicioMes)
        );
    }
}
