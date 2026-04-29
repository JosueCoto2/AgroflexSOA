package com.agroflex.payments.repository;

import com.agroflex.payments.model.EstadoPago;
import com.agroflex.payments.model.Transaccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    Optional<Transaccion> findByIdOrden(Long idOrden);

    Optional<Transaccion> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Transaccion> findByStripeChargeId(String stripeChargeId);

    boolean existsByIdOrden(Long idOrden);

    List<Transaccion> findByIdCompradorAndDeletedAtIsNull(Long idComprador);

    List<Transaccion> findByIdVendedorAndDeletedAtIsNull(Long idVendedor);

    Page<Transaccion> findAllByDeletedAtIsNull(Pageable pageable);

    List<Transaccion> findByEstadoPago(EstadoPago estadoPago);
}
