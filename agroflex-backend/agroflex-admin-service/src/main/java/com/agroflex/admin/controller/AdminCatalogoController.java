package com.agroflex.admin.controller;

import com.agroflex.admin.dto.ProductoAdminDTO;
import com.agroflex.admin.service.AdminCatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/catalogo")
@RequiredArgsConstructor
public class AdminCatalogoController {

    private final AdminCatalogoService service;

    @GetMapping("/productos")
    public ResponseEntity<Page<ProductoAdminDTO>> listar(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String buscar,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(service.listar(tipo, activo, buscar, pageable));
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<ProductoAdminDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        service.eliminar(id, body.get("motivo"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/productos/{id}/suspender")
    public ResponseEntity<ProductoAdminDTO> suspender(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.suspender(id, body.get("motivo")));
    }

    @PatchMapping("/productos/{id}/restaurar")
    public ResponseEntity<ProductoAdminDTO> restaurar(@PathVariable Long id) {
        return ResponseEntity.ok(service.restaurar(id));
    }
}
