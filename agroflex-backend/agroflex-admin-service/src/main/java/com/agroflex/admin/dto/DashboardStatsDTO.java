package com.agroflex.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private UsuariosStats usuarios;
    private ProductosStats productos;
    private InsigniasStats insignias;
    private DisputasStats disputas;

    @Data
    @Builder
    public static class UsuariosStats {
        private long total;
        private Map<String, Long> porRol;
        private long nuevosEsteMes;
        private long activos;
        private long suspendidos;
    }

    @Data
    @Builder
    public static class ProductosStats {
        private long total;
        private long cosechas;
        private long suministros;
        private long publicadosHoy;
        private long suspendidos;
    }

    @Data
    @Builder
    public static class InsigniasStats {
        private long pendientes;
        private long aprobadasEsteMes;
        private long rechazadasEsteMes;
    }

    @Data
    @Builder
    public static class DisputasStats {
        private long abiertas;
        private long enRevision;
        private long resueltasEsteMes;
    }
}
