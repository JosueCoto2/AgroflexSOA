package com.agroflex.auth.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

/**
 * FirebaseConfig — Inicializa Firebase Admin SDK al arrancar el servicio.
 *
 * Requiere el archivo de credenciales de cuenta de servicio en:
 *   src/main/resources/firebase-service-account.json
 *
 * Para obtenerlo:
 *   Firebase Console → Configuración del proyecto → Cuentas de servicio
 *   → "Generar nueva clave privada" → guardar como firebase-service-account.json
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return; // Ya inicializado (evita duplicados en tests)
        }
        try (InputStream serviceAccount =
                     getClass().getClassLoader().getResourceAsStream("firebase-service-account.json")) {

            if (serviceAccount == null) {
                log.warn("[Firebase] firebase-service-account.json no encontrado — " +
                         "el endpoint /api/auth/firebase-token no funcionará.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("[Firebase] Admin SDK inicializado correctamente.");

        } catch (IOException e) {
            log.warn("[Firebase] Error al inicializar Admin SDK: {}", e.getMessage());
        }
    }
}
