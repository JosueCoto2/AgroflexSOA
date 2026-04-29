package com.agroflex.catalog.controller;

import com.agroflex.catalog.dto.*;
import com.agroflex.catalog.security.JwtAuthPrincipal;
import com.agroflex.catalog.service.CosechaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CosechaController {

    private final CosechaService cosechaService;

    // ─── Endpoints públicos ───────────────────────────────────────────────────

    @GetMapping("/lotes")
    public ResponseEntity<CatalogoPageResponse> obtenerCatalogo(
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) String unidadVenta,
            @RequestParam(defaultValue = "fecha_desc") String ordenarPor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        LoteFiltrosRequest filtros = new LoteFiltrosRequest(
                precioMin, precioMax, unidadVenta, ordenarPor, page, size);
        return ResponseEntity.ok(cosechaService.obtenerCatalogo(filtros));
    }

    @GetMapping("/lotes/buscar")
    public ResponseEntity<CatalogoPageResponse> buscarLotes(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(cosechaService.buscarLotes(query, page, size));
    }

    @GetMapping("/lotes/{id}")
    public ResponseEntity<LoteResponse> obtenerDetalleLote(@PathVariable Long id) {
        return ResponseEntity.ok(cosechaService.obtenerDetalleLote(id));
    }

    // ─── Endpoints protegidos ─────────────────────────────────────────────────

    @PostMapping("/lotes")
    @PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO')")
    public ResponseEntity<LoteResponse> publicarLote(
            @Valid @RequestBody LoteRequest request,
            Authentication authentication) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();
        LoteResponse lote = cosechaService.publicarLote(
                request, principal.idUsuario(), principal.nombre(), principal.fotoPerfil());
        return ResponseEntity.status(HttpStatus.CREATED).body(lote);
    }

    @PutMapping("/lotes/{id}")
    @PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO')")
    public ResponseEntity<LoteResponse> actualizarLote(
            @PathVariable Long id,
            @Valid @RequestBody LoteRequest request,
            Authentication authentication) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(cosechaService.actualizarLote(id, request, principal.idUsuario()));
    }

    @PatchMapping("/lotes/{id}/estado")
    @PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO','ADMIN')")
    public ResponseEntity<LoteResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cosechaService.cambiarEstado(id, nuevoEstado, principal.idUsuario()));
    }

    @GetMapping("/mis-lotes")
    @PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO')")
    public ResponseEntity<List<LoteResponse>> obtenerMisLotes(Authentication authentication) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(cosechaService.obtenerMisLotes(principal.idUsuario()));
    }

    /**
     * PATCH /api/catalog/lotes/{id}/estado-sistema
     * Uso interno exclusivo: orders-service lo llama cuando el pago es confirmado.
     * No verifica propiedad — solo permite VENDIDO o DISPONIBLE.
     */
    @PatchMapping("/lotes/{id}/estado-sistema")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cambiarEstadoSistema(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        cosechaService.cambiarEstadoInterno(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/lotes/{id}")
    @PreAuthorize("hasAnyRole('PRODUCTOR','INVERNADERO','ADMIN')")
    public ResponseEntity<Void> eliminarLote(
            @PathVariable Long id,
            Authentication authentication) {
        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();
        cosechaService.eliminarLote(id, principal.idUsuario());
        return ResponseEntity.noContent().build();
    }
}
