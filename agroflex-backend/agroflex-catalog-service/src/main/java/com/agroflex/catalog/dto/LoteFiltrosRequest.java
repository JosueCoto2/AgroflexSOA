package com.agroflex.catalog.dto;

import java.math.BigDecimal;

public record LoteFiltrosRequest(
        BigDecimal precioMin,
        BigDecimal precioMax,
        String     unidadVenta,
        String     ordenarPor,
        int        page,
        int        size
) {
    public LoteFiltrosRequest {
        if (size <= 0 || size > 50) size = 12;
        if (page < 0) page = 0;
        if (ordenarPor == null) ordenarPor = "fecha_desc";
    }
}
