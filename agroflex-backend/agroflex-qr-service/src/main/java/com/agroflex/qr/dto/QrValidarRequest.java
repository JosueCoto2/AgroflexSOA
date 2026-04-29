package com.agroflex.qr.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload simplificado para el frontend.
 * El productor solo envía el token escaneado + coordenadas GPS.
 * El servicio resuelve el idOrden internamente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrValidarRequest {

    @NotBlank
    private String token;

    private Double lat;
    private Double lng;
    private Double precisionGpsM;

    private String ipEscaneo;
    private String userAgentEscaneo;
}
