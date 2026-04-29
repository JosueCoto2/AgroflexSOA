package com.agroflex.orders.repository;

import com.agroflex.orders.model.Escrow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EscrowRepository extends JpaRepository<Escrow, Long> {

    Optional<Escrow> findByIdOrden(Long idOrden);
}
