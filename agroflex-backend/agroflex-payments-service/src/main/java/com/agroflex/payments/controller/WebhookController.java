package com.agroflex.payments.controller;

import com.agroflex.payments.webhook.StripeWebhookHandler;
import com.stripe.exception.SignatureVerificationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final StripeWebhookHandler webhookHandler;

    /**
     * POST /api/webhooks/stripe
     *
     * IMPORTANTE:
     * 1. Esta ruta es PÚBLICA — excluida de JWT en SecurityConfig
     * 2. El body debe ser String RAW para verificar la firma de Stripe
     * 3. SIEMPRE retorna 200 — si hay error interno, Stripe reintentará
     * 4. Si la firma es inválida, retornar 400 para que Stripe lo marque como fallo
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            webhookHandler.procesarEvento(payload, sigHeader);
            return ResponseEntity.ok("OK");

        } catch (SignatureVerificationException e) {
            log.warn("Webhook rechazado — firma inválida: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Firma inválida");

        } catch (Exception e) {
            // Errores internos — retornar 200 para que Stripe no reintente
            log.error("Error interno procesando webhook Stripe: {}", e.getMessage(), e);
            return ResponseEntity.ok("Error interno registrado");
        }
    }
}
