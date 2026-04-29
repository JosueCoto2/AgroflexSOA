package com.agroflex.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SolicitudInsigniaRequest {

    @NotBlank(message = "El rol es requerido")
    private String rol;

    @NotBlank(message = "El nombre del negocio es requerido")
    private String nombreNegocio;

    @NotBlank(message = "El municipio es requerido")
    private String municipio;

    @NotBlank(message = "El estado es requerido")
    private String estado;

    private String descripcion;
}
