package com.agroflex.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDto(
        Long id,
        Long idOrden,
        Long idComprador,
        Long idVendedor,
        BigDecimal monto,
        BigDecimal montoComision,
        BigDecimal montoVendedor,
        String moneda,
        String metodoPago,
        String estadoPago,
        String stripePaymentIntentId,
        // stripeClientSecret NUNCA se expone en este DTO
        LocalDateTime fechaCreacion,
        LocalDateTime fechaPago,
        LocalDateTime fechaLiberacion
) {
}
