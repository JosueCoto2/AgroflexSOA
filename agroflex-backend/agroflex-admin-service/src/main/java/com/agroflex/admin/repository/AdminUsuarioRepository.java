package com.agroflex.admin.repository;

import com.agroflex.admin.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Map;

@Repository
public interface AdminUsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("SELECT u FROM Usuario u WHERE " +
           "(:buscar IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%',:buscar,'%')) OR LOWER(u.correo) LIKE LOWER(CONCAT('%',:buscar,'%'))) AND " +
           "(:activo IS NULL OR u.activo = :activo)")
    Page<Usuario> findByFiltros(@Param("buscar") String buscar,
                                @Param("activo") Boolean activo,
                                Pageable pageable);

    long countByActivoTrue();
    long countByActivoFalse();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.createdAt >= :desde")
    long countNuevosDesde(@Param("desde") LocalDateTime desde);

    @Query("SELECT COUNT(p) FROM Producto p WHERE p.idVendedor = :idVendedor AND p.activo = true")
    long countProductosByVendedor(@Param("idVendedor") Long idVendedor);
}
