package com.agroflex.admin.repository;

import com.agroflex.admin.model.Disputa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AdminDisputaRepository extends JpaRepository<Disputa, Long> {

    Page<Disputa> findByEstado(String estado, Pageable pageable);

    long countByEstado(String estado);

    @Query("SELECT COUNT(d) FROM Disputa d WHERE d.estado = 'RESUELTA' AND d.fechaResolucion >= :desde")
    long countResueltasDesde(@Param("desde") LocalDateTime desde);
}
