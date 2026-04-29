package com.agroflex.catalog.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "imagenes_galeria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagenGaleria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen")
    private Long idImagen;

    @Column(name = "entidad_tipo", length = 20)
    private String entidadTipo;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(name = "firebase_url", columnDefinition = "TEXT")
    private String firebaseUrl;

    @Column(name = "firebase_path", columnDefinition = "TEXT")
    private String firebasePath;

    @Column(name = "firebase_bucket", length = 200)
    private String firebaseBucket;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "tipo_mime", length = 50)
    private String tipoMime;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "ancho_px")
    private Integer anchoPx;

    @Column(name = "alto_px")
    private Integer altoPx;

    @Column(name = "es_principal")
    @Builder.Default
    private Boolean esPrincipal = false;

    @Column(name = "orden_display")
    @Builder.Default
    private Integer ordenDisplay = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
