package com.agroflex.users.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarPerfilRequest(

        @Size(max = 120)
        String nombre,

        @Size(max = 120)
        String apellidos,

        @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Teléfono inválido")
        String telefono,

        @Size(max = 255)
        String direccion,

        Double latitud,
        Double longitud,

        @Size(max = 80)
        String estadoRepublica,

        @Size(max = 80)
        String municipio,

        @Size(max = 500)
        String fotoPerfil,

        @Size(max = 1000)
        String descripcion,

        String fcmToken
) {}
