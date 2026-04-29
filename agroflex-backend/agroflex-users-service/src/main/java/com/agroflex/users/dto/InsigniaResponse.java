package com.agroflex.users.dto;

import java.time.LocalDateTime;

public record InsigniaResponse(
        Long idInsignia,
        String tipoDocumento,
        String nombreNegocio,
        String rfc,
        String descripcionNegocio,
        String estadoVerificacion,
        String motivoRechazo,
        LocalDateTime fechaVerificacion,
        LocalDateTime createdAt
) {}
