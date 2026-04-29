package com.agroflex.qr.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguridad_qr")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeguridadQR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_qr")
    private Long idQr;

    @Column(name = "id_orden", nullable = false, unique = true)
    private Long idOrden;

    @Column(name = "token_qr", nullable = false, length = 128)
    private String tokenQr;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_qr", nullable = false)
    @Builder.Default
    private EstadoQr estadoQr = EstadoQr.GENERADO;

    @Column(name = "fecha_generacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaGeneracion = LocalDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_escaneo")
    private LocalDateTime fechaEscaneo;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

    // GPS del lugar real del escaneo
    @Column(name = "latitud_escaneo", precision = 10, scale = 7)
    private BigDecimal latitudEscaneo;

    @Column(name = "longitud_escaneo", precision = 10, scale = 7)
    private BigDecimal longitudEscaneo;

    @Column(name = "precision_gps_m", precision = 6, scale = 1)
    private BigDecimal precisionGpsM;

    // Coordenadas esperadas (de la orden)
    @Column(name = "latitud_esperada", precision = 10, scale = 7)
    private BigDecimal latitudEsperada;

    @Column(name = "longitud_esperada", precision = 10, scale = 7)
    private BigDecimal longitudEsperada;

    @Column(name = "radio_tolerancia_m", nullable = false, precision = 6, scale = 1)
    @Builder.Default
    private BigDecimal radioToleranciaM = new BigDecimal("500.0");

    @Column(name = "distancia_calculada", precision = 8, scale = 2)
    private BigDecimal distanciaCalculada;

    @Column(name = "geo_validado")
    private Boolean geoValidado;

    @Column(name = "id_escaneado_por")
    private Long idEscaneadoPor;

    @Column(name = "ip_escaneo", length = 45)
    private String ipEscaneo;

    @Column(name = "user_agent_escaneo", length = 512)
    private String userAgentEscaneo;

    @Column(name = "intentos_fallidos", nullable = false)
    @Builder.Default
    private Integer intentosFallidos = 0;

    @Column(name = "max_intentos", nullable = false)
    @Builder.Default
    private Integer maxIntentos = 3;
}
