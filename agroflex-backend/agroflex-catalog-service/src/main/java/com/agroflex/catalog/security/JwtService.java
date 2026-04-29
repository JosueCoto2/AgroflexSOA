package com.agroflex.catalog.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * Servicio de validación JWT para el catalog-service.
 * Solo valida tokens emitidos por el auth-service (mismo secreto).
 * No genera tokens — eso es responsabilidad del auth-service.
 */
@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Extrae y valida el JWT. Devuelve null si el token es inválido o expirado.
     */
    public JwtAuthPrincipal validateAndExtract(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String correo     = claims.getSubject();
            Long idUsuario   = claims.get("idUsuario", Long.class);
            String nombre    = claims.get("nombre", String.class);
            String fotoPerfil = claims.get("fotoPerfil", String.class);

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");

            return new JwtAuthPrincipal(idUsuario, correo, nombre, fotoPerfil, roles != null ? roles : List.of());

        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token JWT inválido: {}", e.getMessage());
            return null;
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
