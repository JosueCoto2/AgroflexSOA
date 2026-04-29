package com.agroflex.orders.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(
    name = "items_pedido",
    indexes = {
        @Index(name = "idx_item_orden", columnList = "id_orden")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden", nullable = false)
    private OrdenTransaccion orden;

    @Column(name = "id_producto", nullable = false)
    private Long idProducto;

    @Column(name = "tipo_producto", nullable = false, length = 50)
    @Builder.Default
    private String tipoProducto = "COSECHA_LOTE";

    @Column(name = "cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "nombre_producto", length = 200)
    private String nombreProducto;

    @Column(name = "unidad_venta", length = 50)
    private String unidadVenta;

    @PrePersist
    protected void calcularSubtotal() {
        if (this.cantidad != null && this.precioUnitario != null) {
            this.subtotal = this.cantidad.multiply(this.precioUnitario);
        }
    }
}
