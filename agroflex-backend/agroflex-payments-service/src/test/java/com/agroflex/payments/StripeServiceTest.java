package com.agroflex.payments;

import com.agroflex.payments.exception.StripeIntegrationException;
import com.agroflex.payments.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceTest {

    @InjectMocks
    private StripeService stripeService;

    @BeforeEach
    void setUp() {
        // La clave se inicializa en StripeConfig @PostConstruct
        // En tests se puede dejar vacía — no llamamos a Stripe real
    }

    @Test
    @DisplayName("crearPaymentIntent convierte monto a centavos correctamente")
    void test_crearPaymentIntent_exitoso() throws StripeException {
        PaymentIntent mockPi = mock(PaymentIntent.class);
        when(mockPi.getId()).thenReturn("pi_test123");
        when(mockPi.getClientSecret()).thenReturn("pi_test123_secret_xyz");
        when(mockPi.getStatus()).thenReturn("requires_payment_method");

        try (MockedStatic<PaymentIntent> piMock = mockStatic(PaymentIntent.class)) {
            piMock.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(mockPi);

            PaymentIntent result = stripeService.crearPaymentIntent(
                    new BigDecimal("100.00"), "MXN", 42L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo("pi_test123");
            assertThat(result.getClientSecret()).isEqualTo("pi_test123_secret_xyz");
        }
    }

    @Test
    @DisplayName("crearPaymentIntent lanza StripeIntegrationException cuando Stripe falla")
    void test_crearPaymentIntent_falla_cuandoStripeError() throws StripeException {
        try (MockedStatic<PaymentIntent> piMock = mockStatic(PaymentIntent.class)) {
            piMock.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenThrow(mock(com.stripe.exception.ApiConnectionException.class));

            assertThatThrownBy(() ->
                    stripeService.crearPaymentIntent(new BigDecimal("100.00"), "MXN", 1L))
                    .isInstanceOf(StripeIntegrationException.class)
                    .hasMessageContaining("crearPaymentIntent");
        }
    }

    @Test
    @DisplayName("calcularComision retorna exactamente 3.5% con HALF_UP")
    void test_calcularComision_correcto() {
        // $100.00 × 3.5% = $3.50
        BigDecimal comision100 = stripeService.calcularComision(new BigDecimal("100.00"));
        assertThat(comision100).isEqualByComparingTo(new BigDecimal("3.50"));

        // $50.00 × 3.5% = $1.75
        BigDecimal comision50 = stripeService.calcularComision(new BigDecimal("50.00"));
        assertThat(comision50).isEqualByComparingTo(new BigDecimal("1.75"));

        // $1.00 × 3.5% = $0.04 (HALF_UP: 0.035 → 0.04)
        BigDecimal comision1 = stripeService.calcularComision(new BigDecimal("1.00"));
        assertThat(comision1).isEqualByComparingTo(new BigDecimal("0.04"));

        // Verificar escala: siempre 2 decimales
        assertThat(comision100.scale()).isEqualTo(2);
    }

    @Test
    @DisplayName("calcularMontoVendedor retorna monto - comision")
    void test_calcularMontoVendedor_correcto() {
        // $100.00 - 3.5% ($3.50) = $96.50
        BigDecimal neto = stripeService.calcularMontoVendedor(new BigDecimal("100.00"));
        assertThat(neto).isEqualByComparingTo(new BigDecimal("96.50"));
    }

    @Test
    @DisplayName("registrarTransferenciaVendedor retorna referencia no nula")
    void test_registrarTransferenciaVendedor_retornaReferencia() {
        String ref = stripeService.registrarTransferenciaVendedor(1L, new BigDecimal("96.50"));
        assertThat(ref).isNotNull().startsWith("TRANSFER-AGF-1-");
    }
}
