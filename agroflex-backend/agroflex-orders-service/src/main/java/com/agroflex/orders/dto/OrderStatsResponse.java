package com.agroflex.orders.dto;

import java.util.Map;

public record OrderStatsResponse(
        long totalOrdenes,
        Map<String, Long> porEstado
) {
}
