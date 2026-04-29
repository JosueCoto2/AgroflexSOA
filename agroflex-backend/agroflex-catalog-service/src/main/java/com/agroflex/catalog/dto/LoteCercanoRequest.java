package com.agroflex.catalog.dto;

import jakarta.validation.constraints.NotNull;

public record LoteCercanoRequest(
        @NotNull Double latitud,
        @NotNull Double longitud,
        Double radioKm,
        Integer limite
) {
    public LoteCercanoRequest {
        if (radioKm == null) radioKm = 50.0;
        if (limite == null || limite <= 0) limite = 20;
        if (limite > 100) limite = 100;
    }
}
