package com.agroflex.catalog.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cosechas_lote")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CosechaLote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Long idLote;

    @Column(name = "id_productor", nullable = false)
    private Long idProductor;

    @Column(name = "nombre_producto", nullable = false, length = 200)
    private String nombreProducto;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "ubicacion", length = 500)
    private String ubicacion;

    @Column(name = "cantidad_disponible", precision = 12, scale = 3)
    private BigDecimal cantidadDisponible;

    @Column(name = "unidad_venta", length = 30)
    private String unidadVenta;

    @Column(name = "contacto", length = 200)
    private String contacto;

    @Column(name = "latitud")
    private Double latitud;

    @Column(name = "longitud")
    private Double longitud;

    @Column(name = "estado_lote", length = 20)
    @Builder.Default
    private String estadoLote = "DISPONIBLE";

    @Column(name = "nombre_productor", length = 200)
    private String nombreProductor;

    @Column(name = "foto_perfil_productor", length = 500)
    private String fotoPerfilProductor;

    @Column(name = "reputacion_productor", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal reputacionProductor = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
