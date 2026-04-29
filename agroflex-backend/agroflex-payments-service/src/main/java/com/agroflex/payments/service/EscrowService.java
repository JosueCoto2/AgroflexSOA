package com.agroflex.payments.service;

import com.agroflex.payments.client.OrderServiceClient;
import com.agroflex.payments.dto.CreatePaymentIntentRequest;
import com.agroflex.payments.dto.EscrowStatusDto;
import com.agroflex.payments.dto.OrderStatusUpdateDto;
import com.agroflex.payments.dto.PaymentIntentResponse;
import com.agroflex.payments.exception.PaymentNotFoundException;
import com.agroflex.payments.model.*;
import com.agroflex.payments.repository.TransaccionRepository;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowService {

    private final TransaccionRepository transaccionRepository;
    private final StripeService stripeService;
    private final OrderServiceClient orderServiceClient;

    /**
     * Crea un PaymentIntent en Stripe y retiene el pago en escrow.
     * Idempotente: si ya existe un PaymentIntent para esta orden, devuelve el clientSecret existente.
     * Llamado por orders-service al crear la orden, y por el frontend al elegir método de pago.
     */
    @Transactional
    public PaymentIntentResponse retenerPago(CreatePaymentIntentRequest request) {
        // Idempotencia: si ya existe transacción para esta orden, devolver el clientSecret existente
        return transaccionRepository.findByIdOrden(request.getIdOrden())
                .map(existing -> {
                    log.info("Orden {} ya tiene PaymentIntent, devolviendo clientSecret existente",
                            request.getIdOrden());
                    return new PaymentIntentResponse(
                            existing.getEstadoPago().name(),
                            existing.getStripePaymentIntentId(),
                            existing.getStripeClientSecret()
                    );
                })
                .orElseGet(() -> crearNuevoEscrow(request));
    }

    private PaymentIntentResponse crearNuevoEscrow(CreatePaymentIntentRequest request) {

        String moneda = request.getMoneda() != null ? request.getMoneda() : "MXN";

        // Crear PaymentIntent en Stripe
        PaymentIntent paymentIntent = stripeService.crearPaymentIntent(
                request.getMonto(), moneda, request.getIdOrden());

        // Calcular comisión y monto neto
        BigDecimal comision = stripeService.calcularComision(request.getMonto());
        BigDecimal montoVendedor = stripeService.calcularMontoVendedor(request.getMonto());

        // Guardar transacción — NUNCA loguear clientSecret
        Transaccion transaccion = Transaccion.builder()
                .idOrden(request.getIdOrden())
                .idComprador(request.getIdComprador())
                .idVendedor(request.getIdVendedor())
                .monto(request.getMonto())
                .montoComision(comision)
                .montoVendedor(montoVendedor)
                .moneda(moneda)
                .metodoPago(MetodoPago.STRIPE)
                .estadoPago(EstadoPago.PENDIENTE)
                .stripePaymentIntentId(paymentIntent.getId())
                .stripeClientSecret(paymentIntent.getClientSecret())
                .build();

        transaccionRepository.save(transaccion);

        // Registrar movimiento inicial
        agregarMovimiento(transaccion, TipoMovimiento.RETENCION,
                request.getMonto(), "PaymentIntent creado, esperando confirmación del comprador", null);

        log.info("Escrow iniciado para orden {}: ${} MXN (comisión: ${})",
                request.getIdOrden(), request.getMonto(), comision);

        return new PaymentIntentResponse(
                "PENDIENTE",
                paymentIntent.getId(),
                paymentIntent.getClientSecret()
        );
    }

    /**
     * Confirma que el pago fue recibido (llamado por el webhook de Stripe).
     * Actualiza el estado de la transacción a PAGADO.
     */
    @Transactional
    public void confirmarPagoRecibido(String stripePaymentIntentId, String stripeChargeId,
                                      String stripeEventId, String authToken) {
        Transaccion transaccion = transaccionRepository
                .findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "stripe_payment_intent_id", stripePaymentIntentId));

        if (transaccion.getEstadoPago() == EstadoPago.PAGADO) {
            log.info("Pago ya confirmado para PI {}, ignorando evento duplicado", stripePaymentIntentId);
            return;
        }

        transaccion.setEstadoPago(EstadoPago.PAGADO);
        transaccion.setFechaPago(LocalDateTime.now());
        if (stripeChargeId != null) {
            transaccion.setStripeChargeId(stripeChargeId);
        }
        transaccionRepository.save(transaccion);

        agregarMovimiento(transaccion, TipoMovimiento.RETENCION,
                transaccion.getMonto(), "Pago confirmado por Stripe", stripeEventId);

        log.info("Pago confirmado para orden {}: ${} MXN",
                transaccion.getIdOrden(), transaccion.getMonto());

        // Notificar al orders-service para cambiar estado a CONFIRMADO
        try {
            orderServiceClient.actualizarEstadoOrden(
                    transaccion.getIdOrden(),
                    new OrderStatusUpdateDto("CONFIRMADO", "Pago confirmado por Stripe"),
                    authToken != null ? authToken : "Bearer internal"
            );
        } catch (Exception e) {
            log.warn("No se pudo actualizar orden {} a CONFIRMADO — orders-service: {}",
                    transaccion.getIdOrden(), e.getMessage());
        }
    }

    /**
     * Libera el escrow al vendedor cuando la entrega es confirmada por QR.
     * Llamado por orders-service vía POST /api/payments/release/{orderId}.
     */
    @Transactional
    public void liberarEscrow(Long idOrden, String authToken) {
        Transaccion transaccion = transaccionRepository.findByIdOrden(idOrden)
                .orElseThrow(() -> new PaymentNotFoundException(idOrden));

        if (transaccion.getEstadoPago() != EstadoPago.PAGADO) {
            throw new IllegalStateException(
                    "Solo se puede liberar el escrow de una transacción en estado PAGADO. " +
                    "Estado actual: " + transaccion.getEstadoPago());
        }

        // MVP: registrar transferencia (Stripe Connect en v2)
        String transferRef = stripeService.registrarTransferenciaVendedor(
                idOrden, transaccion.getMontoVendedor());
        transaccion.setStripeTransferId(transferRef);
        transaccion.setEstadoPago(EstadoPago.LIBERADO);
        transaccion.setFechaLiberacion(LocalDateTime.now());
        transaccionRepository.save(transaccion);

        // Registrar movimientos de liberación y comisión
        agregarMovimiento(transaccion, TipoMovimiento.LIBERACION,
                transaccion.getMontoVendedor(),
                "Escrow liberado al vendedor — ref: " + transferRef, null);
        agregarMovimiento(transaccion, TipoMovimiento.COMISION,
                transaccion.getMontoComision(),
                "Comisión AgroFlex 3.5%", null);

        log.info("Escrow liberado para orden {}: ${} MXN al vendedor, ${} comisión AgroFlex",
                idOrden, transaccion.getMontoVendedor(), transaccion.getMontoComision());

        // Notificar al orders-service para cambiar a COMPLETADO
        try {
            orderServiceClient.actualizarEstadoOrden(
                    idOrden,
                    new OrderStatusUpdateDto("COMPLETADO", "Pago liberado al vendedor"),
                    authToken != null ? authToken : "Bearer internal"
            );
        } catch (Exception e) {
            log.warn("No se pudo actualizar orden {} a COMPLETADO: {}", idOrden, e.getMessage());
        }
    }

    /**
     * Procesa un reembolso al comprador.
     * Llamado por orders-service vía POST /api/payments/refund/{orderId}.
     */
    @Transactional
    public void procesarReembolso(Long idOrden, String motivo, String authToken) {
        Transaccion transaccion = transaccionRepository.findByIdOrden(idOrden)
                .orElseThrow(() -> new PaymentNotFoundException(idOrden));

        if (transaccion.getEstadoPago() == EstadoPago.LIBERADO) {
            throw new IllegalStateException(
                    "No se puede reembolsar un pago que ya fue liberado al vendedor");
        }
        if (transaccion.getEstadoPago() != EstadoPago.PAGADO) {
            throw new IllegalStateException(
                    "Solo se puede reembolsar una transacción en estado PAGADO. " +
                    "Estado actual: " + transaccion.getEstadoPago());
        }

        // Procesar reembolso en Stripe
        String refundId = stripeService.reembolsar(
                transaccion.getStripePaymentIntentId(),
                transaccion.getMonto(),
                motivo);

        transaccion.setEstadoPago(EstadoPago.REEMBOLSADO);
        transaccionRepository.save(transaccion);

        agregarMovimiento(transaccion, TipoMovimiento.REEMBOLSO,
                transaccion.getMonto(),
                "Reembolso procesado. Motivo: " + motivo + " — ref: " + refundId, null);

        log.info("Reembolso procesado para orden {}: ${} MXN — refundId: {}",
                idOrden, transaccion.getMonto(), refundId);

        // Notificar al orders-service para cambiar a REEMBOLSADO
        try {
            orderServiceClient.actualizarEstadoOrden(
                    idOrden,
                    new OrderStatusUpdateDto("REEMBOLSADO", motivo),
                    authToken != null ? authToken : "Bearer internal"
            );
        } catch (Exception e) {
            log.warn("No se pudo actualizar orden {} a REEMBOLSADO: {}", idOrden, e.getMessage());
        }
    }

    /**
     * Consulta el estado del escrow para una orden.
     */
    @Transactional(readOnly = true)
    public EscrowStatusDto obtenerEstadoEscrow(Long idOrden) {
        Transaccion t = transaccionRepository.findByIdOrden(idOrden)
                .orElseThrow(() -> new PaymentNotFoundException(idOrden));

        return new EscrowStatusDto(
                t.getIdOrden(),
                t.getEstadoPago().name(),
                t.getMonto(),
                t.getMontoComision(),
                t.getMontoVendedor(),
                t.getStripePaymentIntentId(),
                t.getFechaPago(),
                t.getFechaLiberacion()
        );
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private void agregarMovimiento(Transaccion transaccion, TipoMovimiento tipo,
                                    BigDecimal monto, String descripcion, String stripeEventId) {
        MovimientoEscrow movimiento = MovimientoEscrow.builder()
                .transaccion(transaccion)
                .tipoMovimiento(tipo)
                .monto(monto)
                .descripcion(descripcion)
                .stripeEventId(stripeEventId)
                .build();
        transaccion.getMovimientos().add(movimiento);
    }
}
