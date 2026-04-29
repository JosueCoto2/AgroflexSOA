package com.agroflex.payments.model;

public enum EstadoPago {
    PENDIENTE,    // PaymentIntent creado, esperando confirmación del frontend
    PROCESANDO,   // Stripe procesando el pago
    PAGADO,       // Dinero cobrado, retenido en escrow
    LIBERADO,     // Dinero transferido al vendedor
    REEMBOLSADO,  // Dinero devuelto al comprador
    FALLIDO,      // Pago rechazado por Stripe
    DISPUTADO     // Chargeback o disputa abierta
}
