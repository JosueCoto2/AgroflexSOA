package com.agroflex.admin.repository;

import com.agroflex.admin.model.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface AdminProductoRepository extends JpaRepository<Producto, Long> {

    @Query("SELECT p FROM Producto p WHERE " +
           "(:tipo IS NULL OR p.tipo = :tipo) AND " +
           "(:activo IS NULL OR p.activo = :activo) AND " +
           "(:buscar IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%',:buscar,'%')) OR LOWER(p.nombreVendedor) LIKE LOWER(CONCAT('%',:buscar,'%')))")
    Page<Producto> findByFiltros(@Param("tipo") String tipo,
                                 @Param("activo") Boolean activo,
                                 @Param("buscar") String buscar,
                                 Pageable pageable);

    long countByTipo(String tipo);
    long countByActivoFalse();

    @Query("SELECT COUNT(p) FROM Producto p WHERE p.createdAt >= :desde")
    long countPublicadosDesde(@Param("desde") LocalDateTime desde);
}
