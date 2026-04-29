package com.agroflex.qr.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GeoValidationService {

    private static final double EARTH_RADIUS_M = 6_371_000.0;

    /**
     * Calcula la distancia en metros entre dos puntos GPS (fórmula de Haversine).
     */
    public double calcularDistancia(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_M * c;
    }

    /**
     * Devuelve true si el punto de escaneo está dentro del radio de tolerancia.
     */
    public boolean estaEnRadio(double latEscaneo, double lonEscaneo,
                                double latEsperada, double lonEsperada,
                                double radioMetros) {
        double distancia = calcularDistancia(latEscaneo, lonEscaneo, latEsperada, lonEsperada);
        log.debug("Distancia GPS: {}m  (radio: {}m)", String.format("%.2f", distancia), radioMetros);
        return distancia <= radioMetros;
    }
}
