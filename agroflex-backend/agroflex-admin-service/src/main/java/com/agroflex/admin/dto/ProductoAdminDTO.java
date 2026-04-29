package com.agroflex.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductoAdminDTO {
    private Long id;
    private String tipo;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String unidad;
    private BigDecimal stock;
    private String disponibilidad;
    private String municipio;
    private String estadoRepublica;
    private String imagenPrincipal;
    private Long idVendedor;
    private String nombreVendedor;
    private String rolVendedor;
    private Boolean vendedorVerificado;
    private Boolean activo;
    private Boolean destacado;
    private LocalDateTime createdAt;
    private String motivo;
}
