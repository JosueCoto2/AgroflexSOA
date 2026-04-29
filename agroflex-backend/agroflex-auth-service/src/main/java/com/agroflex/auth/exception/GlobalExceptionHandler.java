package com.agroflex.auth.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // DTO para la respuesta de error
    record ErrorResponse(
        String error,
        String message,
        LocalDateTime timestamp,
        Map<String, Object> details
    ) {}
    
    /**
     * Maneja credenciales inválidas
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e) {
        log.error("Credenciales inválidas: {}", e.getMessage());
        ErrorResponse response = new ErrorResponse(
            "UNAUTHORIZED",
            "Correo o contraseña incorrectos",
            LocalDateTime.now(),
            Map.of("type", "BadCredentialsException")
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    /**
     * Maneja usuario no encontrado
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UsernameNotFoundException e) {
        log.warn("Usuario no encontrado: {}", e.getMessage());
        ErrorResponse response = new ErrorResponse(
            "NOT_FOUND",
            "Usuario no encontrado",
            LocalDateTime.now(),
            Map.of("type", "UsernameNotFoundException")
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    /**
     * Maneja validación de argumentos
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException e) {
        log.warn("Validación fallida: {}", e.getMessage());
        
        Map<String, String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                error -> error.getField(),
                error -> error.getDefaultMessage(),
                (existing, replacement) -> existing
            ));
        
        ErrorResponse response = new ErrorResponse(
            "VALIDATION_ERROR",
            "Error en validación de datos",
            LocalDateTime.now(),
            new HashMap<>(Map.of("fields", errors))
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    /**
     * Maneja IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("Argumento inválido: {}", e.getMessage());
        ErrorResponse response = new ErrorResponse(
            "BAD_REQUEST",
            e.getMessage(),
            LocalDateTime.now(),
            Map.of("type", "IllegalArgumentException")
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    /**
     * Maneja excepciones genéricas
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        log.error("Error interno del servidor", e);
        ErrorResponse response = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "Error interno del servidor",
            LocalDateTime.now(),
            Map.of("type", e.getClass().getSimpleName())
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
