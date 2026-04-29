package com.agroflex.payments.exception;

public class StripeIntegrationException extends RuntimeException {

    public StripeIntegrationException(String operation, String cause) {
        super("Error en operación Stripe [" + operation + "]: " + cause);
    }

    public StripeIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
