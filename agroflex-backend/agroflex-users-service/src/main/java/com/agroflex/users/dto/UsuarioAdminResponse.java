package com.agroflex.users.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record UsuarioAdminResponse(
        Long idUsuario,
        String nombre,
        String apellidos,
        String correo,
        String telefono,
        String estadoRepublica,
        String municipio,
        BigDecimal puntuacionRep,
        Integer totalReseñas,
        Boolean validado,
        Boolean activo,
        List<String> roles,
        LocalDateTime createdAt,
        LocalDateTime deletedAt
) {}
