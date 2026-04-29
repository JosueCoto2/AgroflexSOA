package com.agroflex.geo.model;

/**
 * Representación de un municipio.
 * Datos estáticos — no requiere base de datos.
 */
public record Municipio(
        int clave,
        String nombre,
        String estado
) {}
