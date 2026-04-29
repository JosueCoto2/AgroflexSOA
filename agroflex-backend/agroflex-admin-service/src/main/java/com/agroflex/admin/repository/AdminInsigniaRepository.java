package com.agroflex.admin.repository;

import com.agroflex.admin.model.SolicitudInsignia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminInsigniaRepository extends JpaRepository<SolicitudInsignia, Long> {

    List<SolicitudInsignia> findByEstadoOrderByFechaSolicitudAsc(String estado);

    Page<SolicitudInsignia> findByEstado(String estado, Pageable pageable);

    long countByEstado(String estado);

    @Query("SELECT COUNT(s) FROM SolicitudInsignia s WHERE s.estado = :estado AND s.fechaResolucion >= :desde")
    long countByEstadoAndFechaResolucionAfter(@Param("estado") String estado,
                                               @Param("desde") LocalDateTime desde);
}
