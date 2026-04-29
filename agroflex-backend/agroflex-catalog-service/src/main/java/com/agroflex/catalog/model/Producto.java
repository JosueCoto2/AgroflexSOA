package com.agroflex.catalog.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Entidad unificada para cosechas y suministros.
 * El campo `tipo` distingue entre 'cosecha' y 'suministro'.
 *
 * Los datos del vendedor se desnormalizan aquí para evitar llamadas
 * al auth-service en cada consulta del catálogo (patrón SOA).
 */
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

    /** 'cosecha' o 'suministro' */
    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "unidad", nullable = false, length = 50)
    private String unidad;

    /** Solo para suministros (agroquímicos, semillas, etc.). Las cosechas son todo-o-nada, su stock es NULL. */
    @Column(name = "stock", nullable = true, precision = 12, scale = 3)
    private BigDecimal stock;

    /** 'disponible' | 'limitado' | 'agotado' */
    @Column(name = "disponibilidad", length = 20)
    @Builder.Default
    private String disponibilidad = "disponible";

    @Column(name = "municipio", length = 80)
    private String municipio;

    @Column(name = "estado_republica", length = 80)
    private String estadoRepublica;

    @Column(name = "imagen_principal", length = 500)
    private String imagenPrincipal;

    // ── Datos del vendedor (desnormalizados)
    @Column(name = "id_vendedor", nullable = false)
    private Long idVendedor;

    @Column(name = "nombre_vendedor", nullable = false, length = 150)
    private String nombreVendedor;

    @Column(name = "rol_vendedor", length = 30)
    private String rolVendedor;

    @Column(name = "vendedor_verificado")
    @Builder.Default
    private Boolean vendedorVerificado = false;

    // ── Control
    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "destacado")
    @Builder.Default
    private Boolean destacado = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
