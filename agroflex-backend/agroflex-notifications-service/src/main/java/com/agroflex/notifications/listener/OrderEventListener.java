package com.agroflex.notifications.listener;

/**
 * Placeholder para futura integración con Kafka/RabbitMQ.
 *
 * Por ahora las notificaciones se disparan vía HTTP desde cada microservicio
 * a POST /api/notifications/internal/enviar
 *
 * Cuando se integre un message broker:
 *
 *   @KafkaListener(topics = "orden-creada")
 *   public void onOrdenCreada(OrderCreatedEvent event) {
 *       notificacionService.enviar(new EnviarNotificacionRequest(
 *           event.getIdComprador(), "Nueva orden", "Tu orden fue creada", "orden_nueva", ...
 *       ));
 *   }
 */
public class OrderEventListener {
    // Reserved for future async event integration
}
