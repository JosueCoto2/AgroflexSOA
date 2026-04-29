package com.agroflex.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_insignia")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudInsignia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "nombre_usuario", length = 150)
    private String nombreUsuario;

    @Column(name = "correo_usuario", length = 180)
    private String correoUsuario;

    @Column(name = "rol_solicitado", length = 50)
    private String rolSolicitado;

    @Column(name = "documento_url", length = 500)
    private String documentoUrl;

    @Column(name = "motivo_solicitud", columnDefinition = "TEXT")
    private String motivoSolicitud;

    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "APROBADA";

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "admin_revisor", length = 180)
    private String adminRevisor;

    @PrePersist
    void onCreate() {
        if (this.fechaSolicitud == null) {
            this.fechaSolicitud = LocalDateTime.now();
        }
    }
}
