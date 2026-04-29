package com.agroflex.auth.service;

import com.agroflex.auth.dto.LoginRequest;
import com.agroflex.auth.dto.RegisterRequest;
import com.agroflex.auth.model.Rol;
import com.agroflex.auth.model.Usuario;
import com.agroflex.auth.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {
    
    @Mock
    private UsuarioRepository usuarioRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @Mock
    private UserDetailsService userDetailsService;
    
    @Mock
    private RolService rolService;
    
    @InjectMocks
    private AuthService authService;
    
    private Usuario testUsuario;
    private Rol rolComprador;
    
    @BeforeEach
    void setUp() {
        rolComprador = Rol.builder()
            .idRol((byte) 5)
            .nombreRol(Rol.NombreRol.COMPRADOR)
            .descripcion("Comprador de lotes o suministros")
            .build();
        
        testUsuario = Usuario.builder()
            .idUsuario(1L)
            .nombre("Juan")
            .apellidos("Pérez")
            .correo("juan@example.com")
            .passwordHash("$2a$10$hashedpassword")
            .telefono("5551234567")
            .validado(false)
            .activo(true)
            .puntuacionRep(BigDecimal.ZERO)
            .totalReseñas(0)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .roles(new HashSet<>(java.util.List.of(rolComprador)))
            .build();
    }
    
    @Test
    @DisplayName("Debe hacer login exitoso con credenciales válidas")
    void testLoginExitosoConCredencialesValidas() {
        // Arrange
        LoginRequest loginRequest = LoginRequest.builder()
            .correo("juan@example.com")
            .password("Password123")
            .build();
        
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(auth);
        when(usuarioRepository.findByCorreo("juan@example.com"))
            .thenReturn(Optional.of(testUsuario));
        when(userDetailsService.loadUserByUsername("juan@example.com"))
            .thenReturn(testUsuario);
        when(jwtService.generateToken(testUsuario))
            .thenReturn("accessToken123");
        when(jwtService.generateRefreshToken(testUsuario))
            .thenReturn("refreshToken456");
        
        // Act
        var response = authService.login(loginRequest);
        
        // Assert
        assertNotNull(response);
        assertEquals("juan@example.com", response.getCorreo());
        assertEquals("Juan", response.getNombre());
        assertEquals("accessToken123", response.getAccessToken());
        assertEquals("refreshToken456", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
    }
    
    @Test
    @DisplayName("Debe fallar login con password incorrecta")
    void testLoginFallaConPasswordIncorrecta() {
        // Arrange
        LoginRequest loginRequest = LoginRequest.builder()
            .correo("juan@example.com")
            .password("WrongPassword")
            .build();
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Credenciales inválidas"));
        
        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> {
            authService.login(loginRequest);
        });
    }
    
    @Test
    @DisplayName("Debe crear usuario con rol COMPRADOR por defecto")
    void testRegistroCreaUsuarioConRolCompradorPorDefecto() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
            .nombre("Carlos")
            .apellidos("García")
            .correo("carlos@example.com")
            .password("SecurePass123")
            .build();
        
        when(usuarioRepository.existsByCorreo("carlos@example.com"))
            .thenReturn(false);
        when(rolService.obtenerRolPorNombre("COMPRADOR"))
            .thenReturn(rolComprador);
        when(passwordEncoder.encode("SecurePass123"))
            .thenReturn("$2a$10$hashedpassword123");
        when(usuarioRepository.save(any(Usuario.class)))
            .thenReturn(testUsuario);
        when(userDetailsService.loadUserByUsername("carlos@example.com"))
            .thenReturn(testUsuario);
        when(jwtService.generateToken(any()))
            .thenReturn("accessToken789");
        when(jwtService.generateRefreshToken(any()))
            .thenReturn("refreshToken012");
        
        // Act
        var response = authService.register(registerRequest);
        
        // Assert
        assertNotNull(response);
        assertEquals("Juan", response.getNombre());
        assertNotNull(response.getAccessToken());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }
    
    @Test
    @DisplayName("Debe fallar si el correo ya existe")
    void testRegistroFallaSiCorreoYaExiste() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
            .nombre("Juan")
            .apellidos("Pérez")
            .correo("juan@example.com")
            .password("Password123")
            .build();
        
        when(usuarioRepository.existsByCorreo("juan@example.com"))
            .thenReturn(true);
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });
    }
    
    @Test
    @DisplayName("Debe generar token si correo existe en forgotPassword")
    void testForgotPasswordGeneraTokenSiCorreoExiste() {
        // Arrange
        String correo = "juan@example.com";
        when(usuarioRepository.findByCorreo(correo))
            .thenReturn(Optional.of(testUsuario));
        when(usuarioRepository.save(any(Usuario.class)))
            .thenReturn(testUsuario);
        
        // Act
        assertDoesNotThrow(() -> authService.forgotPassword(correo));
        
        // Assert
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }
}
