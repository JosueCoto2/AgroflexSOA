package com.agroflex.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
        String        fotoPerfilProductor,
        BigDecimal    reputacionProductor,
        LocalDateTime createdAt,
        Double        latitud,
        Double        longitud
) {}
