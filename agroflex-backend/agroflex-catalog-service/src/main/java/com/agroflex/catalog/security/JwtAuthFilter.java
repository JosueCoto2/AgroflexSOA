package com.agroflex.catalog.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

/**
 * Filtra cada request, extrae el JWT del header Authorization,
 * lo valida y establece el contexto de seguridad.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            JwtAuthPrincipal principal = jwtService.validateAndExtract(token);

            if (principal != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Agregar cada rol en dos formas para compatibilidad:
                // "PRODUCTOR" → hasAnyAuthority('PRODUCTOR') en ProductoController
                // "ROLE_PRODUCTOR" → hasAnyRole('PRODUCTOR') en CosechaController
                List<SimpleGrantedAuthority> authorities = principal.roles().stream()
                        .flatMap(r -> Stream.of(
                                new SimpleGrantedAuthority(r),
                                new SimpleGrantedAuthority("ROLE_" + r)))
                        .toList();

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
