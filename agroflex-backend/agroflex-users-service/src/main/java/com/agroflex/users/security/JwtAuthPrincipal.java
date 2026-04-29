package com.agroflex.users.security;

import java.util.List;

public record JwtAuthPrincipal(
        Long idUsuario,
        String correo,
        String nombre,
        List<String> roles
) {}
