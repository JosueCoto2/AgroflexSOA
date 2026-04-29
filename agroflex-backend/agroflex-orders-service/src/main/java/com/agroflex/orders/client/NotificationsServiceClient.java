package com.agroflex.orders.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(
        name = "agroflex-notifications-service",
        url = "${services.notifications.url:http://localhost:8088}",
        fallback = NotificationsServiceClient.NotificationsServiceClientFallback.class
)
public interface NotificationsServiceClient {

    @PostMapping("/api/notifications/internal/enviar")
    ResponseEntity<Object> enviar(@RequestBody Map<String, Object> request);

    @Component
    @Slf4j
    class NotificationsServiceClientFallback implements NotificationsServiceClient {
        @Override
        public ResponseEntity<Object> enviar(Map<String, Object> request) {
            log.warn("Notifications service no disponible — notificación no enviada: {}", request.get("titulo"));
            return ResponseEntity.ok().build();
        }
    }
}
