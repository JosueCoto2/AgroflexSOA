package com.agroflex.catalog.repository;

import com.agroflex.catalog.model.TipoCultivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoCultivoRepository extends JpaRepository<TipoCultivo, Long> {

    List<TipoCultivo> findByCategoria(String categoria);

    List<TipoCultivo> findByNombreContainingIgnoreCase(String nombre);
}
