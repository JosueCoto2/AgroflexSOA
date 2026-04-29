package com.agroflex.orders.repository;

import com.agroflex.orders.model.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {

    List<ItemPedido> findByOrdenId(Long idOrden);
}
