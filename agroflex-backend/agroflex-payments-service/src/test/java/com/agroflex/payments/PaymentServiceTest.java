package com.agroflex.payments;

import com.agroflex.payments.dto.CreatePaymentIntentRequest;
import com.agroflex.payments.dto.PaymentIntentResponse;
import com.agroflex.payments.service.EscrowService;
import com.agroflex.payments.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private EscrowService escrowService;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    @DisplayName("crearIntent delega en EscrowService y retorna respuesta")
    void test_crearIntent_delegaEnEscrowService() {
        CreatePaymentIntentRequest request = CreatePaymentIntentRequest.builder()
                .idOrden(1L)
                .numeroOrden("AGF-2026-000001")
                .monto(new BigDecimal("100.00"))
                .moneda("MXN")
                .idComprador(10L)
                .idVendedor(20L)
                .build();

        PaymentIntentResponse expected = new PaymentIntentResponse(
                "PENDIENTE", "pi_test123", "pi_test123_secret");
        when(escrowService.retenerPago(any())).thenReturn(expected);

        PaymentIntentResponse result = paymentService.crearIntent(request);

        assertThat(result).isNotNull();
        assertThat(result.paymentIntentId()).isEqualTo("pi_test123");
        assertThat(result.estado()).isEqualTo("PENDIENTE");
        verify(escrowService).retenerPago(request);
    }

    @Test
    @DisplayName("crearIntent propaga excepción cuando EscrowService falla")
    void test_crearIntent_propagaExcepcion_cuandoEscrowFalla() {
        when(escrowService.retenerPago(any()))
                .thenThrow(new RuntimeException("Stripe no disponible"));

        CreatePaymentIntentRequest request = CreatePaymentIntentRequest.builder()
                .idOrden(1L).monto(new BigDecimal("100.00"))
                .idComprador(1L).idVendedor(2L).build();

        assertThatThrownBy(() -> paymentService.crearIntent(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Stripe no disponible");
    }
}
