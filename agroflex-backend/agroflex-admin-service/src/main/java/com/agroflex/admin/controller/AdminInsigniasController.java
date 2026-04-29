package com.agroflex.admin.controller;

import com.agroflex.admin.dto.InsigniaDecisionDTO;
import com.agroflex.admin.model.SolicitudInsignia;
import com.agroflex.admin.security.JwtAuthPrincipal;
import com.agroflex.admin.service.AdminInsigniasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/insignias")
@RequiredArgsConstructor
public class AdminInsigniasController {

    private final AdminInsigniasService service;

    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudInsignia>> getPendientes() {
        return ResponseEntity.ok(service.getPendientes());
    }

    @GetMapping
    public ResponseEntity<Page<SolicitudInsignia>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("fechaSolicitud").descending());
        return ResponseEntity.ok(service.listar(estado, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudInsignia> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudInsignia> aprobar(@PathVariable Long id,
                                                      @RequestBody InsigniaDecisionDTO body,
                                                      @AuthenticationPrincipal JwtAuthPrincipal principal) {
        return ResponseEntity.ok(service.aprobar(id, body.getComentario(), principal.correo()));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudInsignia> rechazar(@PathVariable Long id,
                                                       @RequestBody InsigniaDecisionDTO body,
                                                       @AuthenticationPrincipal JwtAuthPrincipal principal) {
        return ResponseEntity.ok(service.rechazar(id, body.getMotivoRechazo(), principal.correo()));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(service.getStats());
    }
}
