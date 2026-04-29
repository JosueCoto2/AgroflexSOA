package com.agroflex.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reseñas_calificaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReseñaCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reseña")
    private Long idReseña;

    @Column(name = "id_orden", nullable = false)
    private Long idOrden;

    @Column(name = "id_calificador", nullable = false)
    private Long idCalificador;

    @Column(name = "id_calificado", nullable = false)
    private Long idCalificado;

    @Column(name = "tipo_reseña", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private TipoReseña tipoReseña;

    @Column(name = "puntuacion", nullable = false)
    private Byte puntuacion;

    @Column(name = "comentario", columnDefinition = "text")
    private String comentario;

    @Column(name = "aspectos", columnDefinition = "json")
    private String aspectos;

    @Column(name = "visible", nullable = false)
    @Builder.Default
    private Boolean visible = true;

    @Column(name = "reportada", nullable = false)
    @Builder.Default
    private Boolean reportada = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.visible == null) this.visible = true;
        if (this.reportada == null) this.reportada = false;
    }

    public enum TipoReseña {
        COMPRADOR_A_VENDEDOR,
        VENDEDOR_A_COMPRADOR
    }
}
