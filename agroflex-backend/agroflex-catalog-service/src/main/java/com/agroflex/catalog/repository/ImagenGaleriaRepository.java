package com.agroflex.catalog.repository;

import com.agroflex.catalog.model.ImagenGaleria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagenGaleriaRepository extends JpaRepository<ImagenGaleria, Long> {

    List<ImagenGaleria> findByEntidadTipoAndEntidadIdOrderByOrdenDisplayAsc(
            String entidadTipo, Long entidadId);

    Optional<ImagenGaleria> findByEntidadTipoAndEntidadIdAndEsPrincipalTrue(
            String entidadTipo, Long entidadId);
}
