package com.agroflex.catalog.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Body del POST /api/productos.
 * El tipo puede ser 'cosecha' o 'suministro'.
 */
public record CrearProductoRequest(

        @NotBlank(message = "El tipo es requerido")
        @Pattern(regexp = "cosecha|suministro", message = "tipo debe ser 'cosecha' o 'suministro'")
        String tipo,

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 200)
        String nombre,

        @Size(max = 2000)
        String descripcion,

        @NotNull(message = "El precio es requerido")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
        BigDecimal precio,

        @NotBlank(message = "La unidad es requerida")
        @Size(max = 50)
        String unidad,

        /** Solo requerido para suministros. Para cosechas debe ser null (se vende el lote completo). */
        @DecimalMin(value = "0.001", message = "El stock debe ser mayor a 0")
        BigDecimal stock,

        @NotBlank(message = "El municipio es requerido")
        String municipio,

        @NotBlank(message = "El estado es requerido")
        String estadoRepublica,

        String imagenPrincipal
) {}
