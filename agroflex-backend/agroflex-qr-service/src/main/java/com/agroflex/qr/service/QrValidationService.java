package com.agroflex.qr.service;

import com.agroflex.qr.dto.QrValidateRequest;
import com.agroflex.qr.dto.QrValidateResponse;
import com.agroflex.qr.model.EstadoQr;
import com.agroflex.qr.model.SeguridadQR;
import com.agroflex.qr.repository.SeguridadQRRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrValidationService {

    private final SeguridadQRRepository repository;
    private final GeoValidationService geoService;

    @Transactional
    public QrValidateResponse validarQr(QrValidateRequest request) {
        SeguridadQR qr = repository.findByIdOrden(request.getIdOrden())
                .orElse(null);

        if (qr == null) {
            return rechazo("QR no encontrado para esta orden", null, false);
        }

        // Anti-fraude: bloquear si se superaron los intentos
        if (qr.getIntentosFallidos() >= qr.getMaxIntentos()) {
            qr.setEstadoQr(EstadoQr.INVALIDO);
            repository.save(qr);
            return rechazo("QR bloqueado por exceso de intentos fallidos", qr.getIdOrden(), false);
        }

        // Verificar expiración
        if (LocalDateTime.now().isAfter(qr.getFechaExpiracion())) {
            qr.setEstadoQr(EstadoQr.EXPIRADO);
            repository.save(qr);
            return rechazo("QR expirado", qr.getIdOrden(), false);
        }

        // Verificar estado
        if (qr.getEstadoQr() != EstadoQr.GENERADO && qr.getEstadoQr() != EstadoQr.ESCANEADO) {
            return rechazo("QR en estado inválido: " + qr.getEstadoQr(), qr.getIdOrden(), false);
        }

        // Verificar token
        if (!qr.getTokenQr().equals(request.getToken())) {
            qr.setIntentosFallidos(qr.getIntentosFallidos() + 1);
            repository.save(qr);
            log.warn("Token incorrecto para orden {} (intento {})", request.getIdOrden(), qr.getIntentosFallidos());
            return rechazo("Token QR incorrecto", qr.getIdOrden(), false);
        }

        // Registrar escaneo
        qr.setEstadoQr(EstadoQr.ESCANEADO);
        qr.setFechaEscaneo(LocalDateTime.now());
        qr.setIdEscaneadoPor(request.getIdEscaneadoPor());
        qr.setIpEscaneo(request.getIpEscaneo());
        qr.setUserAgentEscaneo(request.getUserAgentEscaneo());

        if (request.getPrecisionGpsM() != null) {
            qr.setPrecisionGpsM(BigDecimal.valueOf(request.getPrecisionGpsM()));
        }

        // Validación geográfica (solo si tenemos coordenadas)
        Boolean geoValidado = null;
        Double distanciaMetros = null;

        if (request.getLatitudEscaneo() != null && request.getLongitudEscaneo() != null) {
            qr.setLatitudEscaneo(BigDecimal.valueOf(request.getLatitudEscaneo()));
            qr.setLongitudEscaneo(BigDecimal.valueOf(request.getLongitudEscaneo()));

            if (qr.getLatitudEsperada() != null && qr.getLongitudEsperada() != null) {
                distanciaMetros = geoService.calcularDistancia(
                        request.getLatitudEscaneo(), request.getLongitudEscaneo(),
                        qr.getLatitudEsperada().doubleValue(), qr.getLongitudEsperada().doubleValue());

                geoValidado = distanciaMetros <= qr.getRadioToleranciaM().doubleValue();
                qr.setDistanciaCalculada(BigDecimal.valueOf(distanciaMetros));
                qr.setGeoValidado(geoValidado);

                if (!geoValidado) {
                    log.warn("Validación geo fallida para orden {}: {}m (radio: {}m)",
                            request.getIdOrden(),
                            String.format("%.1f", distanciaMetros),
                            qr.getRadioToleranciaM());
                }
            }
        }

        // Validar
        qr.setEstadoQr(EstadoQr.VALIDADO);
        qr.setFechaValidacion(LocalDateTime.now());
        repository.save(qr);

        log.info("QR validado exitosamente para orden {} (geo={})", request.getIdOrden(), geoValidado);

        return QrValidateResponse.builder()
                .valido(true)
                .estado(EstadoQr.VALIDADO.name())
                .mensaje("QR validado — proceder con liberación de escrow")
                .liberarEscrow(true)
                .idOrden(request.getIdOrden())
                .geoValidado(geoValidado)
                .distanciaMetros(distanciaMetros)
                .build();
    }

    private QrValidateResponse rechazo(String mensaje, Long idOrden, boolean liberarEscrow) {
        return QrValidateResponse.builder()
                .valido(false)
                .estado(EstadoQr.INVALIDO.name())
                .mensaje(mensaje)
                .liberarEscrow(liberarEscrow)
                .idOrden(idOrden)
                .build();
    }
}
