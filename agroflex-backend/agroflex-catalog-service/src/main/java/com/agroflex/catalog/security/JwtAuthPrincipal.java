package com.agroflex.catalog.security;

import java.util.List;

/**
 * Representa los datos del usuario autenticado extraídos del JWT.
 * El JwtAuthFilter crea este objeto y lo establece como principal
 * en el SecurityContext.
 */
public record JwtAuthPrincipal(
        Long idUsuario,
        String correo,
        String nombre,
        String fotoPerfil,
        List<String> roles
) {}
