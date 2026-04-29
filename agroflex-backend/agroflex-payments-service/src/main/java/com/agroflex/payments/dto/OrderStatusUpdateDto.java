package com.agroflex.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO local para actualizar estado de órdenes vía OrderServiceClient.
 * Debe coincidir con com.agroflex.orders.dto.OrderStatusUpdateDto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDto {
    private String nuevoEstado;
    private String motivo;
}
