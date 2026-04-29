package com.agroflex.catalog.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class LoteNoEncontradoException extends RuntimeException {

    private final String codigo = "AF-CAT-404";

    public LoteNoEncontradoException(Long idLote) {
        super("Lote con ID " + idLote + " no encontrado o fue eliminado");
    }

    public LoteNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public String getCodigo() {
        return codigo;
    }
}
