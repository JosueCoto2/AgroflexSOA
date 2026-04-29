package com.agroflex.orders.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Copia local de LoteResponse del catalog-service para uso en Feign clients.
 * Sincronizada con com.agroflex.catalog.dto.LoteResponse.
 */
public record LoteResponse(
        Long          idLote,
        String        nombreProducto,
        String        descripcion,
        BigDecimal    precio,
        String        imagenUrl,
        String        ubicacion,
        BigDecimal    cantidadDisponible,
        String        unidadVenta,
        String        contacto,
        String        estadoLote,
        Long          idProductor,
        String        nombreProductor,
        BigDecimal    reputacionProductor,
        LocalDateTime createdAt,
        Double        latitud,
        Double        longitud
) {
    /** Alias usado en OrderService para obtener el precio por unidad */
    public BigDecimal precioUnitario() { return precio; }

    /** Alias usado en OrderService para obtener el nombre del producto */
    public String titulo() { return nombreProducto; }
}
