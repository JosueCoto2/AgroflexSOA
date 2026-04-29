package com.agroflex.admin.service;

import com.agroflex.admin.dto.DashboardStatsDTO;
import com.agroflex.admin.model.Rol;
import com.agroflex.admin.model.Usuario;
import com.agroflex.admin.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AdminUsuarioRepository usuarioRepository;
    private final AdminProductoRepository productoRepository;
    private final AdminInsigniaRepository insigniaRepository;
    private final AdminDisputaRepository disputaRepository;

    public DashboardStatsDTO getStats() {
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime hoy = LocalDateTime.now().toLocalDate().atStartOfDay();

        // Usuarios por rol
        List<Usuario> todosUsuarios = usuarioRepository.findAll();
        Map<String, Long> porRol = new HashMap<>();
        porRol.put("PRODUCTOR", 0L);
        porRol.put("INVERNADERO", 0L);
        porRol.put("PROVEEDOR", 0L);
        porRol.put("COMPRADOR", 0L);
        porRol.put("EMPAQUE", 0L);
        porRol.put("ADMIN", 0L);

        for (Usuario u : todosUsuarios) {
            for (Rol r : u.getRoles()) {
                porRol.merge(r.getAuthority(), 1L, Long::sum);
            }
        }

        return DashboardStatsDTO.builder()
                .usuarios(DashboardStatsDTO.UsuariosStats.builder()
                        .total(usuarioRepository.count())
                        .porRol(porRol)
                        .nuevosEsteMes(usuarioRepository.countNuevosDesde(inicioMes))
                        .activos(usuarioRepository.countByActivoTrue())
                        .suspendidos(usuarioRepository.countByActivoFalse())
                        .build())
                .productos(DashboardStatsDTO.ProductosStats.builder()
                        .total(productoRepository.count())
                        .cosechas(productoRepository.countByTipo("cosecha"))
                        .suministros(productoRepository.countByTipo("suministro"))
                        .publicadosHoy(productoRepository.countPublicadosDesde(hoy))
                        .suspendidos(productoRepository.countByActivoFalse())
                        .build())
                .insignias(DashboardStatsDTO.InsigniasStats.builder()
                        .pendientes(insigniaRepository.countByEstado("PENDIENTE"))
                        .aprobadasEsteMes(insigniaRepository.countByEstadoAndFechaResolucionAfter("APROBADA", inicioMes))
                        .rechazadasEsteMes(insigniaRepository.countByEstadoAndFechaResolucionAfter("RECHAZADA", inicioMes))
                        .build())
                .disputas(DashboardStatsDTO.DisputasStats.builder()
                        .abiertas(disputaRepository.countByEstado("ABIERTA"))
                        .enRevision(disputaRepository.countByEstado("EN_REVISION"))
                        .resueltasEsteMes(disputaRepository.countResueltasDesde(inicioMes))
                        .build())
                .build();
    }
}
