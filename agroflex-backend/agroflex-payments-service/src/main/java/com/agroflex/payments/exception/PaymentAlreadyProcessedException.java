package com.agroflex.payments.exception;

public class PaymentAlreadyProcessedException extends RuntimeException {

    public PaymentAlreadyProcessedException(Long idOrden) {
        super("Ya existe una transacción de pago para la orden ID: " + idOrden);
    }
}
