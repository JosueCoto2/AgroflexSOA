package com.agroflex.qr.controller;

import com.agroflex.qr.dto.QrGenerateRequest;
import com.agroflex.qr.dto.QrGenerateResponse;
import com.agroflex.qr.dto.QrValidarRequest;
import com.agroflex.qr.dto.QrValidateRequest;
import com.agroflex.qr.dto.QrValidateResponse;
import com.agroflex.qr.model.SeguridadQR;
import com.agroflex.qr.repository.SeguridadQRRepository;
import com.agroflex.qr.service.QrGeneratorService;
import com.agroflex.qr.service.QrValidationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@Slf4j
public class QrController {

    private final QrGeneratorService generatorService;
    private final QrValidationService validationService;
    private final SeguridadQRRepository repository;

    /**
     * Genera un QR para una orden.
     * Llamado por orders-service tras confirmar el pago escrow.
     */
    @PostMapping("/generate")
    public ResponseEntity<QrGenerateResponse> generate(
            @Valid @RequestBody QrGenerateRequest request) {

        log.info("Generando QR para orden {}", request.getIdOrden());
        QrGenerateResponse response = generatorService.generarQr(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Valida el QR escaneado por el comprador en el punto de entrega.
     * Si es válido, orders-service procederá a liberar el escrow.
     */
    @PostMapping("/validate")
    public ResponseEntity<QrValidateResponse> validate(
            @Valid @RequestBody QrValidateRequest request) {

        log.info("Validando QR para orden {}", request.getIdOrden());
        QrValidateResponse response = validationService.validarQr(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Valida un QR enviando solo el token escaneado + GPS.
     * El idOrden se resuelve internamente buscando por token.
     * Endpoint consumido por el frontend (useQRScanner hook).
     */
    @PostMapping("/validar")
    public ResponseEntity<QrValidateResponse> validarPorToken(
            @Valid @RequestBody QrValidarRequest request,
            HttpServletRequest httpRequest) {

        SeguridadQR qr = repository.findByTokenQr(request.getToken()).orElse(null);
        if (qr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    QrValidateResponse.builder()
                            .valido(false)
                            .estado("INVALIDO")
                            .mensaje("QR no encontrado")
                            .liberarEscrow(false)
                            .build());
        }

        QrValidateRequest validateRequest = QrValidateRequest.builder()
                .token(request.getToken())
                .idOrden(qr.getIdOrden())
                .latitudEscaneo(request.getLat())
                .longitudEscaneo(request.getLng())
                .precisionGpsM(request.getPrecisionGpsM())
                .ipEscaneo(request.getIpEscaneo() != null
                        ? request.getIpEscaneo()
                        : httpRequest.getRemoteAddr())
                .userAgentEscaneo(request.getUserAgentEscaneo() != null
                        ? request.getUserAgentEscaneo()
                        : httpRequest.getHeader("User-Agent"))
                .build();

        return ResponseEntity.ok(validationService.validarQr(validateRequest));
    }

    /**
     * Consulta el estado actual del QR de una orden.
     */
    @GetMapping("/orden/{idOrden}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR', 'COMPRADOR', 'PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'EMPAQUE')")
    public ResponseEntity<SeguridadQR> getByOrden(@PathVariable Long idOrden) {
        return repository.findByIdOrden(idOrden)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
