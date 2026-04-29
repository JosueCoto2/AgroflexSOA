package com.agroflex.catalog.dto;

import java.util.List;

public record CatalogoPageResponse(
        List<LoteResponse> lotes,
        int paginaActual,
        int totalPaginas,
        long totalElementos,
        boolean hayMas
) {
}
