package com.agroflex.qr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrValidateRequest {

    @NotBlank
    private String token;

    @NotNull
    private Long idOrden;

    private Long idEscaneadoPor;

    private Double latitudEscaneo;
    private Double longitudEscaneo;
    private Double precisionGpsM;

    private String ipEscaneo;
    private String userAgentEscaneo;
}
