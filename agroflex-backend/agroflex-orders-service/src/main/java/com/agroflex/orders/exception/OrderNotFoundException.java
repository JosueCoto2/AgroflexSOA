package com.agroflex.orders.exception;

public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException(Long id) {
        super("Orden no encontrada con ID: " + id);
    }

    public OrderNotFoundException(String numeroOrden) {
        super("Orden no encontrada con número: " + numeroOrden);
    }
}
