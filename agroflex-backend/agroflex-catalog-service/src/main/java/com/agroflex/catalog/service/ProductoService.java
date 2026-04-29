package com.agroflex.catalog.service;

import com.agroflex.catalog.dto.CrearProductoRequest;
import com.agroflex.catalog.dto.ProductoResumenDTO;
import com.agroflex.catalog.model.Producto;
import com.agroflex.catalog.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    // ── Listar con filtros y paginación
    public Page<ProductoResumenDTO> getProductos(int page, int size,
                                                  String tipo, String buscar,
                                                  String municipio, String orden) {
        Specification<Producto> spec = isActivo();

        if (tipo != null && !tipo.isBlank())       spec = spec.and(tipoEquals(tipo));
        if (buscar != null && !buscar.isBlank())   spec = spec.and(buscarLike(buscar));
        if (municipio != null && !municipio.isBlank()) spec = spec.and(municipioLike(municipio));

        Sort sort = switch (orden != null ? orden : "recientes") {
            case "precio_asc"  -> Sort.by("precio").ascending();
            case "precio_desc" -> Sort.by("precio").descending();
            default            -> Sort.by("createdAt").descending();
        };

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);
        return productoRepository.findAll(spec, pageable).map(ProductoResumenDTO::from);
    }

    // ── Detalle por ID
    public ProductoResumenDTO getById(Long id) {
        return productoRepository.findByIdProductoAndActivoTrue(id)
                .map(ProductoResumenDTO::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    // ── Destacados para el carrusel
    public List<ProductoResumenDTO> getDestacados() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        return productoRepository.findByDestacadoTrueAndActivoTrue(pageable)
                .stream()
                .map(ProductoResumenDTO::from)
                .toList();
    }

    // ── Publicar nuevo producto (vendedor autenticado)
    public ProductoResumenDTO crear(CrearProductoRequest req,
                                    Long idVendedor, String nombreVendedor, String rolVendedor) {
        Producto producto = Producto.builder()
                .tipo(req.tipo())
                .nombre(req.nombre())
                .descripcion(req.descripcion())
                .precio(req.precio())
                .unidad(req.unidad())
                .stock(req.stock())
                .municipio(req.municipio())
                .estadoRepublica(req.estadoRepublica())
                .imagenPrincipal(req.imagenPrincipal())
                .idVendedor(idVendedor)
                .nombreVendedor(nombreVendedor)
                .rolVendedor(rolVendedor)
                .build();

        return ProductoResumenDTO.from(productoRepository.save(producto));
    }

    // ── Specifications para filtrado dinámico

    private Specification<Producto> isActivo() {
        return (root, q, cb) -> cb.isTrue(root.get("activo"));
    }

    private Specification<Producto> tipoEquals(String tipo) {
        return (root, q, cb) -> cb.equal(root.get("tipo"), tipo);
    }

    private Specification<Producto> buscarLike(String buscar) {
        String pattern = "%" + buscar.toLowerCase() + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("nombre")),         pattern),
                cb.like(cb.lower(root.get("municipio")),      pattern),
                cb.like(cb.lower(root.get("nombreVendedor")), pattern)
        );
    }

    private Specification<Producto> municipioLike(String municipio) {
        return (root, q, cb) ->
                cb.like(cb.lower(root.get("municipio")), "%" + municipio.toLowerCase() + "%");
    }
}
