package com.agroflex.users.repository;

import com.agroflex.users.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByIdUsuarioAndDeletedAtIsNull(Long idUsuario);

    @Query("SELECT u FROM Usuario u WHERE u.deletedAt IS NULL AND " +
           "(:busqueda IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(u.correo) LIKE LOWER(CONCAT('%', :busqueda, '%')))")
    Page<Usuario> buscarActivos(@Param("busqueda") String busqueda, Pageable pageable);

    boolean existsByCorreo(String correo);
}
