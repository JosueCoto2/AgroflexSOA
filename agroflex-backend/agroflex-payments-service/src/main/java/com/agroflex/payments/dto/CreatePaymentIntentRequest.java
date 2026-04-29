package com.agroflex.payments.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Contrato con orders-service — campos deben coincidir exactamente con
 * com.agroflex.orders.dto.CreatePaymentIntentRequest.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentIntentRequest {

    @NotNull(message = "El ID de orden es requerido")
    private Long idOrden;

    private String numeroOrden;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "1.00", message = "El monto mínimo es $1.00 MXN")
    private BigDecimal monto;

    private String moneda; // default MXN

    @NotNull(message = "El ID del comprador es requerido")
    private Long idComprador;

    @NotNull(message = "El ID del vendedor es requerido")
    private Long idVendedor;
}
