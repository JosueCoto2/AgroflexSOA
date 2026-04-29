package com.agroflex.payments.controller;

import com.agroflex.payments.dto.TransactionDto;
import com.agroflex.payments.security.JwtAuthUser;
import com.agroflex.payments.service.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionHistoryService transactionHistoryService;

    /**
     * GET /api/payments/transactions/mis-transacciones
     * Historial de pagos del usuario autenticado.
     */
    @GetMapping("/mis-transacciones")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TransactionDto>> misTransacciones() {
        JwtAuthUser usuario = currentUser();
        String rol = rolPrincipal();
        return ResponseEntity.ok(
                transactionHistoryService.misTransacciones(usuario.getIdUsuario(), rol));
    }

    /**
     * GET /api/payments/transactions/{id}
     * Detalle de una transacción por ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TransactionDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(transactionHistoryService.obtenerPorId(id));
    }

    /**
     * GET /api/payments/transactions/orden/{orderId}
     * Transacción asociada a una orden específica.
     */
    @GetMapping("/orden/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TransactionDto> obtenerPorOrden(@PathVariable Long orderId) {
        return ResponseEntity.ok(transactionHistoryService.obtenerPorOrden(orderId));
    }

    /**
     * GET /api/payments/transactions
     * Lista paginada de todas las transacciones (solo ADMIN).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TransactionDto>> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<TransactionDto> resultado = transactionHistoryService.listarTodas(
                PageRequest.of(page, size, Sort.by("fechaCreacion").descending()));
        return ResponseEntity.ok(resultado);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private JwtAuthUser currentUser() {
        return (JwtAuthUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    private String rolPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("COMPRADOR");
    }
}
