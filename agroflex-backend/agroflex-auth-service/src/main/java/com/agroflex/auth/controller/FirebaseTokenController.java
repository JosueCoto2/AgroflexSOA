package com.agroflex.auth.controller;

import com.agroflex.auth.model.Usuario;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * FirebaseTokenController — Genera un Firebase Custom Token para el usuario autenticado.
 *
 * Flujo:
 *  1. El usuario ya está autenticado en Spring Boot (JWT válido en el header Authorization).
 *  2. El frontend llama POST /api/auth/firebase-token.
 *  3. Este endpoint genera un Custom Token con uid = String(idUsuario).
 *  4. El frontend usa ese token para autenticarse en Firebase Auth.
 *  5. Firebase Auth queda activo → request.auth.uid == userId en las reglas de Storage.
 */
@RestController
@RequestMapping("/api/auth")
public class FirebaseTokenController {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenController.class);

    @PostMapping("/firebase-token")
    public ResponseEntity<?> generarFirebaseToken(
            @AuthenticationPrincipal Usuario usuario) {

        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("[Firebase] Admin SDK no inicializado — firebase-service-account.json falta.");
            return ResponseEntity.status(503)
                    .body(Map.of("error", "Firebase no configurado en el servidor"));
        }

        try {
            // UID = id numérico del usuario en MySQL (como String)
            // Debe coincidir con el userId que el frontend usa en la ruta de Storage:
            //   productos/{userId}/archivo.jpg
            String uid = String.valueOf(usuario.getIdUsuario());

            String customToken = FirebaseAuth.getInstance().createCustomToken(uid);

            return ResponseEntity.ok(Map.of("firebaseToken", customToken));

        } catch (Exception e) {
            log.error("[Firebase] Error al crear custom token: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", "No se pudo generar el token de Firebase"));
        }
    }
}
