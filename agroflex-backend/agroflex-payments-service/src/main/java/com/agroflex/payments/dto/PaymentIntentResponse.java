package com.agroflex.payments.dto;

/**
 * Contrato con orders-service — campos deben coincidir exactamente con
 * com.agroflex.orders.dto.PaymentIntentResponse.
 */
public record PaymentIntentResponse(
        String estado,          // PENDIENTE, FALLIDO
        String paymentIntentId, // pi_xxxxx — para tracking interno
        String clientSecret     // para confirmar desde React con Stripe.js
) {
}
