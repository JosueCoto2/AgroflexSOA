package com.agroflex.users.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearReseñaRequest(

        @NotNull
        Long idOrden,

        @NotNull
        Long idCalificado,

        @NotNull
        String tipoReseña,

        @NotNull
        @Min(1) @Max(5)
        Byte puntuacion,

        @Size(max = 1000)
        String comentario
) {}
