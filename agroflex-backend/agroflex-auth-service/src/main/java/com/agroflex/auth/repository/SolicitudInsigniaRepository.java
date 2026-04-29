package com.agroflex.auth.repository;

import com.agroflex.auth.model.SolicitudInsignia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudInsigniaRepository extends JpaRepository<SolicitudInsignia, Long> {
    boolean existsByIdUsuarioAndRolSolicitado(Long idUsuario, String rolSolicitado);
}
