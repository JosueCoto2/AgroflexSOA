package com.agroflex.admin.controller;

import com.agroflex.admin.dto.DashboardStatsDTO;
import com.agroflex.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService service;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(service.getStats());
    }

    @GetMapping("/actividad-reciente")
    public ResponseEntity<List<Map<String, Object>>> getActividadReciente() {
        // TODO: implementar log de actividad
        return ResponseEntity.ok(List.of());
    }
}
