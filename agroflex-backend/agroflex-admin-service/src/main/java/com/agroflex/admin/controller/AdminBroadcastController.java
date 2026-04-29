package com.agroflex.admin.controller;

import com.agroflex.admin.dto.BroadcastRequest;
import com.agroflex.admin.service.AdminBroadcastService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/broadcast")
@RequiredArgsConstructor
public class AdminBroadcastController {

    private final AdminBroadcastService service;

    /**
     * Envía una notificación IN_APP a todos los usuarios activos
     * o a los de un segmento específico (rol).
     *
     * Body: { "titulo": "...", "mensaje": "...", "segmento": "PRODUCTOR" | null }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> broadcast(@Valid @RequestBody BroadcastRequest req) {
        return ResponseEntity.ok(service.enviar(req));
    }
}
