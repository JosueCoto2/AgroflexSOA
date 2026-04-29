package com.agroflex.admin.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Mapea la tabla Usuarios (misma BD que auth-service).
 * Solo lectura + patches de activo/validado.
 */
@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellidos")
    private String apellidos;

    @Column(name = "correo")
    private String correo;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "estado_republica")
    private String estadoRepublica;

    @Column(name = "municipio")
    private String municipio;

    @Column(name = "puntuacion_rep")
    private BigDecimal puntuacionRep;

    @Column(name = "validado")
    private Boolean validado;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuarios_roles",
        joinColumns = @JoinColumn(name = "id_usuario"),
        inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private java.util.Set<Rol> roles = new java.util.HashSet<>();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
