package com.agroflex.admin.service;

import com.agroflex.admin.dto.ProductoAdminDTO;
import com.agroflex.admin.model.Producto;
import com.agroflex.admin.repository.AdminProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminCatalogoService {

    private final AdminProductoRepository productoRepository;

    public Page<ProductoAdminDTO> listar(String tipo, Boolean activo, String buscar, Pageable pageable) {
        return productoRepository.findByFiltros(tipo, activo, buscar, pageable)
                .map(this::toDTO);
    }

    public ProductoAdminDTO getById(Long id) {
        return productoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    public void eliminar(Long id, String motivo) {
        Producto p = findOrThrow(id);
        productoRepository.delete(p);
        // TODO: notificar al vendedor (Twilio)
    }

    public ProductoAdminDTO suspender(Long id, String motivo) {
        Producto p = findOrThrow(id);
        p.setActivo(false);
        return toDTO(productoRepository.save(p));
    }

    public ProductoAdminDTO restaurar(Long id) {
        Producto p = findOrThrow(id);
        p.setActivo(true);
        return toDTO(productoRepository.save(p));
    }

    private Producto findOrThrow(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private ProductoAdminDTO toDTO(Producto p) {
        return ProductoAdminDTO.builder()
                .id(p.getIdProducto())
                .tipo(p.getTipo())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .unidad(p.getUnidad())
                .stock(p.getStock())
                .disponibilidad(p.getDisponibilidad())
                .municipio(p.getMunicipio())
                .estadoRepublica(p.getEstadoRepublica())
                .imagenPrincipal(p.getImagenPrincipal())
                .idVendedor(p.getIdVendedor())
                .nombreVendedor(p.getNombreVendedor())
                .rolVendedor(p.getRolVendedor())
                .vendedorVerificado(p.getVendedorVerificado())
                .activo(p.getActivo())
                .destacado(p.getDestacado())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
