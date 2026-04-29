package com.agroflex.orders.client;

import com.agroflex.orders.dto.LoteResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(
        name = "agroflex-catalog-service",
        url = "${services.catalog.url:}",
        fallback = CatalogServiceClient.CatalogServiceClientFallback.class
)
public interface CatalogServiceClient {

    @GetMapping("/api/catalog/lotes/{id}")
    LoteResponse getLoteById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token);

    @PatchMapping("/api/catalog/lotes/{id}/estado")
    void actualizarEstadoLote(
            @PathVariable Long id,
            @RequestBody Map<String, String> estado,
            @RequestHeader("Authorization") String token);

    /**
     * Endpoint interno — marca el lote como VENDIDO sin verificar propiedad.
     * Solo permite VENDIDO o DISPONIBLE como nuevo estado.
     */
    @PatchMapping("/api/catalog/lotes/{id}/estado-sistema")
    void actualizarEstadoSistema(
            @PathVariable Long id,
            @RequestBody Map<String, String> estado,
            @RequestHeader("Authorization") String token);

    @Component
    @Slf4j
    class CatalogServiceClientFallback implements CatalogServiceClient {

        @Override
        public LoteResponse getLoteById(Long id, String token) {
            log.warn("Catalog service no disponible — no se pudo obtener lote {}", id);
            throw new RuntimeException("Catalog service no disponible temporalmente");
        }

        @Override
        public void actualizarEstadoLote(Long id, Map<String, String> estado, String token) {
            log.warn("No se pudo actualizar estado del lote {} — catalog service no disponible", id);
        }

        @Override
        public void actualizarEstadoSistema(Long id, Map<String, String> estado, String token) {
            log.warn("No se pudo marcar como VENDIDO el lote {} — catalog service no disponible", id);
        }
    }
}
