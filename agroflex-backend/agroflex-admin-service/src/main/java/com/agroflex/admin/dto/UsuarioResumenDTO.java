package com.agroflex.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UsuarioResumenDTO {
    private Long id;
    private String nombre;
    private String apellidos;
    private String correo;
    private String telefono;
    private List<String> roles;
    private Boolean validado;
    private Boolean activo;
    private String municipio;
    private String estadoRepublica;
    private Long totalProductos;
    private Long totalPedidos;
    private BigDecimal puntuacionRep;
    private LocalDateTime fechaRegistro;
}
