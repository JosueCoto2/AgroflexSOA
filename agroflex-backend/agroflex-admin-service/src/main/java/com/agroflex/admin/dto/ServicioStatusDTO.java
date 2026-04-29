package com.agroflex.admin.dto;

/**
 * Estado de un microservicio para el health monitor del panel admin.
 */
public record ServicioStatusDTO(
        String nombre,
        String estado,      // "UP" | "DOWN" | "DEGRADED"
        long latenciaMs,
        String url,
        String detalle
) {}
