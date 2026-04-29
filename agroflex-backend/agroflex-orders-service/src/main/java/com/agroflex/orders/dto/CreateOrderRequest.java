package com.agroflex.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "El vendedor es requerido")
    private Long idVendedor;

    @NotEmpty(message = "Debe incluir al menos un producto")
    @Valid
    private List<OrderItemDto> items;

    private String metodoPago; // STRIPE o PAYPAL, default STRIPE

    private String observaciones;

    private Double latitudEntrega;
    private Double longitudEntrega;
}
