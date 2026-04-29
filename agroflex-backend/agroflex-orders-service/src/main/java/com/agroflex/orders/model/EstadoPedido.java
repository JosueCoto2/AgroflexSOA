package com.agroflex.orders.model;

public enum EstadoPedido {
    PENDIENTE,       // Orden creada, esperando pago
    CONFIRMADO,      // Pago recibido, escrow retenido
    EN_TRANSITO,     // Productor confirmó envío/preparación
    LISTO_ENTREGA,   // Listo para validar con QR
    ENTREGADO,       // QR escaneado y GPS validado
    COMPLETADO,      // Pago liberado al vendedor
    CANCELADO,       // Cancelado antes de entrega
    DISPUTADO,       // En proceso de disputa
    REEMBOLSADO      // Dinero devuelto al comprador
}
