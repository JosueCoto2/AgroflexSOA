package com.agroflex.orders.exception;

import java.math.BigDecimal;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(Long idProducto, BigDecimal disponible, BigDecimal solicitada) {
        super(String.format(
                "Stock insuficiente para producto %d. Disponible: %s, Solicitado: %s",
                idProducto, disponible, solicitada));
    }
}
