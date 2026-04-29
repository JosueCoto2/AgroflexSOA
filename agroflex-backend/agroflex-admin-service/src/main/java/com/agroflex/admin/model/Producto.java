package com.agroflex.admin.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "precio")
    private BigDecimal precio;

    @Column(name = "unidad")
    private String unidad;

    /** Solo para suministros. NULL para cosechas (se vende el lote completo). */
    @Column(name = "stock", nullable = true, precision = 12, scale = 3)
    private BigDecimal stock;

    @Column(name = "disponibilidad")
    private String disponibilidad;

    @Column(name = "municipio")
    private String municipio;

    @Column(name = "estado_republica")
    private String estadoRepublica;

    @Column(name = "imagen_principal")
    private String imagenPrincipal;

    @Column(name = "id_vendedor")
    private Long idVendedor;

    @Column(name = "nombre_vendedor")
    private String nombreVendedor;

    @Column(name = "rol_vendedor")
    private String rolVendedor;

    @Column(name = "vendedor_verificado")
    private Boolean vendedorVerificado;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "destacado")
    private Boolean destacado;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
