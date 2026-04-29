package com.agroflex.users.exception;

public class UsuarioNoEncontradoException extends RuntimeException {

    private final String codigo;

    public UsuarioNoEncontradoException(Long idUsuario) {
        super("Usuario con id " + idUsuario + " no encontrado");
        this.codigo = "AF-USR-404";
    }

    public UsuarioNoEncontradoException(String mensaje) {
        super(mensaje);
        this.codigo = "AF-USR-404";
    }

    public String getCodigo() {
        return codigo;
    }
}
