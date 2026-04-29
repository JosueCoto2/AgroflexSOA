package com.agroflex.catalog.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tipos_cultivo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoCultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cultivo")
    private Long idCultivo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "categoria", length = 80)
    private String categoria;

    @Column(name = "temporada", length = 50)
    private String temporada;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;
}
