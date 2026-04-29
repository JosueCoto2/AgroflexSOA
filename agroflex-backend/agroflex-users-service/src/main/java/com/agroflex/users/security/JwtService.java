package com.agroflex.users.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.List;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthPrincipal validateAndExtract(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String correo   = claims.getSubject();
            Long idUsuario  = claims.get("idUsuario", Long.class);
            String nombre   = claims.get("nombre", String.class);

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");

            return new JwtAuthPrincipal(idUsuario, correo, nombre, roles != null ? roles : List.of());

        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token JWT inválido: {}", e.getMessage());
            return null;
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
