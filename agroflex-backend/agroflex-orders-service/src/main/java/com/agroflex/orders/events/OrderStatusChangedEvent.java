package com.agroflex.orders.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedEvent {

    private Long idOrden;
    private String numeroOrden;
    private String estadoAnterior;
    private String estadoNuevo;
    private Long idUsuarioQueActualizo;
    private String motivo;
    private LocalDateTime fechaCambio;
}
