package com.agroflex.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EscrowStatusDto(
        Long idOrden,
        String estadoPago,
        BigDecimal monto,
        BigDecimal montoComision,
        BigDecimal montoVendedor,
        String stripePaymentIntentId,
        LocalDateTime fechaPago,
        LocalDateTime fechaLiberacion
) {
}
