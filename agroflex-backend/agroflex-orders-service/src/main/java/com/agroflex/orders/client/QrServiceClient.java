package com.agroflex.orders.client;

import com.agroflex.orders.dto.QrGenerateRequest;
import com.agroflex.orders.dto.QrResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "agroflex-qr-service",
        url = "${services.qr.url:}",
        fallback = QrServiceClient.QrServiceClientFallback.class
)
public interface QrServiceClient {

    @PostMapping("/api/qr/generate")
    QrResponse generateQr(
            @RequestBody QrGenerateRequest request,
            @RequestHeader("Authorization") String token);

    /**
     * Fallback — qr-service aún no existe.
     */
    @Component
    @Slf4j
    class QrServiceClientFallback implements QrServiceClient {

        @Override
        public QrResponse generateQr(QrGenerateRequest request, String token) {
            log.warn("QR service no disponible — QR se generará cuando el servicio esté disponible");
            return new QrResponse(null, "PENDIENTE", null);
        }
    }
}
