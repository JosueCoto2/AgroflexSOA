package com.agroflex.payments.controller;

import com.agroflex.payments.dto.CreatePaymentIntentRequest;
import com.agroflex.payments.dto.EscrowStatusDto;
import com.agroflex.payments.dto.PaymentIntentResponse;
import com.agroflex.payments.service.EscrowService;
import com.agroflex.payments.service.PaymentService;
import com.agroflex.payments.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final EscrowService escrowService;
    private final RefundService refundService;

    /**
     * POST /api/payments/create-intent
     * Llamado por orders-service al crear una orden.
     * Crea PaymentIntent en Stripe y retorna clientSecret al frontend.
     */
    @PostMapping("/create-intent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentIntentResponse> crearIntent(
            @Valid @RequestBody CreatePaymentIntentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        PaymentIntentResponse response = paymentService.crearIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/payments/release/{orderId}
     * Llamado por orders-service cuando la entrega es confirmada por QR.
     * Libera el escrow al vendedor.
     */
    @PostMapping("/release/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> liberarPago(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {

        escrowService.liberarEscrow(orderId, authHeader);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/payments/refund/{orderId}
     * Llamado por orders-service para reembolsar al comprador.
     * Body: { "motivo": "..." }
     */
    @PostMapping("/refund/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> reembolsar(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {

        String motivo = body.getOrDefault("motivo", "Reembolso solicitado");
        refundService.procesarReembolso(orderId, motivo, authHeader);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/payments/escrow-status/{orderId}
     * Consultar el estado del escrow de una orden.
     */
    @GetMapping("/escrow-status/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EscrowStatusDto> estadoEscrow(@PathVariable Long orderId) {
        return ResponseEntity.ok(escrowService.obtenerEstadoEscrow(orderId));
    }
}
