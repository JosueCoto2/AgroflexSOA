package com.agroflex.catalog.dto;

import com.agroflex.catalog.model.Producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta que mapea exactamente al formato que espera el frontend.
 *
 * Frontend espera:
 * { id, nombre, tipo, precio, unidad, imagen, ubicacion:{municipio,estado},
 *   vendedor:{id,nombre,rol,verificado}, disponibilidad, stock, fechaPublicacion }
 */
public record ProductoResumenDTO(
        String id,
        String nombre,
        String tipo,
        BigDecimal precio,
        String unidad,
        String imagen,
        UbicacionDTO ubicacion,
        VendedorDTO vendedor,
        String disponibilidad,
        BigDecimal stock,
        LocalDateTime fechaPublicacion
) {
    public record UbicacionDTO(String municipio, String estado) {}

    public record VendedorDTO(Long id, String nombre, String rol, boolean verificado) {}

    /** Mapea un Producto a este DTO. */
    public static ProductoResumenDTO from(Producto p) {
        return new ProductoResumenDTO(
                String.valueOf(p.getIdProducto()),
                p.getNombre(),
                p.getTipo(),
                p.getPrecio(),
                p.getUnidad(),
                p.getImagenPrincipal(),
                new UbicacionDTO(p.getMunicipio(), p.getEstadoRepublica()),
                new VendedorDTO(
                        p.getIdVendedor(),
                        p.getNombreVendedor(),
                        p.getRolVendedor(),
                        Boolean.TRUE.equals(p.getVendedorVerificado())
                ),
                p.getDisponibilidad(),
                p.getStock(),
                p.getCreatedAt()
        );
    }
}
