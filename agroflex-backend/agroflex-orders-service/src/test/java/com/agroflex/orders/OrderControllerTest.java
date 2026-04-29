package com.agroflex.orders;

import com.agroflex.orders.controller.OrderController;
import com.agroflex.orders.dto.CreateOrderRequest;
import com.agroflex.orders.dto.OrderItemDto;
import com.agroflex.orders.dto.OrderResponse;
import com.agroflex.orders.exception.GlobalExceptionHandler;
import com.agroflex.orders.exception.OrderNotFoundException;
import com.agroflex.orders.security.JwtAuthUser;
import com.agroflex.orders.service.EscrowService;
import com.agroflex.orders.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private OrderService orderService;

    @Mock
    private EscrowService escrowService;

    @InjectMocks
    private OrderController orderController;

    private static final Long ID_COMPRADOR = 1L;
    private static final Long ID_VENDEDOR = 2L;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(orderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Para LocalDateTime

        // Autenticar usuario en el SecurityContext
        autenticarUsuario(ID_COMPRADOR, "comprador@test.com", List.of("COMPRADOR"));
    }

    @Test
    @DisplayName("POST /api/orders — retorna 201 con datos válidos")
    void test_crearOrden_retorna201_cuandoDatosValidos() throws Exception {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .idVendedor(ID_VENDEDOR)
                .items(List.of(
                        OrderItemDto.builder()
                                .idProducto(10L)
                                .tipoProducto("COSECHA_LOTE")
                                .cantidad(new BigDecimal("5"))
                                .build()
                ))
                .build();

        OrderResponse response = buildOrderResponse();
        when(orderService.crearOrden(any(), eq(ID_COMPRADOR), any())).thenReturn(response);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numeroOrden").value("AGF-2026-000001"))
                .andExpect(jsonPath("$.estadoPedido").value("PENDIENTE"));
    }

    @Test
    @DisplayName("POST /api/orders — retorna 400 cuando body inválido (sin items)")
    void test_crearOrden_retorna400_cuandoBodyInvalido() throws Exception {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .idVendedor(ID_VENDEDOR)
                .items(List.of()) // lista vacía — inválida
                .build();

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("AF-ORD-400"));
    }

    @Test
    @DisplayName("GET /api/orders/{id} — retorna 404 cuando orden no existe")
    void test_obtenerOrden_retorna404_cuandoNoExiste() throws Exception {
        when(orderService.obtenerOrden(999L)).thenThrow(new OrderNotFoundException(999L));

        mockMvc.perform(get("/api/orders/999")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("AF-ORD-404"));
    }

    @Test
    @DisplayName("GET /api/orders/mis-pedidos — retorna lista del usuario autenticado")
    void test_misPedidos_retornaLista_cuandoAutenticado() throws Exception {
        when(orderService.misPedidos(eq(ID_COMPRADOR), any()))
                .thenReturn(List.of(buildOrderResponse()));

        mockMvc.perform(get("/api/orders/mis-pedidos")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void autenticarUsuario(Long id, String correo, List<String> roles) {
        JwtAuthUser principal = new JwtAuthUser(id, correo, roles);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private OrderResponse buildOrderResponse() {
        return new OrderResponse(
                1L, "AGF-2026-000001",
                ID_COMPRADOR, "Comprador Test",
                ID_VENDEDOR, "Vendedor Test",
                "PENDIENTE",
                new BigDecimal("77.50"),
                BigDecimal.ZERO,
                "STRIPE", null,
                List.of(), null,
                null, null,
                LocalDateTime.now(), LocalDateTime.now(),
                List.of() // warnings
        );
    }
}
