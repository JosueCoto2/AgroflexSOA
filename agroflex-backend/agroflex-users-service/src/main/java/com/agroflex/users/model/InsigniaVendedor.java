package com.agroflex.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "insignias_vendedor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsigniaVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_insignia")
    private Long idInsignia;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "id_rol", nullable = false)
    private Byte idRol;

    @Column(name = "tipo_documento", nullable = false, length = 60)
    private String tipoDocumento;

    @Column(name = "firebase_doc_url", nullable = false, length = 512)
    private String firebaseDocUrl;

    @Column(name = "firebase_doc_path", length = 512)
    private String firebaseDocPath;

    @Column(name = "nombre_negocio", length = 180)
    private String nombreNegocio;

    @Column(name = "rfc", length = 13)
    private String rfc;

    @Column(name = "descripcion_negocio", columnDefinition = "text")
    private String descripcionNegocio;

    @Column(name = "estado_verificacion", length = 20)
    private String estadoVerificacion;

    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;

    @Column(name = "verificado_por")
    private Long verificadoPor;

    @Column(name = "fecha_verificacion")
    private LocalDateTime fechaVerificacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.estadoVerificacion = "PENDIENTE";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
