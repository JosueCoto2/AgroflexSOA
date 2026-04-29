package com.agroflex.catalog.repository;

import com.agroflex.catalog.model.InsigniaVendedorLite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsigniaVendedorRepository extends JpaRepository<InsigniaVendedorLite, Long> {

    boolean existsByIdUsuarioAndEstadoVerificacion(Long idUsuario, String estadoVerificacion);
}
