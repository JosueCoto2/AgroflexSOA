package com.agroflex.orders.service;

import com.agroflex.orders.client.NotificationsServiceClient;
import com.agroflex.orders.model.OrdenTransaccion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Encapsula el envío de notificaciones IN_APP a comprador y vendedor
 * cuando cambia el estado de una orden.
 * Todos los métodos son best-effort — un fallo no interrumpe el flujo.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationService {

    private final NotificationsServiceClient notificationsClient;

    /**
     * Notifica al vendedor que tiene un nuevo pedido pendiente de atender,
     * y al comprador que su orden fue creada con éxito.
     */
    public void notificarOrdenCreada(OrdenTransaccion orden) {
        // Notificación al vendedor
        try {
            Map<String, Object> bodyVendedor = new HashMap<>();
            bodyVendedor.put("idUsuario", orden.getIdVendedor());
            bodyVendedor.put("titulo", "Nuevo pedido recibido");
            bodyVendedor.put("cuerpo", "Tienes un nuevo pedido " + orden.getNumeroOrden()
                    + " por $" + orden.getTotalMonto() + " MXN. Prepara el QR para la entrega.");
            bodyVendedor.put("categoria", "orden_nueva");
            bodyVendedor.put("datosExtra",
                    "{\"idOrden\":" + orden.getId() + ",\"url\":\"/mi-qr/" + orden.getId() + "\"}");
            notificationsClient.enviar(bodyVendedor);
            log.info("Notificación enviada al vendedor {} para orden {}", orden.getIdVendedor(), orden.getNumeroOrden());
        } catch (Exception e) {
            log.warn("No se pudo notificar al vendedor {}: {}", orden.getIdVendedor(), e.getMessage());
        }

        // Notificación al comprador
        try {
            Map<String, Object> bodyComprador = new HashMap<>();
            bodyComprador.put("idUsuario", orden.getIdComprador());
            bodyComprador.put("titulo", "Pedido creado");
            bodyComprador.put("cuerpo", "Tu orden " + orden.getNumeroOrden()
                    + " fue registrada exitosamente. Completa el pago para confirmarla.");
            bodyComprador.put("categoria", "orden_nueva");
            bodyComprador.put("datosExtra",
                    "{\"idOrden\":" + orden.getId() + ",\"url\":\"/mis-pedidos/" + orden.getId() + "\"}");
            notificationsClient.enviar(bodyComprador);
        } catch (Exception e) {
            log.warn("No se pudo notificar al comprador {}: {}", orden.getIdComprador(), e.getMessage());
        }
    }

    /**
     * Notifica al vendedor que el QR fue generado e incluye los datos del comprador.
     */
    public void notificarQrGenerado(OrdenTransaccion orden, Long idComprador, String correoComprador) {
        try {
            String infoComprador = correoComprador != null
                    ? "Comprador: " + correoComprador + " (ID: " + idComprador + ")"
                    : "Comprador ID: " + idComprador;

            Map<String, Object> body = new HashMap<>();
            body.put("idUsuario", orden.getIdVendedor());
            body.put("titulo", "QR de entrega listo");
            body.put("cuerpo", "El QR para la entrega de la orden " + orden.getNumeroOrden()
                    + " está listo. " + infoComprador
                    + ". Muéstraselo al comprador al momento de la entrega.");
            body.put("categoria", "qr");
            body.put("datosExtra",
                    "{\"idOrden\":" + orden.getId()
                    + ",\"idComprador\":" + idComprador
                    + (correoComprador != null ? ",\"correoComprador\":\"" + correoComprador + "\"" : "")
                    + ",\"url\":\"/mi-qr/" + orden.getId() + "\"}");
            notificationsClient.enviar(body);
            log.info("Notificación QR enviada al vendedor {} para orden {}, comprador={}",
                    orden.getIdVendedor(), orden.getNumeroOrden(), idComprador);
        } catch (Exception e) {
            log.warn("No se pudo notificar QR al vendedor {}: {}", orden.getIdVendedor(), e.getMessage());
        }
    }
}
