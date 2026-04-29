package com.agroflex.orders.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import java.util.List;

public record OrderResponse(
        Long id,
        String numeroOrden,
        Long idComprador,
        String nombreComprador,
        Long idVendedor,
        String nombreVendedor,
        String estadoPedido,
        BigDecimal totalMonto,
        BigDecimal montoEscrow,
        String metodoPago,
        String idTransaccionPago,
        List<OrderItemDto> items,
        String observaciones,
        Double latitudEntrega,
        Double longitudEntrega,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion,
        List<String> warnings
) {}
