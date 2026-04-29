package com.agroflex.orders.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    @NotNull(message = "El ID del producto es requerido")
    private Long idProducto;

    @NotBlank(message = "El tipo de producto es requerido")
    private String tipoProducto; // COSECHA_LOTE o SUMINISTRO

    @NotNull(message = "La cantidad es requerida")
    @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    // Campos de snapshot — se rellenan al crear la orden, no en el request
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String nombreProducto;
    private String unidadVenta;
}
