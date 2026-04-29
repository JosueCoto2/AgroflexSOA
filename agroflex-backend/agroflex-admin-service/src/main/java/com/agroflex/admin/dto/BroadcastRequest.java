package com.agroflex.admin.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload para enviar un anuncio a todos los usuarios (o a un segmento por rol).
 *
 * @param titulo    Título de la notificación (máx 200 chars)
 * @param mensaje   Cuerpo del mensaje
 * @param segmento  null = todos | "PRODUCTOR" | "COMPRADOR" | "PROVEEDOR" | "INVERNADERO" | "EMPAQUE"
 */
public record BroadcastRequest(
        @NotBlank String titulo,
        @NotBlank String mensaje,
        String segmento
) {}
