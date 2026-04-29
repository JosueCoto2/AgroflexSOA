package com.agroflex.payments.service;

import com.agroflex.payments.dto.TransactionDto;
import com.agroflex.payments.model.Transaccion;
import com.agroflex.payments.repository.TransaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionHistoryService {

    private final TransaccionRepository transaccionRepository;

    @Transactional(readOnly = true)
    public List<TransactionDto> misTransacciones(Long idUsuario, String rol) {
        List<Transaccion> transacciones;
        if ("COMPRADOR".equalsIgnoreCase(rol) || "EMPAQUE".equalsIgnoreCase(rol)) {
            transacciones = transaccionRepository.findByIdCompradorAndDeletedAtIsNull(idUsuario);
        } else {
            transacciones = transaccionRepository.findByIdVendedorAndDeletedAtIsNull(idUsuario);
        }
        return transacciones.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TransactionDto obtenerPorId(Long id) {
        return transaccionRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new com.agroflex.payments.exception
                        .PaymentNotFoundException("id", id.toString()));
    }

    @Transactional(readOnly = true)
    public TransactionDto obtenerPorOrden(Long idOrden) {
        return transaccionRepository.findByIdOrden(idOrden)
                .map(this::toDto)
                .orElseThrow(() -> new com.agroflex.payments.exception
                        .PaymentNotFoundException(idOrden));
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> listarTodas(Pageable pageable) {
        return transaccionRepository.findAllByDeletedAtIsNull(pageable)
                .map(this::toDto);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private TransactionDto toDto(Transaccion t) {
        return new TransactionDto(
                t.getId(),
                t.getIdOrden(),
                t.getIdComprador(),
                t.getIdVendedor(),
                t.getMonto(),
                t.getMontoComision(),
                t.getMontoVendedor(),
                t.getMoneda(),
                t.getMetodoPago() != null ? t.getMetodoPago().name() : null,
                t.getEstadoPago() != null ? t.getEstadoPago().name() : null,
                t.getStripePaymentIntentId(),
                // stripeClientSecret NUNCA se expone
                t.getFechaCreacion(),
                t.getFechaPago(),
                t.getFechaLiberacion()
        );
    }
}
