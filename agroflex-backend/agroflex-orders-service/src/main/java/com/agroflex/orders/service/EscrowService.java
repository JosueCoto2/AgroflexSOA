package com.agroflex.orders.service;

import com.agroflex.orders.client.PaymentServiceClient;
import com.agroflex.orders.dto.CreatePaymentIntentRequest;
import com.agroflex.orders.dto.PaymentIntentResponse;
import com.agroflex.orders.exception.OrderNotFoundException;
import com.agroflex.orders.model.Escrow;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.model.OrdenTransaccion;
import com.agroflex.orders.repository.EscrowRepository;
import com.agroflex.orders.repository.OrdenTransaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowService {

    private final OrdenTransaccionRepository ordenRepository;
    private final EscrowRepository escrowRepository;
    private final PaymentServiceClient paymentServiceClient;

    /**
     * Retiene el pago en escrow para una orden.
     * Corre dentro de la transacción del llamador (REQUIRED).
     * Cualquier excepción es capturada internamente para no romper la orden.
     *
     * @return PaymentIntent ID de Stripe/PayPal, o null si payments-service no está disponible
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public String retenerPago(OrdenTransaccion orden, String authHeader) {
        String paymentIntentId = null;

        try {
            CreatePaymentIntentRequest request = CreatePaymentIntentRequest.builder()
                    .idOrden(orden.getId())
                    .numeroOrden(orden.getNumeroOrden())
                    .monto(orden.getTotalMonto())
                    .moneda("MXN")
                    .idComprador(orden.getIdComprador())
                    .idVendedor(orden.getIdVendedor())
                    .build();

            PaymentIntentResponse response = paymentServiceClient.createPaymentIntent(request, authHeader);
            paymentIntentId = response.getPaymentIntentId();
        } catch (Exception e) {
            log.warn("No se pudo procesar pago para orden {} — continuando sin PaymentIntent: {}",
                    orden.getNumeroOrden(), e.getMessage());
        }

        // Registrar en tabla escrow dentro de la misma transacción que la orden
        try {
            Escrow escrow = Escrow.builder()
                    .idOrden(orden.getId())
                    .monto(orden.getTotalMonto())
                    .estado("RETENIDO")
                    .razon("Pago retenido al crear orden")
                    .build();
            escrowRepository.save(escrow);
            log.info("Escrow registrado para orden {}: ${}", orden.getNumeroOrden(), orden.getTotalMonto());
        } catch (Exception e) {
            log.warn("No se pudo registrar escrow para orden {}: {}", orden.getNumeroOrden(), e.getMessage());
        }

        return paymentIntentId;
    }

    /**
     * Libera el pago al vendedor tras confirmación de entrega (QR validado).
     * Solo se permite si la orden está en estado ENTREGADO.
     */
    @Transactional
    public void liberarPago(Long idOrden, String authHeader) {
        OrdenTransaccion orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new OrderNotFoundException(idOrden));

        if (orden.getEstadoPedido() != EstadoPedido.ENTREGADO) {
            throw new IllegalStateException(
                    "Solo se puede liberar el pago de una orden en estado ENTREGADO. " +
                    "Estado actual: " + orden.getEstadoPedido());
        }

        try {
            paymentServiceClient.releasePayment(idOrden, authHeader);
        } catch (Exception e) {
            log.warn("No se pudo liberar pago vía payments-service para orden {}: {}",
                    orden.getNumeroOrden(), e.getMessage());
        }

        orden.setEstadoPedido(EstadoPedido.COMPLETADO);
        ordenRepository.save(orden);

        escrowRepository.findByIdOrden(idOrden).ifPresent(escrow -> {
            escrow.setEstado("LIBERADO");
            escrow.setFechaLiberacion(LocalDateTime.now());
            escrowRepository.save(escrow);
        });

        log.info("Pago liberado para orden {}: ${}", orden.getNumeroOrden(), orden.getMontoEscrow());
    }

    /**
     * Reembolsa el pago al comprador.
     * Solo válido si la orden está en CONFIRMADO o EN_TRANSITO.
     */
    @Transactional
    public void reembolsarPago(Long idOrden, String motivo, String authHeader) {
        OrdenTransaccion orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new OrderNotFoundException(idOrden));

        if (orden.getEstadoPedido() != EstadoPedido.CONFIRMADO
                && orden.getEstadoPedido() != EstadoPedido.EN_TRANSITO) {
            throw new IllegalStateException(
                    "Solo se puede reembolsar una orden en estado CONFIRMADO o EN_TRANSITO. " +
                    "Estado actual: " + orden.getEstadoPedido());
        }

        try {
            paymentServiceClient.refundPayment(idOrden, Map.of("motivo", motivo), authHeader);
        } catch (Exception e) {
            log.warn("No se pudo procesar reembolso vía payments-service para orden {}: {}",
                    orden.getNumeroOrden(), e.getMessage());
        }

        orden.setEstadoPedido(EstadoPedido.REEMBOLSADO);
        ordenRepository.save(orden);

        escrowRepository.findByIdOrden(idOrden).ifPresent(escrow -> {
            escrow.setEstado("REEMBOLSADO");
            escrow.setFechaLiberacion(LocalDateTime.now());
            escrow.setRazon(motivo);
            escrowRepository.save(escrow);
        });

        log.info("Reembolso procesado para orden {}: ${}", orden.getNumeroOrden(), orden.getMontoEscrow());
    }
}
