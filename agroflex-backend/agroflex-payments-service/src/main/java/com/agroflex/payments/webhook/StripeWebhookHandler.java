package com.agroflex.payments.webhook;

import com.agroflex.payments.model.EstadoPago;
import com.agroflex.payments.model.Transaccion;
import com.agroflex.payments.repository.TransaccionRepository;
import com.agroflex.payments.service.EscrowService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookHandler {

    private final EscrowService escrowService;
    private final TransaccionRepository transaccionRepository;
    private final String stripeWebhookSecret;

    /**
     * Procesa un evento del webhook de Stripe.
     *
     * REGLA CRÍTICA: Siempre retornar sin excepción.
     * Los errores internos se loguean pero NO se propagan —
     * si hay error 5xx, Stripe reintentará el webhook durante 72 horas.
     *
     * @param payload   body crudo del request (String, no deserializado)
     * @param sigHeader valor del header "Stripe-Signature"
     * @throws SignatureVerificationException si la firma no es válida
     */
    public void procesarEvento(String payload, String sigHeader)
            throws SignatureVerificationException {

        // Verificar firma — SIEMPRE antes de procesar
        Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        log.info("Webhook Stripe recibido: {} — id: {}", event.getType(), event.getId());

        try {
            switch (event.getType()) {

                case "payment_intent.succeeded" -> procesarPagoExitoso(event);

                case "payment_intent.payment_failed" -> procesarPagoFallido(event);

                case "charge.dispute.created" -> procesarDisputa(event);

                case "refund.created" ->
                        log.info("Reembolso confirmado por Stripe — eventId: {}", event.getId());

                default ->
                        log.debug("Evento Stripe no manejado: {} — ignorando", event.getType());
            }
        } catch (Exception e) {
            // Errores internos: loguear y NO propagar (Stripe recibirá 200)
            log.error("Error procesando evento Stripe {} [{}]: {}",
                    event.getType(), event.getId(), e.getMessage(), e);
        }
    }

    // ─── Handlers de eventos ──────────────────────────────────────────────────

    private void procesarPagoExitoso(Event event) {
        extractPaymentIntent(event).ifPresent(pi -> {
            // Extraer charge ID del PaymentIntent si está disponible
            String chargeId = pi.getLatestCharge();
            log.info("Pago exitoso — PI: {}, ChargeId: {}", pi.getId(), chargeId);

            // Confirmar el pago en nuestro sistema
            // El authToken "Bearer internal" permite que orders-service procese la actualización
            escrowService.confirmarPagoRecibido(pi.getId(), chargeId, event.getId(), "Bearer internal");
        });
    }

    private void procesarPagoFallido(Event event) {
        extractPaymentIntent(event).ifPresent(pi -> {
            log.warn("Pago fallido — PI: {}", pi.getId());

            transaccionRepository.findByStripePaymentIntentId(pi.getId()).ifPresent(t -> {
                t.setEstadoPago(EstadoPago.FALLIDO);
                transaccionRepository.save(t);
                log.info("Transacción marcada como FALLIDA para orden {}", t.getIdOrden());
            });
        });
    }

    private void procesarDisputa(Event event) {
        extractCharge(event).ifPresent(charge -> {
            log.warn("Disputa abierta para charge: {} — requiere revisión del admin", charge.getId());

            transaccionRepository.findByStripeChargeId(charge.getId()).ifPresent(t -> {
                t.setEstadoPago(EstadoPago.DISPUTADO);
                transaccionRepository.save(t);
                log.warn("Transacción marcada como DISPUTADA para orden {} — REQUIERE ATENCIÓN MANUAL",
                        t.getIdOrden());
            });
        });
    }

    // ─── Helpers de deserialización ───────────────────────────────────────────

    private Optional<PaymentIntent> extractPaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isPresent()) {
            StripeObject obj = deserializer.getObject().get();
            if (obj instanceof PaymentIntent pi) {
                return Optional.of(pi);
            }
        }
        log.warn("No se pudo deserializar PaymentIntent del evento {}", event.getId());
        return Optional.empty();
    }

    private Optional<Charge> extractCharge(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isPresent()) {
            StripeObject obj = deserializer.getObject().get();
            if (obj instanceof Charge charge) {
                return Optional.of(charge);
            }
        }
        log.warn("No se pudo deserializar Charge del evento {}", event.getId());
        return Optional.empty();
    }
}
