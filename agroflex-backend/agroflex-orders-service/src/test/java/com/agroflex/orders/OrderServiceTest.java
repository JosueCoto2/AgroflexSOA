package com.agroflex.orders;

import com.agroflex.orders.client.CatalogServiceClient;
import com.agroflex.orders.client.QrServiceClient;
import com.agroflex.orders.dto.*;
import com.agroflex.orders.exception.InsufficientStockException;
import com.agroflex.orders.exception.OrderNotFoundException;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.model.ItemPedido;
import com.agroflex.orders.model.OrdenTransaccion;
import com.agroflex.orders.repository.OrdenTransaccionRepository;
import com.agroflex.orders.service.EscrowService;
import com.agroflex.orders.service.OrderService;
import com.agroflex.orders.service.OrderValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrdenTransaccionRepository ordenRepository;

    @Mock
    private OrderValidationService validationService;

    @Mock
    private EscrowService escrowService;

    @Mock
    private QrServiceClient qrServiceClient;

    @InjectMocks
    private OrderService orderService;

    private LoteResponse loteDisponible;
    private CreateOrderRequest request;
    private static final Long ID_COMPRADOR = 1L;
    private static final Long ID_VENDEDOR = 2L;
    private static final String AUTH_HEADER = "Bearer test-token";

    @BeforeEach
    void setUp() {
        loteDisponible = new LoteResponse(
                10L,                          // idLote
                "Jitomate Premium",            // nombreProducto
                "Jitomate fresco",             // descripcion
                new BigDecimal("15.50"),       // precio (precioUnitario)
                null,                          // imagenUrl
                "Puebla, Tepeaca",             // ubicacion
                new BigDecimal("100"),         // cantidadDisponible
                "kg",                          // unidadVenta
                null,                          // contacto
                "DISPONIBLE",                  // estadoLote
                ID_VENDEDOR,                   // idProductor
                "Juan Productor",              // nombreProductor
                new BigDecimal("4.5"),         // reputacionProductor
                null,                          // createdAt
                19.0,                          // latitud
                -97.0                          // longitud
        );

        request = CreateOrderRequest.builder()
                .idVendedor(ID_VENDEDOR)
                .items(List.of(
                        OrderItemDto.builder()
                                .idProducto(10L)
                                .tipoProducto("COSECHA_LOTE")
                                .cantidad(new BigDecimal("5"))
                                .build()
                ))
                .metodoPago("STRIPE")
                .build();
    }

    @Test
    @DisplayName("Crear orden exitosamente con datos válidos")
    void test_crearOrden_exitoso_cuandoDatosValidos() {
        List<LoteResponse> lotes = List.of(loteDisponible);
        BigDecimal total = new BigDecimal("77.50"); // 5 * 15.50

        when(validationService.validarItems(any(), eq(ID_COMPRADOR), eq(ID_VENDEDOR), eq(AUTH_HEADER)))
                .thenReturn(lotes);
        when(validationService.calcularTotal(any(), eq(lotes))).thenReturn(total);
        when(ordenRepository.countByYear(anyInt())).thenReturn(0L);

        OrdenTransaccion ordenGuardada = buildOrden(EstadoPedido.PENDIENTE, total);
        when(ordenRepository.save(any())).thenReturn(ordenGuardada);
        when(ordenRepository.findById(any())).thenReturn(Optional.of(ordenGuardada));

        OrderResponse response = orderService.crearOrden(request, ID_COMPRADOR, AUTH_HEADER);

        assertThat(response).isNotNull();
        assertThat(response.estadoPedido()).isEqualTo("PENDIENTE");
        assertThat(response.totalMonto()).isEqualByComparingTo(total);
        assertThat(response.idComprador()).isEqualTo(ID_COMPRADOR);
        assertThat(response.idVendedor()).isEqualTo(ID_VENDEDOR);

        verify(ordenRepository, atLeastOnce()).save(any(OrdenTransaccion.class));
    }

    @Test
    @DisplayName("Crear orden falla cuando stock insuficiente")
    void test_crearOrden_falla_cuandoStockInsuficiente() {
        when(validationService.validarItems(any(), eq(ID_COMPRADOR), eq(ID_VENDEDOR), eq(AUTH_HEADER)))
                .thenThrow(new InsufficientStockException(10L, new BigDecimal("3"), new BigDecimal("5")));

        assertThatThrownBy(() -> orderService.crearOrden(request, ID_COMPRADOR, AUTH_HEADER))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    @DisplayName("Crear orden falla cuando comprador es el mismo que vendedor")
    void test_crearOrden_falla_cuandoCompradorEsVendedor() {
        when(validationService.validarItems(any(), eq(ID_VENDEDOR), eq(ID_VENDEDOR), eq(AUTH_HEADER)))
                .thenThrow(new IllegalArgumentException("El comprador no puede ser el mismo que el vendedor"));

        assertThatThrownBy(() -> orderService.crearOrden(request, ID_VENDEDOR, AUTH_HEADER))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Actualizar estado exitoso — transición válida PENDIENTE → CONFIRMADO")
    void test_actualizarEstado_exitoso_transicionValida() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.PENDIENTE, new BigDecimal("77.50"));
        when(ordenRepository.findById(1L)).thenReturn(Optional.of(orden));
        when(ordenRepository.save(any())).thenReturn(orden);

        OrderStatusUpdateDto dto = new OrderStatusUpdateDto("CONFIRMADO", null);
        OrderResponse response = orderService.actualizarEstado(1L, dto, ID_COMPRADOR, AUTH_HEADER);

        assertThat(response.estadoPedido()).isEqualTo("CONFIRMADO");
    }

    @Test
    @DisplayName("Actualizar estado falla — transición inválida COMPLETADO → PENDIENTE")
    void test_actualizarEstado_falla_transicionInvalida() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.COMPLETADO, new BigDecimal("77.50"));
        when(ordenRepository.findById(1L)).thenReturn(Optional.of(orden));

        OrderStatusUpdateDto dto = new OrderStatusUpdateDto("PENDIENTE", null);

        assertThatThrownBy(() -> orderService.actualizarEstado(1L, dto, ID_COMPRADOR, AUTH_HEADER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Transición inválida");
    }

    @Test
    @DisplayName("misPedidos retorna lista correcta para comprador")
    void test_misPedidos_retornaListaComprador() {
        OrdenTransaccion orden1 = buildOrden(EstadoPedido.PENDIENTE, new BigDecimal("100"));
        OrdenTransaccion orden2 = buildOrden(EstadoPedido.COMPLETADO, new BigDecimal("200"));
        when(ordenRepository.findByIdCompradorAndDeletedAtIsNull(ID_COMPRADOR))
                .thenReturn(List.of(orden1, orden2));

        List<OrderResponse> pedidos = orderService.misPedidos(ID_COMPRADOR, "COMPRADOR");

        assertThat(pedidos).hasSize(2);
    }

    @Test
    @DisplayName("Cancelar orden exitosamente cuando estado es PENDIENTE")
    void test_cancelarOrden_exitoso_cuandoEstadoValido() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.PENDIENTE, new BigDecimal("100"));
        when(ordenRepository.findById(1L)).thenReturn(Optional.of(orden));
        when(ordenRepository.save(any())).thenReturn(orden);

        assertThatNoException()
                .isThrownBy(() -> orderService.cancelarOrden(1L, ID_COMPRADOR, "Ya no lo necesito", AUTH_HEADER));

        verify(ordenRepository).save(argThat(o -> o.getEstadoPedido() == EstadoPedido.CANCELADO));
    }

    @Test
    @DisplayName("Cancelar orden falla cuando ya está entregada")
    void test_cancelarOrden_falla_cuandoYaEntregado() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.ENTREGADO, new BigDecimal("100"));
        when(ordenRepository.findById(1L)).thenReturn(Optional.of(orden));

        assertThatThrownBy(() -> orderService.cancelarOrden(1L, ID_COMPRADOR, "motivo", AUTH_HEADER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No se puede cancelar");
    }

    @Test
    @DisplayName("obtenerOrden lanza excepción cuando no existe")
    void test_obtenerOrden_lanzaExcepcion_cuandoNoExiste() {
        when(ordenRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.obtenerOrden(999L))
                .isInstanceOf(OrderNotFoundException.class);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private OrdenTransaccion buildOrden(EstadoPedido estado, BigDecimal total) {
        ItemPedido item = ItemPedido.builder()
                .id(1L)
                .idProducto(10L)
                .tipoProducto("COSECHA_LOTE")
                .cantidad(new BigDecimal("5"))
                .precioUnitario(new BigDecimal("15.50"))
                .subtotal(new BigDecimal("77.50"))
                .nombreProducto("Jitomate Premium")
                .unidadVenta("kg")
                .build();

        OrdenTransaccion orden = OrdenTransaccion.builder()
                .id(1L)
                .numeroOrden("AGF-2026-000001")
                .idComprador(ID_COMPRADOR)
                .idVendedor(ID_VENDEDOR)
                .estadoPedido(estado)
                .totalMonto(total)
                .montoEscrow(BigDecimal.ZERO)
                .metodoPago("STRIPE")
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .items(List.of(item))
                .build();

        item.setOrden(orden);
        return orden;
    }
}
