package com.agroflex.orders.service;

import com.agroflex.orders.client.CatalogServiceClient;
import com.agroflex.orders.dto.LoteResponse;
import com.agroflex.orders.dto.OrderItemDto;
import com.agroflex.orders.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderValidationService {

    private final CatalogServiceClient catalogServiceClient;

    /**
     * Valida todos los items del request y retorna los datos actuales del catálogo.
     * Lanza excepción si alguna validación falla.
     *
     * @param items      lista de items del request
     * @param idComprador ID del comprador
     * @param idVendedor  ID del vendedor
     * @param authHeader  token Bearer para llamar al catalog-service
     * @return lista de LoteResponse con datos actuales (precios, stock, nombre)
     */
    public List<LoteResponse> validarItems(
            List<OrderItemDto> items, Long idComprador, Long idVendedor, String authHeader) {

        if (idComprador.equals(idVendedor)) {
            throw new IllegalArgumentException("El comprador no puede ser el mismo que el vendedor");
        }

        return items.stream().map(item -> {
            if (!"COSECHA_LOTE".equals(item.getTipoProducto())
                    && !"SUMINISTRO".equals(item.getTipoProducto())) {
                throw new IllegalArgumentException(
                        "Tipo de producto inválido: " + item.getTipoProducto()
                        + ". Debe ser COSECHA_LOTE o SUMINISTRO");
            }

            LoteResponse lote = catalogServiceClient.getLoteById(item.getIdProducto(), authHeader);

            if (!"DISPONIBLE".equalsIgnoreCase(lote.estadoLote())) {
                throw new IllegalStateException(
                        "El lote " + item.getIdProducto() + " no está disponible. Estado: "
                        + lote.estadoLote());
            }

            if (lote.cantidadDisponible() == null
                    || lote.cantidadDisponible().compareTo(item.getCantidad()) < 0) {
                throw new InsufficientStockException(
                        item.getIdProducto(),
                        lote.cantidadDisponible() != null ? lote.cantidadDisponible() : BigDecimal.ZERO,
                        item.getCantidad());
            }

            log.debug("Item validado: lote={}, cantidad={}, precio={}",
                    item.getIdProducto(), item.getCantidad(), lote.precioUnitario());
            return lote;
        }).toList();
    }

    /**
     * Calcula el total de la orden a partir de items y sus precios del catálogo.
     */
    public BigDecimal calcularTotal(List<OrderItemDto> items, List<LoteResponse> lotes) {
        BigDecimal total = BigDecimal.ZERO;
        for (int i = 0; i < items.size(); i++) {
            BigDecimal subtotal = items.get(i).getCantidad()
                    .multiply(lotes.get(i).precioUnitario());
            total = total.add(subtotal);
        }
        return total;
    }
}
