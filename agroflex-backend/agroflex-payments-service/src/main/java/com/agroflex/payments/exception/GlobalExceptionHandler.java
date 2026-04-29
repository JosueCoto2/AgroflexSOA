package com.agroflex.payments.exception;

import com.stripe.exception.SignatureVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(PaymentNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "AF-PAY-404", ex.getMessage());
    }

    @ExceptionHandler(PaymentAlreadyProcessedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyProcessed(PaymentAlreadyProcessedException ex) {
        return build(HttpStatus.CONFLICT, "AF-PAY-409", ex.getMessage());
    }

    @ExceptionHandler(StripeIntegrationException.class)
    public ResponseEntity<Map<String, Object>> handleStripe(StripeIntegrationException ex) {
        // Loguear detalle internamente, NO exponer al cliente
        log.error("Error de integración Stripe: {}", ex.getMessage());
        return build(HttpStatus.BAD_GATEWAY, "AF-PAY-502", "Error al comunicarse con el procesador de pago");
    }

    @ExceptionHandler(SignatureVerificationException.class)
    public ResponseEntity<Map<String, Object>> handleSignature(SignatureVerificationException ex) {
        log.warn("Firma de webhook inválida: {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "AF-PAY-400", "Firma del webhook inválida");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "AF-PAY-422", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "AF-PAY-400", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, "AF-PAY-400", mensaje);
    }

    @ExceptionHandler(feign.FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeign(feign.FeignException ex) {
        log.error("Error comunicando con servicio externo: {}", ex.getMessage());
        return build(HttpStatus.SERVICE_UNAVAILABLE, "AF-PAY-503", "Servicio externo no disponible");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("Error interno en payments-service: {}", ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "AF-PAY-500", "Error interno del servidor");
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String codigo, String mensaje) {
        return ResponseEntity.status(status).body(Map.of(
                "codigo", codigo,
                "mensaje", mensaje,
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
