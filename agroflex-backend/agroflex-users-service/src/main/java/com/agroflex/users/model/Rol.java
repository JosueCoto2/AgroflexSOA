package com.agroflex.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rol implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Byte idRol;

    @Column(name = "nombre_rol", nullable = false, unique = true, length = 50)
    @Enumerated(EnumType.STRING)
    private NombreRol nombreRol;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    public enum NombreRol {
        PRODUCTOR, INVERNADERO, PROVEEDOR, EMPAQUE, COMPRADOR, ADMIN
    }

    @Override
    public String getAuthority() {
        return "ROLE_" + this.nombreRol.name();
    }
}
