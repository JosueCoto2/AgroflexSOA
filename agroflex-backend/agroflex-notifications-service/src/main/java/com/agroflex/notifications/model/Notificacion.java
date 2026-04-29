package com.agroflex.notifications.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @Column(name = "tipo", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private TipoNotificacion tipo;

    @Column(name = "categoria", length = 60)
    private String categoria;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "cuerpo", columnDefinition = "text")
    private String cuerpo;

    @Column(name = "datos_extra", columnDefinition = "json")
    private String datosExtra;

    @Column(name = "enviada", nullable = false)
    @Builder.Default
    private Boolean enviada = false;

    @Column(name = "leida", nullable = false)
    @Builder.Default
    private Boolean leida = false;

    @Column(name = "error_envio", length = 255)
    private String errorEnvio;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "enviada_at")
    private LocalDateTime enviadaAt;

    @Column(name = "leida_at")
    private LocalDateTime leidaAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.enviada == null) this.enviada = false;
        if (this.leida == null) this.leida = false;
    }

    public enum TipoNotificacion {
        PUSH, SMS, EMAIL, IN_APP
    }
}
