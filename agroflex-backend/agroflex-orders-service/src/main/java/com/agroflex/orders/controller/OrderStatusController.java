package com.agroflex.orders.controller;

import com.agroflex.orders.dto.OrderResponse;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/status")
@RequiredArgsConstructor
public class OrderStatusController {

    private final OrderService orderService;

    /**
     * GET /api/orders/status/{status} — Listar órdenes por estado (solo ADMIN).
     * Query params: ?page=0&size=20&sort=fechaCreacion,desc
     */
    @GetMapping("/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> listarPorEstado(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        EstadoPedido estadoPedido;
        try {
            estadoPedido = EstadoPedido.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderResponse> resultado = orderService.listarPorEstado(estadoPedido, pageable);
        return ResponseEntity.ok(resultado);
    }
}
