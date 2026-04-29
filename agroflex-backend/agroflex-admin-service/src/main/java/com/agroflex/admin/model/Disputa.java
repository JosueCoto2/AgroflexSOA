package com.agroflex.admin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "disputas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Disputa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "id_pedido", nullable = false)
    private Long idPedido;

    @Column(name = "id_reportante", nullable = false)
    private Long idReportante;

    @Column(name = "tipo_reporte", length = 80)
    private String tipoReporte;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "evidencia_url", length = 500)
    private String evidenciaUrl;

    /** ABIERTA | EN_REVISION | RESUELTA | CERRADA */
    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "ABIERTA";

    @Column(name = "resolucion", columnDefinition = "TEXT")
    private String resolucion;

    @Column(name = "admin_asignado", length = 180)
    private String adminAsignado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @PrePersist
    void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}
