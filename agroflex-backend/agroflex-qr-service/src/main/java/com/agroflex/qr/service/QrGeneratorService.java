package com.agroflex.qr.service;

import com.agroflex.qr.dto.QrGenerateRequest;
import com.agroflex.qr.dto.QrGenerateResponse;
import com.agroflex.qr.model.EstadoQr;
import com.agroflex.qr.model.SeguridadQR;
import com.agroflex.qr.repository.SeguridadQRRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.EnumMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrGeneratorService {

    private final SeguridadQRRepository repository;

    @Value("${qr.token.secret}")
    private String tokenSecret;

    @Value("${qr.token.expiration-hours:48}")
    private int expirationHours;

    private static final int QR_SIZE = 300;

    @Transactional
    public QrGenerateResponse generarQr(QrGenerateRequest request) {
        // Si ya existe un QR vigente para esta orden, lo devolvemos
        repository.findByIdOrden(request.getIdOrden()).ifPresent(existing -> {
            if (existing.getEstadoQr() == EstadoQr.GENERADO
                    && existing.getFechaExpiracion().isAfter(LocalDateTime.now())) {
                throw new IllegalStateException(
                        "Ya existe un QR activo para la orden " + request.getIdOrden());
            }
        });

        String token = generarToken(request.getNumeroOrden());
        String tokenHash = hashToken(token);
        LocalDateTime expiracion = LocalDateTime.now().plusHours(expirationHours);

        SeguridadQR qr = SeguridadQR.builder()
                .idOrden(request.getIdOrden())
                .tokenQr(token)
                .tokenHash(tokenHash)
                .estadoQr(EstadoQr.GENERADO)
                .fechaGeneracion(LocalDateTime.now())
                .fechaExpiracion(expiracion)
                .latitudEsperada(request.getLatitudEntrega() != null
                        ? BigDecimal.valueOf(request.getLatitudEntrega()) : null)
                .longitudEsperada(request.getLongitudEntrega() != null
                        ? BigDecimal.valueOf(request.getLongitudEntrega()) : null)
                .build();

        qr = repository.save(qr);

        String qrImageBase64 = generarImagenQr(token);

        log.info("QR generado para orden {} (id_qr={})", request.getIdOrden(), qr.getIdQr());

        return QrGenerateResponse.builder()
                .qrCode(qrImageBase64)
                .estado(EstadoQr.GENERADO.name())
                .token(token)
                .idQr(qr.getIdQr())
                .idOrden(request.getIdOrden())
                .fechaExpiracion(expiracion)
                .build();
    }

    /**
     * Genera un token QR: UUID v4 + "-" + HMAC-SHA256(uuid + numeroOrden).
     */
    private String generarToken(String numeroOrden) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String hmac = hmacSha256(uuid + numeroOrden, tokenSecret);
        return uuid + "-" + hmac.substring(0, 32);
    }

    /**
     * Hash SHA-256 del token para almacenamiento seguro.
     */
    private String hashToken(String token) {
        return hmacSha256(token, tokenSecret);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Error generando HMAC-SHA256", e);
        }
    }

    private String generarImagenQr(String contenido) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix matrix = writer.encode(contenido, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | java.io.IOException e) {
            log.error("Error generando imagen QR: {}", e.getMessage());
            return null;
        }
    }
}
