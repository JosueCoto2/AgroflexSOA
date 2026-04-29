package com.agroflex.payments.repository;

import com.agroflex.payments.model.MovimientoEscrow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoEscrowRepository extends JpaRepository<MovimientoEscrow, Long> {

    List<MovimientoEscrow> findByTransaccionId(Long idTransaccion);
}
