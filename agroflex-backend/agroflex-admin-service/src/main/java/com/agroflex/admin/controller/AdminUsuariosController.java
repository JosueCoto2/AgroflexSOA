package com.agroflex.admin.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agroflex.admin.dto.UsuarioResumenDTO;
import com.agroflex.admin.service.AdminUsuariosService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuariosController {

    private final AdminUsuariosService service;

    @GetMapping
    public ResponseEntity<Page<UsuarioResumenDTO>> listar(
            @RequestParam(required = false) String buscar,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(service.listar(buscar, activo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResumenDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/suspender")
    public ResponseEntity<UsuarioResumenDTO> suspender(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.suspender(id, body.get("motivo")));
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<UsuarioResumenDTO> activar(@PathVariable Long id,
                                                      @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.activar(id, body.get("motivo")));
    }

    @PatchMapping("/{id}/rol")
    public ResponseEntity<UsuarioResumenDTO> cambiarRol(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.cambiarRol(id, body.get("rol")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportarCsv() {
        String csv = service.exportarCsv();
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"usuarios_agroflex.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
