package com.agroflex.orders.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCompletedEvent {

    private Long idOrden;
    private String numeroOrden;
    private Long idComprador;
    private Long idVendedor;
    private BigDecimal montoLiberado;
    private LocalDateTime fechaCompletado;
}
