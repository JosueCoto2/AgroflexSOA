package com.agroflex.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    
    private String refreshToken;
    
    private String tokenType;
    
    private Long id;
    
    private String nombre;
    
    private String correo;
    
    private List<String> roles;
    
    private Boolean validado;

    private String fotoPerfil;
}
