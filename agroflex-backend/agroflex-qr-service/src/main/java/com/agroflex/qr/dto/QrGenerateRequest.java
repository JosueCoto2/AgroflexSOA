package com.agroflex.qr.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerateRequest {

    @NotNull
    private Long idOrden;

    @NotNull
    private String numeroOrden;

    @NotNull
    private Long idVendedor;

    @NotNull
    private Long idComprador;

    private Double latitudEntrega;
    private Double longitudEntrega;
}
