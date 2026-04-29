package com.agroflex.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrGenerateResponse {

    /** Base64-encoded PNG del código QR */
    private String qrCode;

    /** Estado: GENERADO */
    private String estado;

    /** Token QR (para que el comprador lo presente) */
    private String token;

    private Long idQr;
    private Long idOrden;
    private LocalDateTime fechaExpiracion;
}
