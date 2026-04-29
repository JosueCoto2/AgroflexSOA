package com.agroflex.users.dto;

import java.time.LocalDateTime;

public record ReseñaResponse(
        Long idReseña,
        Long idOrden,
        Long idCalificador,
        String tipoReseña,
        Byte puntuacion,
        String comentario,
        LocalDateTime createdAt
) {}
