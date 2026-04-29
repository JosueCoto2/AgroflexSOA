package com.agroflex.orders.controller;

import com.agroflex.orders.dto.CreateOrderRequest;
import com.agroflex.orders.dto.OrderResponse;
import com.agroflex.orders.dto.OrderStatsResponse;
import com.agroflex.orders.dto.OrderStatusUpdateDto;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.security.JwtAuthUser;
import com.agroflex.orders.service.EscrowService;
import com.agroflex.orders.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final EscrowService escrowService;

    /**
     * POST /api/orders — Crear una nueva orden.
     * Roles permitidos: COMPRADOR, PRODUCTOR, PROVEEDOR, EMPAQUE.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('COMPRADOR','PRODUCTOR','PROVEEDOR','EMPAQUE')")
    public ResponseEntity<OrderResponse> crearOrden(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader("Authorization") String authHeader) {

        JwtAuthUser usuario = currentUser();
        OrderResponse response = orderService.crearOrden(request, usuario.getIdUsuario(), authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/orders/{orderId} — Obtener detalle de una orden.
     * El usuario debe ser comprador, vendedor o ADMIN.
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> obtenerOrden(@PathVariable Long orderId) {
        JwtAuthUser usuario = currentUser();
        OrderResponse orden = orderService.obtenerOrden(orderId);

        boolean esAdmin = tieneRol("ADMIN");
        boolean esParticipante = orden.idComprador().equals(usuario.getIdUsuario())
                || orden.idVendedor().equals(usuario.getIdUsuario());

        if (!esAdmin && !esParticipante) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(orden);
    }

    /**
     * GET /api/orders/mis-pedidos — Listar pedidos del usuario autenticado.
     * @param rol "comprador" (default) o "vendedor" — indica qué vista quiere el usuario.
     */
    @GetMapping("/mis-pedidos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponse>> misPedidos(
            @RequestParam(defaultValue = "comprador") String rol) {
        JwtAuthUser usuario = currentUser();
        List<OrderResponse> pedidos = orderService.misPedidos(usuario.getIdUsuario(), rol);
        return ResponseEntity.ok(pedidos);
    }

    /**
     * PUT /api/orders/{orderId}/status — Actualizar estado de una orden.
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> actualizarEstado(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateDto dto,
            @RequestHeader("Authorization") String authHeader) {

        JwtAuthUser usuario = currentUser();
        OrderResponse response = orderService.actualizarEstado(
                orderId, dto, usuario.getIdUsuario(), authHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/orders/{orderId} — Cancelar una orden.
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelarOrden(
            @PathVariable Long orderId,
            @RequestParam(defaultValue = "Cancelado por el usuario") String motivo,
            @RequestHeader("Authorization") String authHeader) {

        JwtAuthUser usuario = currentUser();
        orderService.cancelarOrden(orderId, usuario.getIdUsuario(), motivo, authHeader);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/orders/stats — Estadísticas para el panel admin.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderStatsResponse> obtenerEstadisticas() {
        return ResponseEntity.ok(orderService.obtenerEstadisticas());
    }

    /**
     * POST /api/orders/{orderId}/release — Liberar pago (llamado por qr-service o admin).
     */
    @PostMapping("/{orderId}/release")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> liberarPago(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        escrowService.liberarPago(orderId, authHeader);
        return ResponseEntity.ok().build();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private JwtAuthUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (JwtAuthUser) auth.getPrincipal();
    }

    private boolean tieneRol(String rol) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol));
    }
}
