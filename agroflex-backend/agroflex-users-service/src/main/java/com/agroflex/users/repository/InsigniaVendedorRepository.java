package com.agroflex.users.repository;

import com.agroflex.users.model.InsigniaVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsigniaVendedorRepository extends JpaRepository<InsigniaVendedor, Long> {

    List<InsigniaVendedor> findByIdUsuarioOrderByCreatedAtDesc(Long idUsuario);

    List<InsigniaVendedor> findByIdUsuarioAndEstadoVerificacion(Long idUsuario, String estadoVerificacion);
}
