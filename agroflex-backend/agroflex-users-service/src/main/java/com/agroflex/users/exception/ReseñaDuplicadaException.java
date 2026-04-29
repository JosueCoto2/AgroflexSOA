package com.agroflex.users.exception;

public class ReseñaDuplicadaException extends RuntimeException {

    private final String codigo;

    public ReseñaDuplicadaException(Long idOrden) {
        super("Ya existe una reseña tuya para la orden " + idOrden);
        this.codigo = "AF-USR-409";
    }

    public String getCodigo() {
        return codigo;
    }
}
