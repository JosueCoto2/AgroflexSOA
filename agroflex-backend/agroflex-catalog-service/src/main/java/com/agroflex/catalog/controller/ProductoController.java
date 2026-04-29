package com.agroflex.catalog.controller;

import com.agroflex.catalog.dto.CrearProductoRequest;
import com.agroflex.catalog.dto.ProductoResumenDTO;
import com.agroflex.catalog.security.JwtAuthPrincipal;
import com.agroflex.catalog.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    /**
     * GET /api/productos
     * Público — lista paginada con filtros opcionales.
     */
    @GetMapping
    public ResponseEntity<Page<ProductoResumenDTO>> getAll(
            @RequestParam(defaultValue = "0")         int page,
            @RequestParam(defaultValue = "12")        int size,
            @RequestParam(required = false)           String tipo,
            @RequestParam(required = false)           String buscar,
            @RequestParam(required = false)           String municipio,
            @RequestParam(defaultValue = "recientes") String orden) {

        return ResponseEntity.ok(
                productoService.getProductos(page, size, tipo, buscar, municipio, orden));
    }

    /**
     * GET /api/productos/destacados
     * Público — devuelve hasta 5 productos destacados para el carrusel.
     */
    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoResumenDTO>> getDestacados() {
        return ResponseEntity.ok(productoService.getDestacados());
    }

    /**
     * GET /api/productos/{id}
     * Público — detalle de un producto.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResumenDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getById(id));
    }

    /**
     * POST /api/productos
     * Protegido — solo PRODUCTOR, INVERNADERO, PROVEEDOR o ADMIN pueden publicar.
     * Los datos del vendedor se extraen del JWT para evitar que el cliente los falsifique.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('PRODUCTOR','INVERNADERO','PROVEEDOR','ADMIN')")
    public ResponseEntity<ProductoResumenDTO> crear(
            @Valid @RequestBody CrearProductoRequest request,
            Authentication authentication) {

        JwtAuthPrincipal principal = (JwtAuthPrincipal) authentication.getPrincipal();

        // Determinar el rol vendedor principal (el más relevante del JWT)
        String rolVendedor = resolverRolVendedor(principal.roles());

        ProductoResumenDTO creado = productoService.crear(
                request,
                principal.idUsuario(),
                principal.nombre() != null ? principal.nombre() : principal.correo(),
                rolVendedor
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /** Selecciona el rol vendedor más relevante de la lista de roles del JWT. */
    private String resolverRolVendedor(List<String> roles) {
        for (String r : List.of("ADMIN", "PRODUCTOR", "INVERNADERO", "PROVEEDOR")) {
            if (roles.contains(r)) return r;
        }
        return roles.isEmpty() ? "DESCONOCIDO" : roles.get(0);
    }
}
