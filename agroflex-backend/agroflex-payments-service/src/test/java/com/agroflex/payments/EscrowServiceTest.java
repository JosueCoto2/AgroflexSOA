package com.agroflex.payments;

import com.agroflex.payments.client.OrderServiceClient;
import com.agroflex.payments.dto.CreatePaymentIntentRequest;
import com.agroflex.payments.dto.PaymentIntentResponse;
import com.agroflex.payments.exception.PaymentAlreadyProcessedException;
import com.agroflex.payments.exception.PaymentNotFoundException;
import com.agroflex.payments.model.EstadoPago;
import com.agroflex.payments.model.MetodoPago;
import com.agroflex.payments.model.Transaccion;
import com.agroflex.payments.repository.TransaccionRepository;
import com.agroflex.payments.service.EscrowService;
import com.agroflex.payments.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EscrowServiceTest {

    @Mock private TransaccionRepository transaccionRepository;
    @Mock private StripeService stripeService;
    @Mock private OrderServiceClient orderServiceClient;

    @InjectMocks
    private EscrowService escrowService;

    private static final Long ID_ORDEN = 10L;
    private static final Long ID_COMPRADOR = 1L;
    private static final Long ID_VENDEDOR = 2L;
    private static final String AUTH = "Bearer test";

    private CreatePaymentIntentRequest buildRequest() {
        return CreatePaymentIntentRequest.builder()
                .idOrden(ID_ORDEN)
                .numeroOrden("AGF-2026-000010")
                .monto(new BigDecimal("200.00"))
                .moneda("MXN")
                .idComprador(ID_COMPRADOR)
                .idVendedor(ID_VENDEDOR)
                .build();
    }

    private Transaccion buildTransaccion(EstadoPago estado) {
        return Transaccion.builder()
                .id(1L)
                .idOrden(ID_ORDEN)
                .idComprador(ID_COMPRADOR)
                .idVendedor(ID_VENDEDOR)
                .monto(new BigDecimal("200.00"))
                .montoComision(new BigDecimal("7.00"))
                .montoVendedor(new BigDecimal("193.00"))
                .moneda("MXN")
                .metodoPago(MetodoPago.STRIPE)
                .estadoPago(estado)
                .stripePaymentIntentId("pi_test123")
                .stripeClientSecret("pi_test123_secret")
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .movimientos(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("retenerPago crea transacción y retorna PaymentIntentResponse")
    void test_retenerPago_exitoso_cuandoDatosValidos() {
        when(transaccionRepository.existsByIdOrden(ID_ORDEN)).thenReturn(false);

        PaymentIntent mockPi = mock(PaymentIntent.class);
        when(mockPi.getId()).thenReturn("pi_test123");
        when(mockPi.getClientSecret()).thenReturn("pi_test123_secret");
        when(stripeService.crearPaymentIntent(any(), eq("MXN"), eq(ID_ORDEN))).thenReturn(mockPi);
        when(stripeService.calcularComision(any())).thenReturn(new BigDecimal("7.00"));
        when(stripeService.calcularMontoVendedor(any())).thenReturn(new BigDecimal("193.00"));
        when(transaccionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PaymentIntentResponse response = escrowService.retenerPago(buildRequest());

        assertThat(response).isNotNull();
        assertThat(response.estado()).isEqualTo("PENDIENTE");
        assertThat(response.paymentIntentId()).isEqualTo("pi_test123");
        assertThat(response.clientSecret()).isEqualTo("pi_test123_secret");
        verify(transaccionRepository).save(any(Transaccion.class));
    }

    @Test
    @DisplayName("retenerPago falla cuando ya existe pago para esa orden")
    void test_retenerPago_falla_cuandoOrdenYaTienePago() {
        when(transaccionRepository.existsByIdOrden(ID_ORDEN)).thenReturn(true);

        assertThatThrownBy(() -> escrowService.retenerPago(buildRequest()))
                .isInstanceOf(PaymentAlreadyProcessedException.class)
                .hasMessageContaining(ID_ORDEN.toString());
    }

    @Test
    @DisplayName("confirmarPagoRecibido actualiza estado a PAGADO")
    void test_confirmarPago_exitoso_cuandoWebhookValido() {
        Transaccion transaccion = buildTransaccion(EstadoPago.PENDIENTE);
        when(transaccionRepository.findByStripePaymentIntentId("pi_test123"))
                .thenReturn(Optional.of(transaccion));
        when(transaccionRepository.save(any())).thenReturn(transaccion);
        doNothing().when(orderServiceClient).actualizarEstadoOrden(any(), any(), any());

        escrowService.confirmarPagoRecibido("pi_test123", "ch_test", "evt_test", AUTH);

        verify(transaccionRepository).save(argThat(t -> t.getEstadoPago() == EstadoPago.PAGADO));
    }

    @Test
    @DisplayName("liberarEscrow exitoso cuando estado es PAGADO")
    void test_liberarEscrow_exitoso_cuandoPagado() {
        Transaccion transaccion = buildTransaccion(EstadoPago.PAGADO);
        when(transaccionRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(transaccion));
        when(stripeService.registrarTransferenciaVendedor(any(), any())).thenReturn("TRANSFER-REF-1");
        when(transaccionRepository.save(any())).thenReturn(transaccion);
        doNothing().when(orderServiceClient).actualizarEstadoOrden(any(), any(), any());

        assertThatNoException().isThrownBy(() -> escrowService.liberarEscrow(ID_ORDEN, AUTH));
        verify(transaccionRepository).save(argThat(t -> t.getEstadoPago() == EstadoPago.LIBERADO));
    }

    @Test
    @DisplayName("liberarEscrow falla cuando estado no es PAGADO")
    void test_liberarEscrow_falla_cuandoNoEstaPagado() {
        Transaccion transaccion = buildTransaccion(EstadoPago.PENDIENTE);
        when(transaccionRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(transaccion));

        assertThatThrownBy(() -> escrowService.liberarEscrow(ID_ORDEN, AUTH))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PAGADO");
    }

    @Test
    @DisplayName("procesarReembolso exitoso cuando estado es PAGADO")
    void test_procesarReembolso_exitoso() {
        Transaccion transaccion = buildTransaccion(EstadoPago.PAGADO);
        when(transaccionRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(transaccion));
        when(stripeService.reembolsar(any(), any(), any())).thenReturn("re_test123");
        when(transaccionRepository.save(any())).thenReturn(transaccion);
        doNothing().when(orderServiceClient).actualizarEstadoOrden(any(), any(), any());

        assertThatNoException().isThrownBy(() ->
                escrowService.procesarReembolso(ID_ORDEN, "Producto no disponible", AUTH));

        verify(transaccionRepository).save(argThat(t -> t.getEstadoPago() == EstadoPago.REEMBOLSADO));
    }

    @Test
    @DisplayName("procesarReembolso falla cuando ya fue liberado")
    void test_procesarReembolso_falla_cuandoYaLiberado() {
        Transaccion transaccion = buildTransaccion(EstadoPago.LIBERADO);
        when(transaccionRepository.findByIdOrden(ID_ORDEN)).thenReturn(Optional.of(transaccion));

        assertThatThrownBy(() ->
                escrowService.procesarReembolso(ID_ORDEN, "motivo", AUTH))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ya fue liberado");
    }

    @Test
    @DisplayName("obtenerEstadoEscrow lanza excepción cuando no existe")
    void test_obtenerEstadoEscrow_lanzaExcepcion_cuandoNoExiste() {
        when(transaccionRepository.findByIdOrden(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> escrowService.obtenerEstadoEscrow(999L))
                .isInstanceOf(PaymentNotFoundException.class);
    }
}
