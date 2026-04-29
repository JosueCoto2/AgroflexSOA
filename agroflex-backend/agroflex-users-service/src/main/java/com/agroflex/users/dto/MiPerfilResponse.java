package com.agroflex.users.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record MiPerfilResponse(
        Long idUsuario,
        String nombre,
        String apellidos,
        String correo,
        String telefono,
        String direccion,
        BigDecimal latitud,
        BigDecimal longitud,
        String estadoRepublica,
        String municipio,
        BigDecimal puntuacionRep,
        Integer totalReseñas,
        Boolean validado,
        Boolean activo,
        String firebaseUid,
        String fotoPerfil,
        String descripcion,
        List<String> roles,
        LocalDateTime createdAt
) {}
