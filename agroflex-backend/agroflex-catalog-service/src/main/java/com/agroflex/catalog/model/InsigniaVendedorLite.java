package com.agroflex.catalog.model;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

/**
 * Entidad de solo lectura — permite verificar insignias desde catalog-service
 * sin duplicar lógica del users/auth service.
 */
@Entity
@Immutable
@Table(name = "insignias_vendedor")
@Getter
public class InsigniaVendedorLite {

    @Id
    @Column(name = "id_insignia")
    private Long idInsignia;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "estado_verificacion", length = 20)
    private String estadoVerificacion;
}
