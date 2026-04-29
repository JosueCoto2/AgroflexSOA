package com.agroflex.admin.controller;

import com.agroflex.admin.dto.DisputaDTO;
import com.agroflex.admin.model.Disputa;
import com.agroflex.admin.security.JwtAuthPrincipal;
import com.agroflex.admin.service.AdminDisputasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/disputas")
@RequiredArgsConstructor
public class AdminDisputasController {

    private final AdminDisputasService service;

    @GetMapping
    public ResponseEntity<Page<Disputa>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
        return ResponseEntity.ok(service.listar(estado, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Disputa> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/{id}/tomar")
    public ResponseEntity<Disputa> tomar(@PathVariable Long id,
                                          @AuthenticationPrincipal JwtAuthPrincipal principal) {
        return ResponseEntity.ok(service.tomarCaso(id, principal.correo()));
    }

    @PostMapping("/{id}/resolver")
    public ResponseEntity<Disputa> resolver(@PathVariable Long id,
                                             @RequestBody DisputaDTO body) {
        return ResponseEntity.ok(service.resolver(id, body.getResolucion(), body.getAccion()));
    }
}
