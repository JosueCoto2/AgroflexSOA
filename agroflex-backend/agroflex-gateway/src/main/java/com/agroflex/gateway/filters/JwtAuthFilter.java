package com.agroflex.gateway.filters;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret:agroflex_dev_secret_256bits_cambiar_en_prod_agroflex_secret}")
    private String jwtSecret;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login", "/api/auth/register", "/api/auth/refresh",
            "/api/auth/enviar-codigo",
            "/api/auth/forgot-password", "/api/auth/reset-password",
            "/api/auth/google",
            // Catálogo — el catalog-service maneja su propio control de acceso (SecurityConfig)
            "/api/catalog/",
            "/api/productos/",
            // Geolocalización — datos de referencia públicos (municipios, zonas)
            "/api/geolocation/",
            // SSE stream de notificaciones — autenticado por query param ?token=
            "/api/notifications/stream"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Dejar pasar preflight CORS sin validar JWT
        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        boolean isPublic = PUBLIC_PATHS.stream().anyMatch(path::startsWith);
        if (isPublic) {
            return chain.filter(exchange);
        }

        // SSE: EventSource no soporta headers → leer token del query param
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null) {
            String tokenParam = exchange.getRequest().getQueryParams().getFirst("token");
            if (tokenParam != null) {
                authHeader = "Bearer " + tokenParam;
            }
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            exchange.getRequest().mutate()
                    .header("X-User-Id", claims.getSubject())
                    .header("X-User-Role", claims.get("rol", String.class))
                    .build();

            return chain.filter(exchange);
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
