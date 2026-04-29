package com.agroflex.payments.service;

import com.agroflex.payments.exception.StripeIntegrationException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class StripeService {

    private static final BigDecimal COMISION_PORCENTAJE = new BigDecimal("0.035");

    @Value("${stripe.comision-porcentaje:3.5}")
    private double comisionPorcentaje;

    /**
     * Crea un PaymentIntent en Stripe.
     * El monto se convierte a centavos (Stripe trabaja en la unidad mínima de la moneda).
     * $100.00 MXN → 10000 centavos
     */
    public PaymentIntent crearPaymentIntent(BigDecimal monto, String moneda, Long idOrden) {
        long montoCentavos = monto.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        String monedaStripe = (moneda != null ? moneda : "MXN").toLowerCase();

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montoCentavos)
                    .setCurrency(monedaStripe)
                    .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC)
                    .putMetadata("idOrden", idOrden.toString())
                    .putMetadata("plataforma", "AgroFlex")
                    .setDescription("Pago AgroFlex — Orden " + idOrden)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("PaymentIntent creado para orden {}: {}", idOrden, paymentIntent.getId());
            return paymentIntent;

        } catch (StripeException e) {
            log.error("Error creando PaymentIntent para orden {}: {}", idOrden, e.getMessage());
            throw new StripeIntegrationException("crearPaymentIntent", e.getMessage());
        }
    }

    /**
     * Verifica si un PaymentIntent fue confirmado exitosamente.
     */
    public boolean confirmarPago(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            boolean exitoso = "succeeded".equals(paymentIntent.getStatus());
            log.debug("Estado de PaymentIntent {}: {}", paymentIntentId, paymentIntent.getStatus());
            return exitoso;
        } catch (StripeException e) {
            log.error("Error verificando PaymentIntent {}: {}", paymentIntentId, e.getMessage());
            throw new StripeIntegrationException("confirmarPago", e.getMessage());
        }
    }

    /**
     * Registra la intención de transferir al vendedor.
     * Para MVP: registrar el monto neto — Stripe Connect se implementará en v2.
     * Retorna un ID de referencia para tracking.
     */
    public String registrarTransferenciaVendedor(Long idOrden, BigDecimal montoNeto) {
        // MVP: registrar como referencia local. En v2 usar Stripe Connect Transfer.
        String referencia = "TRANSFER-AGF-" + idOrden + "-" + System.currentTimeMillis();
        log.info("Transferencia registrada para orden {}: ${} MXN — ref: {}", idOrden, montoNeto, referencia);
        return referencia;
    }

    /**
     * Procesa un reembolso en Stripe.
     */
    public String reembolsar(String paymentIntentId, BigDecimal monto, String motivo) {
        long montoCentavos = monto.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(montoCentavos)
                    .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                    .putMetadata("motivo", motivo != null ? motivo : "Reembolso AgroFlex")
                    .build();

            Refund refund = Refund.create(params);
            log.info("Reembolso procesado {}: ${} MXN para PI: {}", refund.getId(), monto, paymentIntentId);
            return refund.getId();

        } catch (StripeException e) {
            log.error("Error procesando reembolso para PI {}: {}", paymentIntentId, e.getMessage());
            throw new StripeIntegrationException("reembolsar", e.getMessage());
        }
    }

    /**
     * Calcula la comisión de AgroFlex: 3.5% del monto con redondeo HALF_UP.
     */
    public BigDecimal calcularComision(BigDecimal monto) {
        return monto.multiply(COMISION_PORCENTAJE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el monto neto que recibirá el vendedor (monto - comisión).
     */
    public BigDecimal calcularMontoVendedor(BigDecimal monto) {
        return monto.subtract(calcularComision(monto));
    }
}
