package com.agroflex.auth.controller;

import com.agroflex.auth.dto.*;
import com.agroflex.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Endpoint para login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request para: {}", request.getCorreo());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint para registro
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registro request para: {}", request.getCorreo());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint para enviar código de verificación al correo antes del registro
     */
    @PostMapping("/enviar-codigo")
    public ResponseEntity<String> enviarCodigo(@Valid @RequestBody EnviarCodigoRequest request) {
        log.info("Enviar código de verificación a: {}", request.getCorreo());
        authService.enviarCodigoVerificacion(request.getCorreo());
        return ResponseEntity.ok("Código enviado al correo indicado");
    }
    
    /**
     * Endpoint para refrescar token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint para solicitar reset de contraseña
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request para: {}", request.getCorreo());
        authService.forgotPassword(request.getCorreo());
        // Siempre devolver éxito por seguridad (no revelar si el correo existe)
        return ResponseEntity.ok("Si el correo existe, recibirás instrucciones para resetear tu contraseña");
    }
    
    /**
     * Endpoint para resetear contraseña
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request");
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }

    /**
     * Login / registro con Google.
     * El frontend obtiene el ID token de Firebase y lo envía aquí.
     * El backend lo verifica con Firebase Admin SDK y devuelve un JWT de AgroFlex.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginConGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        log.info("Login con Google recibido");
        AuthResponse response = authService.loginConGoogle(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Solicitar insignia de vendedor — se aprueba automáticamente.
     * Requiere JWT válido.
     */
    @PostMapping("/solicitar-insignia")
    public ResponseEntity<AuthResponse> solicitarInsignia(
            @Valid @RequestBody SolicitudInsigniaRequest request,
            Principal principal) {
        log.info("Solicitud de insignia {} para: {}", request.getRol(), principal.getName());
        AuthResponse response = authService.solicitarInsignia(principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
