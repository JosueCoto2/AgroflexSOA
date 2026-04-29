package com.agroflex.users.dto;

import java.math.BigDecimal;
import java.util.List;

public record PerfilPublicoResponse(
        Long idUsuario,
        String nombre,
        String apellidos,
        String estadoRepublica,
        String municipio,
        BigDecimal puntuacionRep,
        Integer totalReseñas,
        Boolean validado,
        List<String> roles,
        String fotoPerfil,
        String descripcion
) {}
