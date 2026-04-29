package com.agroflex.payments.client;

import com.agroflex.payments.dto.OrderStatusUpdateDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "agroflex-orders-service",
        url = "${services.orders.url:}",
        fallback = OrderServiceClient.OrderServiceClientFallback.class
)
public interface OrderServiceClient {

    @PutMapping("/api/orders/{orderId}/status")
    void actualizarEstadoOrden(
            @PathVariable Long orderId,
            @RequestBody OrderStatusUpdateDto dto,
            @RequestHeader("Authorization") String token);

    @Component
    @Slf4j
    class OrderServiceClientFallback implements OrderServiceClient {

        @Override
        public void actualizarEstadoOrden(Long orderId, OrderStatusUpdateDto dto, String token) {
            log.warn("No se pudo actualizar estado de orden {} a {} — orders-service no disponible",
                    orderId, dto.getNuevoEstado());
            // No lanzar excepción — el pago ya fue procesado, el estado se actualizará luego
        }
    }
}
