package com.agroflex.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentIntentRequest {
    private Long idOrden;
    private String numeroOrden;
    private BigDecimal monto;
    private String moneda;
    private Long idComprador;
    private Long idVendedor;
}
