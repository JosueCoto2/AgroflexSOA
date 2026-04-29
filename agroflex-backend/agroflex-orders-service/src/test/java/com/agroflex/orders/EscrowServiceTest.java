package com.agroflex.orders;

import com.agroflex.orders.client.PaymentServiceClient;
import com.agroflex.orders.dto.PaymentIntentResponse;
import com.agroflex.orders.exception.OrderNotFoundException;
import com.agroflex.orders.model.Escrow;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.model.OrdenTransaccion;
import com.agroflex.orders.repository.EscrowRepository;
import com.agroflex.orders.repository.OrdenTransaccionRepository;
import com.agroflex.orders.service.EscrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EscrowServiceTest {

    @Mock
    private OrdenTransaccionRepository ordenRepository;

    @Mock
    private EscrowRepository escrowRepository;

    @Mock
    private PaymentServiceClient paymentServiceClient;

    @InjectMocks
    private EscrowService escrowService;

    private static final Long ID_ORDEN = 1L;
    private static final String AUTH_HEADER = "Bearer test-token";

    private OrdenTransaccion buildOrden(EstadoPedido estado) {
        return OrdenTransaccion.builder()
                .id(ID_ORDEN)
                .numeroOrden("AGF-2026-000001")
                .idComprador(1L)
                .idVendedor(2L)
                .estadoPedido(estado)
                .totalMonto(new BigDecimal("200.00"))
                .montoEscrow(BigDecimal.ZERO)
                .metodoPago("STRIPE")
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("retenerPago registra escrow y llama al payment service")
    void test_retenerPago_exitoso_cuandoPagoAprobado() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.PENDIENTE);
        PaymentIntentResponse paymentResponse = new PaymentIntentResponse("SUCCEEDED", "pi_test123", "secret");

        when(paymentServiceClient.createPaymentIntent(any(), eq(AUTH_HEADER)))
                .thenReturn(paymentResponse);
        when(ordenRepository.save(any())).thenReturn(orden);
        when(escrowRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String paymentIntentId = escrowService.retenerPago(orden, AUTH_HEADER);

        assertThat(paymentIntentId).isEqualTo("pi_test123");
        verify(escrowRepository).save(argThat(e -> e.getEstado().equals("RETENIDO")));
    }

    @Test
    @DisplayName("liberarPago exitoso cuando orden está en estado ENTREGADO")
    void test_liberarPago_exitoso_cuandoQRValidado() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.ENTREGADO);
        Escrow escrow = Escrow.builder()
                .id(1L)
                .idOrden(ID_ORDEN)
                .monto(new BigDecimal("200.00"))
                .estado("RETENIDO")
                .fechaRetencion(LocalDateTime.now())
                .build();

        when(ordenRepository.findById(ID_ORDEN)).thenReturn(Optional.of(orden));
        when(ordenRepository.save(any())).thenReturn(orden);
        when(escrowRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(escrow));
        when(escrowRepository.save(any())).thenReturn(escrow);
        doNothing().when(paymentServiceClient).releasePayment(eq(ID_ORDEN), eq(AUTH_HEADER));

        assertThatNoException().isThrownBy(() ->
                escrowService.liberarPago(ID_ORDEN, AUTH_HEADER));

        verify(ordenRepository).save(argThat(o -> o.getEstadoPedido() == EstadoPedido.COMPLETADO));
        verify(escrowRepository).save(argThat(e -> "LIBERADO".equals(e.getEstado())));
    }

    @Test
    @DisplayName("liberarPago falla cuando la orden no está en ENTREGADO")
    void test_liberarPago_falla_cuandoNoEstaEntregado() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.CONFIRMADO);
        when(ordenRepository.findById(ID_ORDEN)).thenReturn(Optional.of(orden));

        assertThatThrownBy(() -> escrowService.liberarPago(ID_ORDEN, AUTH_HEADER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ENTREGADO");
    }

    @Test
    @DisplayName("reembolsarPago exitoso cuando estado es CONFIRMADO")
    void test_reembolsar_exitoso_cuandoEstadoValido() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.CONFIRMADO);
        Escrow escrow = Escrow.builder()
                .id(1L)
                .idOrden(ID_ORDEN)
                .monto(new BigDecimal("200.00"))
                .estado("RETENIDO")
                .fechaRetencion(LocalDateTime.now())
                .build();

        when(ordenRepository.findById(ID_ORDEN)).thenReturn(Optional.of(orden));
        when(ordenRepository.save(any())).thenReturn(orden);
        when(escrowRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(escrow));
        when(escrowRepository.save(any())).thenReturn(escrow);
        doNothing().when(paymentServiceClient).refundPayment(eq(ID_ORDEN), any(), eq(AUTH_HEADER));

        assertThatNoException().isThrownBy(() ->
                escrowService.reembolsarPago(ID_ORDEN, "Producto no disponible", AUTH_HEADER));

        verify(ordenRepository).save(argThat(o -> o.getEstadoPedido() == EstadoPedido.REEMBOLSADO));
    }

    @Test
    @DisplayName("reembolsarPago falla cuando estado es COMPLETADO")
    void test_reembolsar_falla_cuandoYaCompletado() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.COMPLETADO);
        when(ordenRepository.findById(ID_ORDEN)).thenReturn(Optional.of(orden));

        assertThatThrownBy(() ->
                escrowService.reembolsarPago(ID_ORDEN, "motivo", AUTH_HEADER))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CONFIRMADO o EN_TRANSITO");
    }

    @Test
    @DisplayName("retenerPago continúa aunque payments-service no esté disponible")
    void test_retenerPago_continua_cuandoPaymentsNoDisponible() {
        OrdenTransaccion orden = buildOrden(EstadoPedido.PENDIENTE);

        when(paymentServiceClient.createPaymentIntent(any(), eq(AUTH_HEADER)))
                .thenThrow(new RuntimeException("Payments service down"));
        when(escrowRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // No debe lanzar excepción — el flujo continúa
        assertThatNoException().isThrownBy(() ->
                escrowService.retenerPago(orden, AUTH_HEADER));

        // El escrow sí debe registrarse
        verify(escrowRepository).save(any(Escrow.class));
    }
}
