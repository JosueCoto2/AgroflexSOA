package com.agroflex.payments.exception;

public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(Long idOrden) {
        super("Transacción no encontrada para orden ID: " + idOrden);
    }

    public PaymentNotFoundException(String field, String value) {
        super("Transacción no encontrada con " + field + ": " + value);
    }
}
