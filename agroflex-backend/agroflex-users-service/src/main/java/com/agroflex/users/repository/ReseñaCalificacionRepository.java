package com.agroflex.users.repository;

import com.agroflex.users.model.ReseñaCalificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReseñaCalificacionRepository extends JpaRepository<ReseñaCalificacion, Long> {

    Page<ReseñaCalificacion> findByIdCalificadoAndVisibleTrueOrderByCreatedAtDesc(
            Long idCalificado, Pageable pageable);

    Optional<ReseñaCalificacion> findByIdOrdenAndIdCalificador(Long idOrden, Long idCalificador);

    boolean existsByIdOrdenAndIdCalificador(Long idOrden, Long idCalificador);

    @Query("SELECT AVG(r.puntuacion) FROM ReseñaCalificacion r WHERE r.idCalificado = :idUsuario AND r.visible = true")
    Double calcularPromedioPuntuacion(@Param("idUsuario") Long idUsuario);

    @Query("SELECT COUNT(r) FROM ReseñaCalificacion r WHERE r.idCalificado = :idUsuario AND r.visible = true")
    Long contarReseñasVisibles(@Param("idUsuario") Long idUsuario);
}
