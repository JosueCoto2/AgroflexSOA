package com.agroflex.geo.controller;

import com.agroflex.geo.model.Municipio;
import com.agroflex.geo.service.MunicipioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints públicos de geolocalización.
 * No requieren autenticación — son datos de referencia.
 */
@RestController
@RequestMapping("/api/geolocation")
@RequiredArgsConstructor
public class GeoController {

    private final MunicipioService municipioService;

    /**
     * GET /api/geolocation/municipios
     * Parámetros opcionales:
     *   - estado  (por ahora sólo "puebla", default)
     *   - q       búsqueda parcial por nombre
     *
     * Ejemplos:
     *   /api/geolocation/municipios
     *   /api/geolocation/municipios?q=tepe
     */
    @GetMapping("/municipios")
    public ResponseEntity<List<Municipio>> getMunicipios(
            @RequestParam(defaultValue = "puebla") String estado,
            @RequestParam(required = false)        String q) {

        List<Municipio> resultado = (q != null && !q.isBlank())
                ? municipioService.buscar(q)
                : municipioService.getMunicipiosPuebla();

        return ResponseEntity.ok(resultado);
    }
}
