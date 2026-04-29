package com.agroflex.catalog.repository;

import com.agroflex.catalog.model.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository
        extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {

    Optional<Producto> findByIdProductoAndActivoTrue(Long id);

    List<Producto> findByDestacadoTrueAndActivoTrue(Pageable pageable);

    Page<Producto> findByIdVendedorAndActivoTrue(Long idVendedor, Pageable pageable);
}
