package com.agroflex.payments.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "transacciones",
    indexes = {
        @Index(name = "idx_trans_orden",   columnList = "id_orden"),
        @Index(name = "idx_trans_comprador", columnList = "id_comprador"),
        @Index(name = "idx_trans_vendedor",  columnList = "id_vendedor"),
        @Index(name = "idx_trans_estado",    columnList = "estado_pago"),
        @Index(name = "idx_trans_stripe_pi", columnList = "stripe_payment_intent_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_orden", nullable = false, unique = true)
    private Long idOrden;

    @Column(name = "id_comprador", nullable = false)
    private Long idComprador;

    @Column(name = "id_vendedor", nullable = false)
    private Long idVendedor;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "monto_comision", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal montoComision = BigDecimal.ZERO;

    @Column(name = "monto_vendedor", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal montoVendedor = BigDecimal.ZERO;

    @Column(name = "moneda", length = 3)
    @Builder.Default
    private String moneda = "MXN";

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", length = 20)
    @Builder.Default
    private MetodoPago metodoPago = MetodoPago.STRIPE;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false, length = 20)
    @Builder.Default
    private EstadoPago estadoPago = EstadoPago.PENDIENTE;

    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    // NUNCA loguear este campo
    @Column(name = "stripe_client_secret", length = 300)
    private String stripeClientSecret;

    @Column(name = "stripe_transfer_id", length = 100)
    private String stripeTransferId;

    @Column(name = "stripe_charge_id", length = 100)
    private String stripeChargeId;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "fecha_liberacion")
    private LocalDateTime fechaLiberacion;

    @OneToMany(mappedBy = "transaccion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MovimientoEscrow> movimientos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        if (this.estadoPago == null) this.estadoPago = EstadoPago.PENDIENTE;
        if (this.metodoPago == null) this.metodoPago = MetodoPago.STRIPE;
        if (this.moneda == null) this.moneda = "MXN";
        if (this.montoComision == null) this.montoComision = BigDecimal.ZERO;
        if (this.montoVendedor == null) this.montoVendedor = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
