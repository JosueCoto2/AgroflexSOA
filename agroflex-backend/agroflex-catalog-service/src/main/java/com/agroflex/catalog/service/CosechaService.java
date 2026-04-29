package com.agroflex.catalog.service;

import com.agroflex.catalog.dto.*;
import com.agroflex.catalog.exception.LoteNoEncontradoException;
import com.agroflex.catalog.model.CosechaLote;
import com.agroflex.catalog.repository.CosechaLoteRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CosechaService {

    private final CosechaLoteRepository cosechaLoteRepository;

    // ─── Consultas públicas ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CatalogoPageResponse obtenerCatalogo(LoteFiltrosRequest filtros) {
        Pageable pageable = buildPageable(filtros.ordenarPor(), filtros.page(), filtros.size());
        Specification<CosechaLote> spec = buildSpec(filtros);
        Page<CosechaLote> page = cosechaLoteRepository.findAll(spec, pageable);
        List<LoteResponse> lotes = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new CatalogoPageResponse(lotes, page.getNumber(), page.getTotalPages(),
                page.getTotalElements(), page.hasNext());
    }

    @Transactional(readOnly = true)
    public LoteResponse obtenerDetalleLote(Long idLote) {
        return cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(idLote)
                .map(this::toResponse)
                .orElseThrow(() -> new LoteNoEncontradoException(idLote));
    }

    @Transactional(readOnly = true)
    public CatalogoPageResponse buscarLotes(String query, int page, int size) {
        if (size <= 0 || size > 50) size = 12;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CosechaLote> result = cosechaLoteRepository.searchByText(query, pageable);
        List<LoteResponse> lotes = result.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new CatalogoPageResponse(lotes, result.getNumber(), result.getTotalPages(),
                result.getTotalElements(), result.hasNext());
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> obtenerMisLotes(Long idProductor) {
        return cosechaLoteRepository.findByIdProductorAndDeletedAtIsNull(idProductor)
                .stream().map(this::toResponse).toList();
    }

    // ─── Operaciones de escritura ─────────────────────────────────────────────

    @Transactional
    public LoteResponse publicarLote(LoteRequest req, Long idProductor, String nombreProductor, String fotoPerfilProductor) {
        CosechaLote lote = CosechaLote.builder()
                .idProductor(idProductor)
                .nombreProductor(nombreProductor)
                .fotoPerfilProductor(fotoPerfilProductor)
                .nombreProducto(req.getNombreProducto())
                .descripcion(req.getDescripcion())
                .precio(req.getPrecio())
                .imagenUrl(req.getImagenUrl())
                .ubicacion(req.getUbicacion())
                .cantidadDisponible(req.getCantidadDisponible())
                .unidadVenta(req.getUnidadVenta())
                .contacto(req.getContacto())
                .latitud(req.getLatitud())
                .longitud(req.getLongitud())
                .estadoLote("DISPONIBLE")
                .build();
        return toResponse(cosechaLoteRepository.save(lote));
    }

    @Transactional
    public LoteResponse actualizarLote(Long idLote, LoteRequest req, Long idProductor) {
        CosechaLote lote = cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(idLote)
                .orElseThrow(() -> new LoteNoEncontradoException(idLote));
        validarDuenio(lote, idProductor);

        lote.setNombreProducto(req.getNombreProducto());
        lote.setDescripcion(req.getDescripcion());
        lote.setPrecio(req.getPrecio());
        lote.setImagenUrl(req.getImagenUrl());
        lote.setUbicacion(req.getUbicacion());
        lote.setCantidadDisponible(req.getCantidadDisponible());
        lote.setUnidadVenta(req.getUnidadVenta());
        lote.setContacto(req.getContacto());
        lote.setLatitud(req.getLatitud());
        lote.setLongitud(req.getLongitud());

        return toResponse(cosechaLoteRepository.save(lote));
    }

    @Transactional
    public LoteResponse cambiarEstado(Long idLote, String nuevoEstado, Long idProductor) {
        CosechaLote lote = cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(idLote)
                .orElseThrow(() -> new LoteNoEncontradoException(idLote));
        validarDuenio(lote, idProductor);
        lote.setEstadoLote(nuevoEstado);
        return toResponse(cosechaLoteRepository.save(lote));
    }

    /**
     * Uso exclusivo interno: llamado desde orders-service cuando el pago se confirma.
     * No verifica propiedad del lote — solo permite transición a VENDIDO o DISPONIBLE.
     */
    @Transactional
    public void cambiarEstadoInterno(Long idLote, String nuevoEstado) {
        if (!"VENDIDO".equalsIgnoreCase(nuevoEstado) && !"DISPONIBLE".equalsIgnoreCase(nuevoEstado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Estado no permitido vía endpoint interno: " + nuevoEstado);
        }
        CosechaLote lote = cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(idLote)
                .orElseThrow(() -> new LoteNoEncontradoException(idLote));
        lote.setEstadoLote(nuevoEstado.toUpperCase());
        cosechaLoteRepository.save(lote);
    }

    @Transactional
    public void eliminarLote(Long idLote, Long idProductor) {
        CosechaLote lote = cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(idLote)
                .orElseThrow(() -> new LoteNoEncontradoException(idLote));
        validarDuenio(lote, idProductor);
        lote.setDeletedAt(LocalDateTime.now());
        cosechaLoteRepository.save(lote);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void validarDuenio(CosechaLote lote, Long idProductor) {
        if (!lote.getIdProductor().equals(idProductor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tienes permiso para modificar este lote");
        }
    }

    private LoteResponse toResponse(CosechaLote lote) {
        return new LoteResponse(
                lote.getIdLote(),
                lote.getNombreProducto(),
                lote.getDescripcion(),
                lote.getPrecio(),
                lote.getImagenUrl(),
                lote.getUbicacion(),
                lote.getCantidadDisponible(),
                lote.getUnidadVenta(),
                lote.getContacto(),
                lote.getEstadoLote(),
                lote.getIdProductor(),
                lote.getNombreProductor(),
                lote.getFotoPerfilProductor(),
                lote.getReputacionProductor(),
                lote.getCreatedAt(),
                lote.getLatitud(),
                lote.getLongitud()
        );
    }

    private Specification<CosechaLote> buildSpec(LoteFiltrosRequest f) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("estadoLote"), "DISPONIBLE"));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (f.precioMin() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("precio"), f.precioMin()));
            if (f.precioMax() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("precio"), f.precioMax()));
            if (f.unidadVenta() != null && !f.unidadVenta().isBlank())
                predicates.add(cb.equal(root.get("unidadVenta"), f.unidadVenta()));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Pageable buildPageable(String ordenarPor, int page, int size) {
        Sort sort = switch (ordenarPor) {
            case "precio_asc"  -> Sort.by(Sort.Direction.ASC,  "precio");
            case "precio_desc" -> Sort.by(Sort.Direction.DESC, "precio");
            default            -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        return PageRequest.of(page, size, sort);
    }
}
