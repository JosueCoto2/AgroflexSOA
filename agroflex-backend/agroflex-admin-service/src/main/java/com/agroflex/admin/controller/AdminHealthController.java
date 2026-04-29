package com.agroflex.admin.controller;

import com.agroflex.admin.dto.ServicioStatusDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Verifica el estado de cada microservicio AgroFlex consultando sus
 * endpoints /actuator/health. Si el servicio no responde en 3 segundos,
 * se marca como DOWN.
 */
@RestController
@RequestMapping("/api/admin/health")
@RequiredArgsConstructor
public class AdminHealthController {

    private final RestTemplate healthRestTemplate;

    private static final List<Map<String, String>> SERVICIOS = List.of(
            Map.of("nombre", "Eureka Server",          "url", "http://localhost:8761/actuator/health"),
            Map.of("nombre", "API Gateway",            "url", "http://localhost:8080/actuator/health"),
            Map.of("nombre", "Auth Service",           "url", "http://localhost:8081/actuator/health"),
            Map.of("nombre", "Catalog Service",        "url", "http://localhost:8082/actuator/health"),
            Map.of("nombre", "Orders Service",         "url", "http://localhost:8084/actuator/health"),
            Map.of("nombre", "Payments Service",       "url", "http://localhost:8085/actuator/health"),
            Map.of("nombre", "QR Service",             "url", "http://localhost:8086/actuator/health"),
            Map.of("nombre", "Notifications Service",  "url", "http://localhost:8087/actuator/health"),
            Map.of("nombre", "Users Service",          "url", "http://localhost:8088/actuator/health"),
            Map.of("nombre", "Admin Service",          "url", "http://localhost:8089/actuator/health"),
            Map.of("nombre", "Geolocation Service",    "url", "http://localhost:8090/actuator/health")
    );

    @GetMapping
    public ResponseEntity<List<ServicioStatusDTO>> checkAll() {
        List<ServicioStatusDTO> resultados = new ArrayList<>();

        for (Map<String, String> svc : SERVICIOS) {
            String nombre = svc.get("nombre");
            String url    = svc.get("url");
            resultados.add(ping(nombre, url));
        }

        return ResponseEntity.ok(resultados);
    }

    @SuppressWarnings("unchecked")
    private ServicioStatusDTO ping(String nombre, String url) {
        long inicio = System.currentTimeMillis();
        try {
            Map<String, Object> response = healthRestTemplate.getForObject(url, Map.class);
            long latencia = System.currentTimeMillis() - inicio;
            String status = response != null ? String.valueOf(response.getOrDefault("status", "UNKNOWN")) : "UNKNOWN";
            return new ServicioStatusDTO(nombre, status, latencia, url, null);
        } catch (Exception ex) {
            long latencia = System.currentTimeMillis() - inicio;
            return new ServicioStatusDTO(nombre, "DOWN", latencia, url, ex.getMessage());
        }
    }
}
