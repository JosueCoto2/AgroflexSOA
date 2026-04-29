package com.agroflex.qr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrValidateResponse {

    private boolean valido;
    private String estado;
    private String mensaje;

    /** true cuando el QR fue validado exitosamente — indica al orders-service que libere el escrow */
    private boolean liberarEscrow;

    private Long idOrden;
    private Boolean geoValidado;
    private Double distanciaMetros;
}
