package com.agroflex.orders.repository;

import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.model.OrdenTransaccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrdenTransaccionRepository extends JpaRepository<OrdenTransaccion, Long> {

    List<OrdenTransaccion> findByIdCompradorAndDeletedAtIsNull(Long idComprador);

    List<OrdenTransaccion> findByIdVendedorAndDeletedAtIsNull(Long idVendedor);

    Optional<OrdenTransaccion> findByNumeroOrden(String numeroOrden);

    List<OrdenTransaccion> findByEstadoPedido(EstadoPedido estado);

    boolean existsByIdCompradorAndIdVendedorAndEstadoPedidoIn(
            Long idComprador,
            Long idVendedor,
            List<EstadoPedido> estados);

    Page<OrdenTransaccion> findAllByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT o.estadoPedido, COUNT(o) FROM OrdenTransaccion o " +
           "WHERE o.deletedAt IS NULL GROUP BY o.estadoPedido")
    List<Object[]> countByEstado();

    // Contador para generar número de orden único por año
    @Query("SELECT COUNT(o) FROM OrdenTransaccion o " +
           "WHERE YEAR(o.fechaCreacion) = :year")
    long countByYear(@Param("year") int year);

    // Obtiene el máximo número de orden del año dado para evitar colisiones
    @Query("SELECT MAX(o.numeroOrden) FROM OrdenTransaccion o " +
           "WHERE o.numeroOrden LIKE CONCAT('AGF-', :year, '-%')")
    String findMaxNumeroOrdenByYear(@Param("year") int year);
}
