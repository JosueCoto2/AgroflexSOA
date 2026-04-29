package com.agroflex.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Almacén en memoria para códigos de verificación de correo.
 * Cada código expira a los 10 minutos.
 */
@Component
@Slf4j
public class EmailVerificationStore {

    private static final int EXPIRY_MINUTES = 10;

    private record Entry(String codigo, LocalDateTime expiry) {}

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    /** Guarda (o sobreescribe) un código para el correo indicado. */
    public void guardar(String correo, String codigo) {
        store.put(correo.toLowerCase(),
                new Entry(codigo, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES)));
    }

    /**
     * Valida el código. Devuelve true si existe, no ha expirado y coincide.
     * Si es válido, lo elimina del store para que no pueda reutilizarse.
     */
    public boolean validar(String correo, String codigo) {
        Entry entry = store.get(correo.toLowerCase());
        if (entry == null) return false;
        if (entry.expiry().isBefore(LocalDateTime.now())) {
            store.remove(correo.toLowerCase());
            return false;
        }
        boolean ok = entry.codigo().equals(codigo);
        if (ok) {
            store.remove(correo.toLowerCase());
        }
        return ok;
    }

    /** Limpieza periódica cada 5 minutos para evitar acumulación. */
    @Scheduled(fixedDelay = 300_000)
    public void limpiarExpirados() {
        LocalDateTime ahora = LocalDateTime.now();
        int antes = store.size();
        store.entrySet().removeIf(e -> e.getValue().expiry().isBefore(ahora));
        int eliminados = antes - store.size();
        if (eliminados > 0) {
            log.debug("EmailVerificationStore: eliminados {} códigos expirados", eliminados);
        }
    }
}
