package com.agroflex.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "El nombre es requerido")
    private String nombre;
    
    @NotBlank(message = "Los apellidos son requeridos")
    private String apellidos;
    
    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo debe ser válido")
    private String correo;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
        message = "La contraseña debe incluir al menos 1 mayúscula y 1 número"
    )
    private String password;
    
    @Pattern(
        regexp = "^[+]?[0-9]{7,20}$",
        message = "El teléfono debe tener entre 7 y 20 dígitos"
    )
    private String telefono;
    
    private String rolSolicitado;

    // Verificación por correo desactivada temporalmente
    private String codigoVerificacion;
}
