package com.agroflex.catalog.repository;

import com.agroflex.catalog.model.CosechaLote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CosechaLoteRepository
        extends JpaRepository<CosechaLote, Long>, JpaSpecificationExecutor<CosechaLote> {

    Optional<CosechaLote> findByIdLoteAndDeletedAtIsNull(Long idLote);

    List<CosechaLote> findByIdProductorAndDeletedAtIsNull(Long idProductor);

    Page<CosechaLote> findByEstadoLoteAndDeletedAtIsNull(String estadoLote, Pageable pageable);

    @Query("""
            SELECT c FROM CosechaLote c
            WHERE c.deletedAt IS NULL
              AND c.estadoLote = 'DISPONIBLE'
              AND (
                LOWER(c.nombreProducto) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(c.ubicacion)   LIKE LOWER(CONCAT('%', :query, '%'))
              )
            """)
    Page<CosechaLote> searchByText(@Param("query") String query, Pageable pageable);
}
