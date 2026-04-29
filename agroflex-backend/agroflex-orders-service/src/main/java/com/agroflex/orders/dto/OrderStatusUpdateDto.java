package com.agroflex.orders.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDto {

    @NotBlank(message = "El nuevo estado es requerido")
    private String nuevoEstado;

    private String motivo; // Requerido si es CANCELADO o DISPUTADO
}
