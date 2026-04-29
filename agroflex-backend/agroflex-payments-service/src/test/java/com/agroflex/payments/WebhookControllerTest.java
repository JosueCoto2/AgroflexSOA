package com.agroflex.payments;

import com.agroflex.payments.controller.WebhookController;
import com.agroflex.payments.exception.GlobalExceptionHandler;
import com.agroflex.payments.webhook.StripeWebhookHandler;
import com.stripe.exception.SignatureVerificationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class WebhookControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StripeWebhookHandler webhookHandler;

    @InjectMocks
    private WebhookController webhookController;

    private static final String PAYLOAD = "{\"type\":\"payment_intent.succeeded\",\"id\":\"evt_test\"}";
    private static final String SIG_HEADER = "t=1234567890,v1=test_signature";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(webhookController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Webhook retorna 200 cuando firma es válida y proceso exitoso")
    void test_webhook_retorna200_cuandoFirmaValida() throws Exception {
        doNothing().when(webhookHandler).procesarEvento(eq(PAYLOAD), eq(SIG_HEADER));

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PAYLOAD)
                        .header("Stripe-Signature", SIG_HEADER))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test
    @DisplayName("Webhook retorna 400 cuando firma de Stripe es inválida")
    void test_webhook_retorna400_cuandoFirmaInvalida() throws Exception {
        doThrow(new SignatureVerificationException("Firma inválida", SIG_HEADER))
                .when(webhookHandler).procesarEvento(any(), any());

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PAYLOAD)
                        .header("Stripe-Signature", "firma_invalida"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Firma inválida"));
    }

    @Test
    @DisplayName("Webhook retorna 200 incluso cuando proceso interno falla")
    void test_webhook_retorna200_incluso_cuandoProcesoInternoFalla() throws Exception {
        // Si el proceso interno falla (no SignatureVerificationException),
        // debe retornar 200 para que Stripe no reintente
        doThrow(new RuntimeException("Error interno de BD"))
                .when(webhookHandler).procesarEvento(any(), any());

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PAYLOAD)
                        .header("Stripe-Signature", SIG_HEADER))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Webhook retorna 200 para evento payment_intent.payment_failed")
    void test_webhook_retorna200_cuandoPagoFallido() throws Exception {
        String payloadFallido = "{\"type\":\"payment_intent.payment_failed\",\"id\":\"evt_fail\"}";
        doNothing().when(webhookHandler).procesarEvento(eq(payloadFallido), eq(SIG_HEADER));

        mockMvc.perform(post("/api/webhooks/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadFallido)
                        .header("Stripe-Signature", SIG_HEADER))
                .andExpect(status().isOk());
    }
}
