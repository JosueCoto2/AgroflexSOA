package com.agroflex.orders.client;

import com.agroflex.orders.dto.CreatePaymentIntentRequest;
import com.agroflex.orders.dto.PaymentIntentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(
        name = "agroflex-payments-service",
        url = "${services.payments.url:}",
        fallback = PaymentServiceClient.PaymentServiceClientFallback.class
)
public interface PaymentServiceClient {

    @PostMapping("/api/payments/create-intent")
    PaymentIntentResponse createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request,
            @RequestHeader("Authorization") String token);

    @PostMapping("/api/payments/release/{orderId}")
    void releasePayment(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token);

    @PostMapping("/api/payments/refund/{orderId}")
    void refundPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> motivo,
            @RequestHeader("Authorization") String token);

    /**
     * Fallback — payments-service aún no existe.
     * El flujo de órdenes NO debe romperse por esto.
     */
    @Component
    @Slf4j
    class PaymentServiceClientFallback implements PaymentServiceClient {

        @Override
        public PaymentIntentResponse createPaymentIntent(
                CreatePaymentIntentRequest request, String token) {
            log.warn("Payments service no disponible — orden {} creada sin PaymentIntent",
                    request.getNumeroOrden());
            return new PaymentIntentResponse("PENDING", null, null);
        }

        @Override
        public void releasePayment(Long orderId, String token) {
            log.warn("No se pudo liberar pago de orden {} — payments service no disponible", orderId);
        }

        @Override
        public void refundPayment(Long orderId, Map<String, String> motivo, String token) {
            log.warn("No se pudo reembolsar orden {} — payments service no disponible", orderId);
        }
    }
}
