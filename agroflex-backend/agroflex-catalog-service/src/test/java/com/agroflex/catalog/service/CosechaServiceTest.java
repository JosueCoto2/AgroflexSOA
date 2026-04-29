package com.agroflex.catalog.service;

import com.agroflex.catalog.dto.*;
import com.agroflex.catalog.exception.LoteNoEncontradoException;
import com.agroflex.catalog.model.CosechaLote;
import com.agroflex.catalog.repository.CosechaLoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CosechaServiceTest {

    @Mock private CosechaLoteRepository cosechaLoteRepository;

    @InjectMocks
    private CosechaService cosechaService;

    private CosechaLote loteDisponible;
    private CosechaLote loteEliminado;

    @BeforeEach
    void setUp() {
        loteDisponible = CosechaLote.builder()
                .idLote(1L)
                .idProductor(10L)
                .nombreProductor("Juan Pérez")
                .nombreProducto("Tomates Cherry Premium")
                .descripcion("Tomates de primera calidad")
                .precio(new BigDecimal("25.00"))
                .imagenUrl("https://img.example.com/tomate.jpg")
                .ubicacion("Zapopan, Jalisco")
                .cantidadDisponible(new BigDecimal("500.000"))
                .unidadVenta("kg")
                .contacto("juan@example.com")
                .estadoLote("DISPONIBLE")
                .reputacionProductor(new BigDecimal("4.5"))
                .build();

        loteEliminado = CosechaLote.builder()
                .idLote(2L)
                .idProductor(10L)
                .nombreProducto("Lote eliminado")
                .precio(new BigDecimal("10.00"))
                .estadoLote("DISPONIBLE")
                .deletedAt(LocalDateTime.now())
                .build();
    }

    // ─── obtenerCatalogo ──────────────────────────────────────────────────────

    @Test
    void obtenerCatalogo_retornaLotesDisponibles() {
        Page<CosechaLote> page = new PageImpl<>(List.of(loteDisponible));
        when(cosechaLoteRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        LoteFiltrosRequest filtros = new LoteFiltrosRequest(null, null, null, "fecha_desc", 0, 12);
        CatalogoPageResponse response = cosechaService.obtenerCatalogo(filtros);

        assertThat(response.lotes()).hasSize(1);
        assertThat(response.lotes().get(0).nombreProducto()).isEqualTo("Tomates Cherry Premium");
        assertThat(response.totalElementos()).isEqualTo(1);
        assertThat(response.paginaActual()).isEqualTo(0);
        assertThat(response.hayMas()).isFalse();
    }

    @Test
    void obtenerCatalogo_listaVacia_cuandoNoHayLotes() {
        when(cosechaLoteRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        LoteFiltrosRequest filtros = new LoteFiltrosRequest(null, null, null, "fecha_desc", 0, 12);
        CatalogoPageResponse response = cosechaService.obtenerCatalogo(filtros);

        assertThat(response.lotes()).isEmpty();
        assertThat(response.totalElementos()).isZero();
    }

    @Test
    void obtenerCatalogo_conFiltros_pasaPageableConOrdenPrecioAsc() {
        Page<CosechaLote> page = new PageImpl<>(List.of(loteDisponible));
        when(cosechaLoteRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        LoteFiltrosRequest filtros = new LoteFiltrosRequest(
                new BigDecimal("10"), new BigDecimal("100"), "kg", "precio_asc", 0, 5);
        CatalogoPageResponse response = cosechaService.obtenerCatalogo(filtros);

        assertThat(response.lotes()).hasSize(1);
        verify(cosechaLoteRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void obtenerCatalogo_sizeInvalido_usaDefault12() {
        Page<CosechaLote> page = new PageImpl<>(List.of());
        when(cosechaLoteRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        // size=0 → compact constructor normaliza a 12
        LoteFiltrosRequest filtros = new LoteFiltrosRequest(null, null, null, null, 0, 0);
        cosechaService.obtenerCatalogo(filtros);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(cosechaLoteRepository).findAll(any(Specification.class), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(12);
    }

    // ─── obtenerDetalleLote ───────────────────────────────────────────────────

    @Test
    void obtenerDetalleLote_exitoso() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));

        LoteResponse response = cosechaService.obtenerDetalleLote(1L);

        assertThat(response.idLote()).isEqualTo(1L);
        assertThat(response.nombreProducto()).isEqualTo("Tomates Cherry Premium");
        assertThat(response.precio()).isEqualByComparingTo("25.00");
        assertThat(response.idProductor()).isEqualTo(10L);
        assertThat(response.nombreProductor()).isEqualTo("Juan Pérez");
        assertThat(response.estadoLote()).isEqualTo("DISPONIBLE");
    }

    @Test
    void obtenerDetalleLote_loteNoExiste_lanzaExcepcion() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> cosechaService.obtenerDetalleLote(999L))
                .isInstanceOf(LoteNoEncontradoException.class)
                .hasMessageContaining("999");
    }

    // ─── buscarLotes ──────────────────────────────────────────────────────────

    @Test
    void buscarLotes_retornaResultados() {
        Page<CosechaLote> page = new PageImpl<>(List.of(loteDisponible));
        when(cosechaLoteRepository.searchByText(eq("tomate"), any(Pageable.class)))
                .thenReturn(page);

        CatalogoPageResponse response = cosechaService.buscarLotes("tomate", 0, 12);

        assertThat(response.lotes()).hasSize(1);
        assertThat(response.lotes().get(0).nombreProducto()).isEqualTo("Tomates Cherry Premium");
    }

    @Test
    void buscarLotes_sinResultados_retornaListaVacia() {
        when(cosechaLoteRepository.searchByText(anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        CatalogoPageResponse response = cosechaService.buscarLotes("xyz_inexistente", 0, 12);

        assertThat(response.lotes()).isEmpty();
        assertThat(response.totalElementos()).isZero();
    }

    @Test
    void buscarLotes_sizeInvalido_usaDefault12() {
        when(cosechaLoteRepository.searchByText(anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        cosechaService.buscarLotes("query", 0, 0);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(cosechaLoteRepository).searchByText(eq("query"), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(12);
    }

    // ─── obtenerMisLotes ──────────────────────────────────────────────────────

    @Test
    void obtenerMisLotes_retornaLotesDelProductor() {
        when(cosechaLoteRepository.findByIdProductorAndDeletedAtIsNull(10L))
                .thenReturn(List.of(loteDisponible));

        List<LoteResponse> result = cosechaService.obtenerMisLotes(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).idProductor()).isEqualTo(10L);
        assertThat(result.get(0).nombreProducto()).isEqualTo("Tomates Cherry Premium");
    }

    @Test
    void obtenerMisLotes_productorSinLotes_retornaListaVacia() {
        when(cosechaLoteRepository.findByIdProductorAndDeletedAtIsNull(99L))
                .thenReturn(List.of());

        List<LoteResponse> result = cosechaService.obtenerMisLotes(99L);

        assertThat(result).isEmpty();
    }

    // ─── publicarLote ─────────────────────────────────────────────────────────

    @Test
    void publicarLote_exitoso_guardaYRetornaResponse() {
        when(cosechaLoteRepository.save(any(CosechaLote.class)))
                .thenAnswer(inv -> {
                    CosechaLote l = inv.getArgument(0);
                    l.setIdLote(99L);
                    return l;
                });

        LoteRequest request = buildLoteRequest("Lote test", new BigDecimal("20.00"), "kg",
                new BigDecimal("100"), "Guadalajara, Jalisco");
        LoteResponse response = cosechaService.publicarLote(request, 10L, "Juan Pérez", null);

        assertThat(response.idLote()).isEqualTo(99L);
        assertThat(response.nombreProducto()).isEqualTo("Lote test");
        assertThat(response.estadoLote()).isEqualTo("DISPONIBLE");
        assertThat(response.nombreProductor()).isEqualTo("Juan Pérez");
        assertThat(response.idProductor()).isEqualTo(10L);
        verify(cosechaLoteRepository, times(1)).save(any(CosechaLote.class));
    }

    @Test
    void publicarLote_persisteCamposCorrectamente() {
        when(cosechaLoteRepository.save(any(CosechaLote.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LoteRequest request = buildLoteRequest("Aguacate Hass", new BigDecimal("45.00"), "tonelada",
                new BigDecimal("2.500"), "Michoacán");
        cosechaService.publicarLote(request, 5L, "María López", null);

        ArgumentCaptor<CosechaLote> captor = ArgumentCaptor.forClass(CosechaLote.class);
        verify(cosechaLoteRepository).save(captor.capture());

        CosechaLote guardado = captor.getValue();
        assertThat(guardado.getNombreProducto()).isEqualTo("Aguacate Hass");
        assertThat(guardado.getPrecio()).isEqualByComparingTo("45.00");
        assertThat(guardado.getUnidadVenta()).isEqualTo("tonelada");
        assertThat(guardado.getIdProductor()).isEqualTo(5L);
        assertThat(guardado.getNombreProductor()).isEqualTo("María López");
        assertThat(guardado.getEstadoLote()).isEqualTo("DISPONIBLE");
    }

    // ─── actualizarLote ───────────────────────────────────────────────────────

    @Test
    void actualizarLote_exitoso_cuandoEsDuenio() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));
        when(cosechaLoteRepository.save(any(CosechaLote.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LoteRequest request = buildLoteRequest("Tomates Actualizados", new BigDecimal("30.00"),
                "kg", new BigDecimal("400"), "Tonalá, Jalisco");
        LoteResponse response = cosechaService.actualizarLote(1L, request, 10L);

        assertThat(response.nombreProducto()).isEqualTo("Tomates Actualizados");
        assertThat(response.precio()).isEqualByComparingTo("30.00");
        verify(cosechaLoteRepository).save(any(CosechaLote.class));
    }

    @Test
    void actualizarLote_falla_cuandoNoEsDuenio() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));

        LoteRequest request = buildLoteRequest("Intento", new BigDecimal("10"), "kg",
                new BigDecimal("50"), "Lugar");

        assertThatThrownBy(() -> cosechaService.actualizarLote(1L, request, 99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("permiso");

        verify(cosechaLoteRepository, never()).save(any());
    }

    @Test
    void actualizarLote_falla_cuandoLoteNoExiste() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(999L))
                .thenReturn(Optional.empty());

        LoteRequest request = buildLoteRequest("x", BigDecimal.ONE, "kg", BigDecimal.ONE, "x");

        assertThatThrownBy(() -> cosechaService.actualizarLote(999L, request, 10L))
                .isInstanceOf(LoteNoEncontradoException.class);
    }

    // ─── cambiarEstado ────────────────────────────────────────────────────────

    @Test
    void cambiarEstado_exitoso_cuandoEsDuenio() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));
        when(cosechaLoteRepository.save(any(CosechaLote.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LoteResponse response = cosechaService.cambiarEstado(1L, "VENDIDO", 10L);

        assertThat(response.estadoLote()).isEqualTo("VENDIDO");
        verify(cosechaLoteRepository).save(any(CosechaLote.class));
    }

    @Test
    void cambiarEstado_falla_cuandoNoEsDuenio() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));

        assertThatThrownBy(() -> cosechaService.cambiarEstado(1L, "VENDIDO", 55L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("permiso");

        verify(cosechaLoteRepository, never()).save(any());
    }

    // ─── eliminarLote ─────────────────────────────────────────────────────────

    @Test
    void eliminarLote_exitoso_marcaDeletedAt() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));
        when(cosechaLoteRepository.save(any(CosechaLote.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        cosechaService.eliminarLote(1L, 10L);

        ArgumentCaptor<CosechaLote> captor = ArgumentCaptor.forClass(CosechaLote.class);
        verify(cosechaLoteRepository).save(captor.capture());
        assertThat(captor.getValue().getDeletedAt()).isNotNull();
    }

    @Test
    void eliminarLote_falla_cuandoNoEsDuenio() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(loteDisponible));

        assertThatThrownBy(() -> cosechaService.eliminarLote(1L, 88L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("permiso");

        verify(cosechaLoteRepository, never()).save(any());
    }

    @Test
    void eliminarLote_falla_cuandoLoteNoExiste() {
        when(cosechaLoteRepository.findByIdLoteAndDeletedAtIsNull(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> cosechaService.eliminarLote(999L, 10L))
                .isInstanceOf(LoteNoEncontradoException.class);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private LoteRequest buildLoteRequest(String nombreProducto, BigDecimal precio,
                                          String unidadVenta, BigDecimal cantidad,
                                          String ubicacion) {
        LoteRequest r = new LoteRequest();
        r.setNombreProducto(nombreProducto);
        r.setPrecio(precio);
        r.setUnidadVenta(unidadVenta);
        r.setCantidadDisponible(cantidad);
        r.setUbicacion(ubicacion);
        return r;
    }
}
