package com.agroflex.orders.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_orden", nullable = false, unique = true)
    private Long idOrden;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "RETENIDO";

    @Column(name = "fecha_retencion", nullable = false, updatable = false)
    private LocalDateTime fechaRetencion;

    @Column(name = "fecha_liberacion")
    private LocalDateTime fechaLiberacion;

    @Column(name = "razon", length = 255)
    private String razon;

    @PrePersist
    protected void onCreate() {
        this.fechaRetencion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "RETENIDO";
        }
    }
}
