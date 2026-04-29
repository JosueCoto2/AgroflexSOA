package com.agroflex.qr.repository;

import com.agroflex.qr.model.EstadoQr;
import com.agroflex.qr.model.SeguridadQR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeguridadQRRepository extends JpaRepository<SeguridadQR, Long> {

    Optional<SeguridadQR> findByIdOrden(Long idOrden);

    Optional<SeguridadQR> findByTokenQr(String tokenQr);

    boolean existsByIdOrdenAndEstadoQr(Long idOrden, EstadoQr estado);
}
