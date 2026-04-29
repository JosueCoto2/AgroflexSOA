package com.agroflex.orders.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "ordenes_transaccion",
    indexes = {
        @Index(name = "idx_comprador", columnList = "id_comprador"),
        @Index(name = "idx_vendedor",  columnList = "id_vendedor"),
        @Index(name = "idx_estado",    columnList = "estado"),
        @Index(name = "idx_fecha",     columnList = "fecha_creacion")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenTransaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_orden", unique = true, nullable = false, length = 50)
    private String numeroOrden;

    @Column(name = "id_comprador", nullable = false)
    private Long idComprador;

    @Column(name = "id_vendedor", nullable = false)
    private Long idVendedor;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private EstadoPedido estadoPedido = EstadoPedido.PENDIENTE;

    @Column(name = "total_monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalMonto;

    @Column(name = "monto_escrow", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal montoEscrow = BigDecimal.ZERO;

    @Column(name = "metodo_pago", length = 50)
    @Builder.Default
    private String metodoPago = "STRIPE";

    @Column(name = "id_transaccion_pago", length = 100)
    private String idTransaccionPago;

    @Column(name = "latitud_entrega", columnDefinition = "DECIMAL(10,8)")
    private Double latitudEntrega;

    @Column(name = "longitud_entrega", columnDefinition = "DECIMAL(11,8)")
    private Double longitudEntrega;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemPedido> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        if (this.estadoPedido == null) {
            this.estadoPedido = EstadoPedido.PENDIENTE;
        }
        if (this.montoEscrow == null) {
            this.montoEscrow = BigDecimal.ZERO;
        }
        if (this.metodoPago == null) {
            this.metodoPago = "STRIPE";
        }
        // numeroOrden se genera si aún no tiene valor
        // (en la práctica se asigna antes de persistir desde OrderService)
        if (this.numeroOrden == null || this.numeroOrden.isBlank()) {
            this.numeroOrden = "AGF-" + Year.now().getValue() + "-TMP";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
