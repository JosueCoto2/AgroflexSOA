package com.agroflex.admin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Mapea la tabla notificaciones (compartida con notifications-service).
 * El admin-service solo inserta IN_APP para broadcasts masivos.
 */
@Entity
@Table(name = "notificaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notif")
    private Long idNotif;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoNotif tipo;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "cuerpo", columnDefinition = "TEXT")
    private String cuerpo;

    @Column(name = "enviada")
    private Boolean enviada;

    @Column(name = "leida")
    private Boolean leida;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum TipoNotif { PUSH, SMS, EMAIL, IN_APP }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.enviada == null) this.enviada = true;
        if (this.leida == null)  this.leida = false;
        if (this.tipo == null)   this.tipo = TipoNotif.IN_APP;
    }
}
