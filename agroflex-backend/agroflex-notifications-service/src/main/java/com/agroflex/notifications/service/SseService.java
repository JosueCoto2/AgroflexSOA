package com.agroflex.notifications.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestiona los SseEmitter activos por idUsuario.
 * Un usuario puede tener varias pestañas abiertas → List<SseEmitter>.
 */
@Service
@Slf4j
public class SseService {

    // idUsuario → lista de emitters activos (múltiples pestañas)
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * Registra un nuevo SseEmitter para el usuario.
     * Timeout de 5 minutos; el cliente hace reconexión automática (EventSource).
     */
    public SseEmitter registrar(Long idUsuario) {
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L); // 5 min

        emitters.computeIfAbsent(idUsuario, k -> new ArrayList<>()).add(emitter);

        Runnable cleanup = () -> eliminar(idUsuario, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        log.debug("SSE registrado: usuario={} total={}", idUsuario,
                emitters.getOrDefault(idUsuario, List.of()).size());

        // Enviar evento de confirmación de conexión
        try {
            emitter.send(SseEmitter.event()
                    .name("conectado")
                    .data("{\"status\":\"ok\"}"));
        } catch (IOException e) {
            cleanup.run();
        }

        return emitter;
    }

    /**
     * Envía un evento JSON a todos los emitters activos del usuario.
     */
    public void enviar(Long idUsuario, String eventoNombre, Object datos) {
        List<SseEmitter> lista = emitters.get(idUsuario);
        if (lista == null || lista.isEmpty()) return;

        List<SseEmitter> muertos = new ArrayList<>();
        for (SseEmitter emitter : new ArrayList<>(lista)) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventoNombre)
                        .data(datos));
            } catch (IOException e) {
                muertos.add(emitter);
            }
        }
        muertos.forEach(e -> eliminar(idUsuario, e));
    }

    private void eliminar(Long idUsuario, SseEmitter emitter) {
        List<SseEmitter> lista = emitters.get(idUsuario);
        if (lista != null) {
            lista.remove(emitter);
            if (lista.isEmpty()) emitters.remove(idUsuario);
        }
        log.debug("SSE eliminado: usuario={}", idUsuario);
    }
}
