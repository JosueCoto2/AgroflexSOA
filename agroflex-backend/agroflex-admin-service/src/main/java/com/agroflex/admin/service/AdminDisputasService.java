package com.agroflex.admin.service;

import com.agroflex.admin.model.Disputa;
import com.agroflex.admin.repository.AdminDisputaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminDisputasService {

    private final AdminDisputaRepository disputaRepository;

    public Page<Disputa> listar(String estado, Pageable pageable) {
        if (estado != null && !estado.isBlank()) {
            return disputaRepository.findByEstado(estado, pageable);
        }
        return disputaRepository.findAll(pageable);
    }

    public Disputa getById(Long id) {
        return disputaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disputa no encontrada"));
    }

    public Disputa tomarCaso(Long id, String adminCorreo) {
        Disputa d = getById(id);
        d.setAdminAsignado(adminCorreo);
        d.setEstado("EN_REVISION");
        return disputaRepository.save(d);
    }

    public Disputa resolver(Long id, String resolucion, String accion) {
        Disputa d = getById(id);
        d.setResolucion(resolucion);
        d.setEstado("RESUELTA");
        d.setFechaResolucion(LocalDateTime.now());
        return disputaRepository.save(d);
    }
}
