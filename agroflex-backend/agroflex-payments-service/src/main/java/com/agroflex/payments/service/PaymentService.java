package com.agroflex.payments.service;

import com.agroflex.payments.dto.CreatePaymentIntentRequest;
import com.agroflex.payments.dto.PaymentIntentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de orquestación de pagos.
 * Punto de entrada principal para el flujo de pago.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final EscrowService escrowService;

    @Transactional
    public PaymentIntentResponse crearIntent(CreatePaymentIntentRequest request) {
        log.info("Creando PaymentIntent para orden {}: ${} {}",
                request.getIdOrden(), request.getMonto(),
                request.getMoneda() != null ? request.getMoneda() : "MXN");
        return escrowService.retenerPago(request);
    }
}
