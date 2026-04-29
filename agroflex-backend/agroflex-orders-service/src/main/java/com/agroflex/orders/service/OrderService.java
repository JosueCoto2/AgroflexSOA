package com.agroflex.orders.service;

import com.agroflex.orders.client.CatalogServiceClient;
import com.agroflex.orders.client.QrServiceClient;
import com.agroflex.orders.dto.*;
import com.agroflex.orders.exception.OrderNotFoundException;
import com.agroflex.orders.model.EstadoPedido;
import com.agroflex.orders.model.ItemPedido;
import com.agroflex.orders.model.OrdenTransaccion;
import com.agroflex.orders.repository.OrdenTransaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.agroflex.orders.security.JwtAuthUser;

import java.math.BigDecimal;
import java.time.Year;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrdenTransaccionRepository ordenRepository;
    private final OrderValidationService validationService;
    private final EscrowService escrowService;
    private final QrServiceClient qrServiceClient;
    private final CatalogServiceClient catalogServiceClient;
    private final OrderNotificationService notificationService;

    // Transiciones de estado permitidas
    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES_VALIDAS = Map.of(
            EstadoPedido.PENDIENTE,      EnumSet.of(EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO, EstadoPedido.DISPUTADO),
            EstadoPedido.CONFIRMADO,     EnumSet.of(EstadoPedido.EN_TRANSITO, EstadoPedido.CANCELADO, EstadoPedido.DISPUTADO, EstadoPedido.REEMBOLSADO),
            EstadoPedido.EN_TRANSITO,    EnumSet.of(EstadoPedido.LISTO_ENTREGA, EstadoPedido.CANCELADO, EstadoPedido.DISPUTADO),
            EstadoPedido.LISTO_ENTREGA,  EnumSet.of(EstadoPedido.ENTREGADO, EstadoPedido.DISPUTADO),
            EstadoPedido.ENTREGADO,      EnumSet.of(EstadoPedido.COMPLETADO, EstadoPedido.DISPUTADO),
            EstadoPedido.COMPLETADO,     EnumSet.noneOf(EstadoPedido.class),
            EstadoPedido.CANCELADO,      EnumSet.noneOf(EstadoPedido.class),
            EstadoPedido.DISPUTADO,      EnumSet.of(EstadoPedido.COMPLETADO, EstadoPedido.REEMBOLSADO),
            EstadoPedido.REEMBOLSADO,    EnumSet.noneOf(EstadoPedido.class)
    );

    @Transactional
    public OrderResponse crearOrden(CreateOrderRequest request, Long idComprador, String authHeader) {
        // 1. Validar items contra el catalog-service
        List<LoteResponse> lotes = validationService.validarItems(
            request.getItems(), idComprador, request.getIdVendedor(), authHeader);

        // 2. Calcular total
        BigDecimal totalMonto = validationService.calcularTotal(request.getItems(), lotes);

        // 3. Generar número de orden único
        String numeroOrden = generarNumeroOrden();

        // 4. Crear la entidad OrdenTransaccion
        OrdenTransaccion orden = OrdenTransaccion.builder()
            .numeroOrden(numeroOrden)
            .idComprador(idComprador)
            .idVendedor(request.getIdVendedor())
            .estadoPedido(EstadoPedido.PENDIENTE)
            .totalMonto(totalMonto)
            .montoEscrow(BigDecimal.ZERO)
            .metodoPago(request.getMetodoPago() != null ? request.getMetodoPago() : "STRIPE")
            .observaciones(request.getObservaciones())
            .latitudEntrega(request.getLatitudEntrega())
            .longitudEntrega(request.getLongitudEntrega())
            .build();

        // 5. Crear items con snapshot de precio y nombre
        List<ItemPedido> items = buildItems(request.getItems(), lotes, orden);
        orden.setItems(items);

        // 6. Guardar en base de datos
        OrdenTransaccion ordenGuardada = ordenRepository.save(orden);
        log.info("Orden creada: {} — comprador={}, vendedor={}, total={}",
            numeroOrden, idComprador, request.getIdVendedor(), totalMonto);

        // Mejoras: recolectar advertencias
        List<String> warnings = new java.util.ArrayList<>();

        // 7. Intentar retener pago en escrow — si falla, no rompe el flujo
        boolean pagoConfirmado = false;
        try {
            String paymentIntentId = escrowService.retenerPago(ordenGuardada, authHeader);
            if (paymentIntentId != null) {
                ordenGuardada.setIdTransaccionPago(paymentIntentId);
                ordenGuardada.setEstadoPedido(EstadoPedido.CONFIRMADO);
                ordenGuardada.setMontoEscrow(ordenGuardada.getTotalMonto());
                pagoConfirmado = true;
            } else {
                warnings.add("El pago no pudo ser retenido. Debes completarlo más tarde.");
            }
        } catch (Exception e) {
            log.warn("No se pudo retener pago al crear orden {}: {}", numeroOrden, e.getMessage());
            warnings.add("No se pudo retener el pago automáticamente. Debes completarlo más tarde.");
        }

        // 7b. Si el pago fue confirmado, marcar cada lote como VENDIDO en el catálogo
        if (pagoConfirmado) {
            for (ItemPedido item : ordenGuardada.getItems()) {
                try {
                    catalogServiceClient.actualizarEstadoSistema(
                            item.getIdProducto(),
                            java.util.Map.of("estado", "VENDIDO"),
                            authHeader);
                    log.info("Lote {} marcado como VENDIDO tras confirmar orden {}",
                            item.getIdProducto(), numeroOrden);
                } catch (Exception e) {
                    log.warn("No se pudo marcar como VENDIDO el lote {} — orden {}: {}",
                            item.getIdProducto(), numeroOrden, e.getMessage());
                    warnings.add("El producto '" + item.getNombreProducto() + "' aún aparece disponible en catálogo. Se actualizará pronto.");
                }
            }
        }

        // 8. Intentar generar QR para la entrega — si falla, no rompe el flujo
        boolean qrGenerado = false;
        try {
            QrGenerateRequest qrRequest = QrGenerateRequest.builder()
                    .idOrden(ordenGuardada.getId())
                    .numeroOrden(numeroOrden)
                    .idVendedor(request.getIdVendedor())
                    .idComprador(idComprador)
                    .latitudEntrega(request.getLatitudEntrega())
                    .longitudEntrega(request.getLongitudEntrega())
                    .build();
            qrServiceClient.generateQr(qrRequest, authHeader);
            qrGenerado = true;
        } catch (Exception e) {
            log.warn("No se pudo generar QR para orden {}: {}", numeroOrden, e.getMessage());
            warnings.add("No se pudo generar el QR de entrega automáticamente. Solicítalo manualmente.");
        }

        // 9. Notificar al vendedor y al comprador
        notificationService.notificarOrdenCreada(ordenGuardada);
        if (qrGenerado) {
            String correoComprador = null;
            try {
                Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                if (principal instanceof JwtAuthUser jwtUser) {
                    correoComprador = jwtUser.getUsername();
                }
            } catch (Exception ignored) {}
            notificationService.notificarQrGenerado(ordenGuardada, idComprador, correoComprador);
        }

        return toResponse(ordenGuardada, warnings);
    }

    @Transactional(readOnly = true)
    public OrderResponse obtenerOrden(Long id) {
        OrdenTransaccion orden = ordenRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return toResponse(orden);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> misPedidos(Long idUsuario, String rol) {
        List<OrdenTransaccion> ordenes;
        if ("COMPRADOR".equalsIgnoreCase(rol) || "EMPAQUE".equalsIgnoreCase(rol)) {
            ordenes = ordenRepository.findByIdCompradorAndDeletedAtIsNull(idUsuario);
        } else {
            ordenes = ordenRepository.findByIdVendedorAndDeletedAtIsNull(idUsuario);
        }
        return ordenes.stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse actualizarEstado(Long idOrden, OrderStatusUpdateDto dto, Long idUsuario, String authHeader) {
        OrdenTransaccion orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new OrderNotFoundException(idOrden));

        EstadoPedido estadoNuevo;
        try {
            estadoNuevo = EstadoPedido.valueOf(dto.getNuevoEstado().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado inválido: " + dto.getNuevoEstado());
        }

        EstadoPedido estadoActual = orden.getEstadoPedido();
        Set<EstadoPedido> permitidos = TRANSICIONES_VALIDAS.getOrDefault(estadoActual, EnumSet.noneOf(EstadoPedido.class));

        if (!permitidos.contains(estadoNuevo)) {
            throw new IllegalStateException(
                    "Transición inválida: " + estadoActual + " → " + estadoNuevo +
                    ". Transiciones permitidas: " + permitidos);
        }

        if ((estadoNuevo == EstadoPedido.CANCELADO || estadoNuevo == EstadoPedido.DISPUTADO)
                && (dto.getMotivo() == null || dto.getMotivo().isBlank())) {
            throw new IllegalArgumentException("El motivo es obligatorio para CANCELADO o DISPUTADO");
        }

        orden.setEstadoPedido(estadoNuevo);
        OrdenTransaccion guardada = ordenRepository.save(orden);

        // Si la orden llega a ENTREGADO, liberar escrow automáticamente
        if (estadoNuevo == EstadoPedido.ENTREGADO) {
            try {
                escrowService.liberarPago(idOrden, authHeader);
            } catch (Exception e) {
                log.warn("No se pudo liberar pago automáticamente para orden {}: {}",
                        orden.getNumeroOrden(), e.getMessage());
            }
        }

        log.info("Estado de orden {} actualizado: {} → {} por usuario {}",
                orden.getNumeroOrden(), estadoActual, estadoNuevo, idUsuario);
        return toResponse(guardada);
    }

    @Transactional
    public void cancelarOrden(Long idOrden, Long idUsuario, String motivo, String authHeader) {
        OrdenTransaccion orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new OrderNotFoundException(idOrden));

        Set<EstadoPedido> cancelables = EnumSet.of(
                EstadoPedido.PENDIENTE, EstadoPedido.CONFIRMADO, EstadoPedido.EN_TRANSITO);

        if (!cancelables.contains(orden.getEstadoPedido())) {
            throw new IllegalStateException(
                    "No se puede cancelar una orden en estado: " + orden.getEstadoPedido());
        }

        // Intentar reembolso si ya hay pago retenido
        if (orden.getEstadoPedido() == EstadoPedido.CONFIRMADO
                || orden.getEstadoPedido() == EstadoPedido.EN_TRANSITO) {
            try {
                escrowService.reembolsarPago(idOrden, motivo, authHeader);
            } catch (Exception e) {
                log.warn("Reembolso fallido al cancelar orden {}: {}", orden.getNumeroOrden(), e.getMessage());
            }
        }

        orden.setEstadoPedido(EstadoPedido.CANCELADO);
        ordenRepository.save(orden);
        log.info("Orden {} cancelada por usuario {}: {}", orden.getNumeroOrden(), idUsuario, motivo);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listarPorEstado(EstadoPedido estado, Pageable pageable) {
        return ordenRepository.findByEstadoPedido(estado) // simple, sin paginación directa
                .stream()
                .map(this::toResponse)
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(
                                list, pageable, list.size())));
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse obtenerEstadisticas() {
        List<Object[]> counts = ordenRepository.countByEstado();
        long total = ordenRepository.count();
        Map<String, Long> porEstado = counts.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]));
        return new OrderStatsResponse(total, porEstado);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generarNumeroOrden() {
        int año = Year.now().getValue();
        String prefix = String.format("AGF-%d-", año);
        String maxOrden = ordenRepository.findMaxNumeroOrdenByYear(año);
        long next;
        if (maxOrden != null && maxOrden.startsWith(prefix)) {
            try {
                next = Long.parseLong(maxOrden.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                next = ordenRepository.countByYear(año) + 1;
            }
        } else {
            next = 1;
        }
        return String.format("AGF-%d-%06d", año, next);
    }

    private List<ItemPedido> buildItems(
            List<OrderItemDto> itemDtos, List<LoteResponse> lotes, OrdenTransaccion orden) {

        return java.util.stream.IntStream.range(0, itemDtos.size())
            .mapToObj(i -> {
                OrderItemDto dto = itemDtos.get(i);
                LoteResponse lote = lotes.get(i);
                BigDecimal precio = lote.precioUnitario();
                BigDecimal subtotal = dto.getCantidad().multiply(precio);

                return ItemPedido.builder()
                    .orden(orden)
                    .idProducto(dto.getIdProducto())
                    .tipoProducto(dto.getTipoProducto())
                    .cantidad(dto.getCantidad())
                    .precioUnitario(precio)
                    .subtotal(subtotal)
                    .nombreProducto(lote.titulo())
                    .unidadVenta(lote.unidadVenta())
                    .build();
            })
            .toList();
    }

    private OrderResponse toResponse(OrdenTransaccion orden) {
        return toResponse(orden, List.of());
    }

    private OrderResponse toResponse(OrdenTransaccion orden, List<String> warnings) {
        List<OrderItemDto> itemDtos = orden.getItems() == null ? List.of() :
            orden.getItems().stream().map(item -> OrderItemDto.builder()
                .idProducto(item.getIdProducto())
                .tipoProducto(item.getTipoProducto())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(item.getSubtotal())
                .nombreProducto(item.getNombreProducto())
                .unidadVenta(item.getUnidadVenta())
                .build()).toList();

        return new OrderResponse(
            orden.getId(),
            orden.getNumeroOrden(),
            orden.getIdComprador(),
            null, // nombreComprador — se resolvería con users-service
            orden.getIdVendedor(),
            null, // nombreVendedor — se resolvería con users-service
            orden.getEstadoPedido() != null ? orden.getEstadoPedido().name() : null,
            orden.getTotalMonto(),
            orden.getMontoEscrow(),
            orden.getMetodoPago(),
            orden.getIdTransaccionPago(),
            itemDtos,
            orden.getObservaciones(),
            orden.getLatitudEntrega(),
            orden.getLongitudEntrega(),
            orden.getFechaCreacion(),
            orden.getFechaActualizacion(),
            warnings
        );
        }
}
