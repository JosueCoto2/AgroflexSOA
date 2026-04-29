package com.agroflex.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "El token de Google es requerido")
    private String idToken;
}
