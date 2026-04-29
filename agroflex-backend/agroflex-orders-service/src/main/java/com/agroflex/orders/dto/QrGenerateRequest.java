package com.agroflex.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerateRequest {
    private Long idOrden;
    private String numeroOrden;
    private Long idVendedor;
    private Long idComprador;
    private Double latitudEntrega;
    private Double longitudEntrega;
}
