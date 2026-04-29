package com.agroflex.payments.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fachada de reembolsos — delega en EscrowService.
 * Punto de extensión para lógica adicional de reembolsos (políticas, notificaciones).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final EscrowService escrowService;

    @Transactional
    public void procesarReembolso(Long idOrden, String motivo, String authToken) {
        log.info("Iniciando reembolso para orden {}: {}", idOrden, motivo);
        escrowService.procesarReembolso(idOrden, motivo, authToken);
    }
}
