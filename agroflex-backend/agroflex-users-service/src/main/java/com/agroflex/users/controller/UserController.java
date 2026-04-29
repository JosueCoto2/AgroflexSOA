package com.agroflex.users.controller;

import com.agroflex.users.dto.*;
import com.agroflex.users.security.JwtAuthPrincipal;
import com.agroflex.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ─── MI PERFIL ────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<MiPerfilResponse> getMiPerfil(
            @AuthenticationPrincipal JwtAuthPrincipal principal) {
        return ResponseEntity.ok(userService.getMiPerfil(principal));
    }

    @PutMapping("/me")
    public ResponseEntity<MiPerfilResponse> actualizarMiPerfil(
            @AuthenticationPrincipal JwtAuthPrincipal principal,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(userService.actualizarMiPerfil(principal, request));
    }

    // ─── PERFIL PÚBLICO ───────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<PerfilPublicoResponse> getPerfilPublico(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPerfilPublico(id));
    }

    // ─── INSIGNIAS ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/insignias")
    public ResponseEntity<List<InsigniaResponse>> getInsignias(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getInsignias(id));
    }

    // ─── RESEÑAS ──────────────────────────────────────────────────────────────

    @GetMapping("/{id}/reseñas")
    public ResponseEntity<Page<ReseñaResponse>> getReseñas(
            @PathVariable Long id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userService.getReseñas(id, pageable));
    }

    @PostMapping("/me/reseñas")
    public ResponseEntity<ReseñaResponse> crearReseña(
            @AuthenticationPrincipal JwtAuthPrincipal principal,
            @Valid @RequestBody CrearReseñaRequest request) {
        return ResponseEntity.status(201).body(userService.crearReseña(principal, request));
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UsuarioAdminResponse>> listarUsuarios(
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(userService.listarUsuarios(busqueda, pageable));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioAdminResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam boolean activo) {
        return ResponseEntity.ok(userService.cambiarEstadoUsuario(id, activo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        userService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
