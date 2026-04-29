package com.agroflex.admin.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * Stub de pedidos — implementar cuando exista la tabla Pedidos.
 * Por ahora devuelve datos vacíos para que el servicio arranque sin errores.
 */
@Service
public class AdminPedidosService {

    public Map<String, Object> listar(String estado, int page, int size) {
        return Map.of(
                "content", List.of(),
                "totalElements", 0,
                "message", "Servicio de pedidos pendiente de implementación"
        );
    }

    public Map<String, Object> getById(Long id) {
        return Map.of("id", id, "message", "Pedido no encontrado — servicio pendiente");
    }

    public Map<String, Object> intervenir(Long id, String accion, String motivo) {
        return Map.of("id", id, "accion", accion, "status", "PROCESADO");
    }

    /**
     * Registra un reembolso administrativo.
     * Cuando el módulo de pedidos/pagos esté completo, aquí se llamará
     * a payments-service vía FeignClient para revertir el cobro en Stripe.
     */
    public Map<String, Object> reembolsar(Long id, String motivo) {
        return Map.of(
                "id", id,
                "accion", "REEMBOLSO",
                "motivo", motivo != null ? motivo : "",
                "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                "status", "REEMBOLSO_INICIADO",
                "mensaje", "Reembolso registrado — se procesará en el ciclo de pagos"
        );
    }

    /**
     * Exporta pedidos como CSV.
     * Retorna encabezados estáticos por ahora (stub).
     */
    public String exportarCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Estado,Comprador,Vendedor,Monto,Fecha\n");
        // Cuando haya datos reales, iterar sobre la tabla Ordenes_Transaccion
        return sb.toString();
    }
}
