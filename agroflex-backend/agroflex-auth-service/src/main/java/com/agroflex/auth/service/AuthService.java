package com.agroflex.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agroflex.auth.dto.AuthResponse;
import com.agroflex.auth.dto.LoginRequest;
import com.agroflex.auth.dto.RegisterRequest;
import com.agroflex.auth.dto.SolicitudInsigniaRequest;
import com.agroflex.auth.model.Rol;
import com.agroflex.auth.model.SolicitudInsignia;
import com.agroflex.auth.model.Usuario;
import com.agroflex.auth.repository.SolicitudInsigniaRepository;
import com.agroflex.auth.repository.UsuarioRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final SolicitudInsigniaRepository solicitudRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RolService rolService;
    private final EmailService emailService;
    private final EmailVerificationStore verificationStore;
    
    /**
     * Autenticar usuario con correo y contraseña
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getCorreo(),
                    request.getPassword()
                )
            );
            
            Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getCorreo());
            
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            
            return buildAuthResponse(usuario, accessToken, refreshToken);
            
        } catch (BadCredentialsException e) {
            log.warn("Intento de login fallido para correo: {}", request.getCorreo());
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }
    }
    
    /**
     * Genera un código de 6 dígitos y lo envía al correo del solicitante.
     * Si el correo ya está registrado se rechaza para no revelar información extra.
     */
    public void enviarCodigoVerificacion(String correo) {
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        String codigo = String.format("%06d",
                ThreadLocalRandom.current().nextInt(0, 1_000_000));
        verificationStore.guardar(correo, codigo);
        emailService.enviarCodigoVerificacion(correo, codigo);
        log.info("Código de verificación enviado a: {}", correo);
    }

    /**
     * Registrar nuevo usuario
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Verificación por correo desactivada temporalmente
        // Validar que el correo no exista
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        
        // Crear nuevo usuario
        Usuario usuario = Usuario.builder()
            .nombre(request.getNombre())
            .apellidos(request.getApellidos())
            .correo(request.getCorreo())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .telefono(request.getTelefono())
            .validado(false)
            .activo(true)
            .puntuacionRep(java.math.BigDecimal.ZERO)
            .totalReseñas(0)
            .build();
        
        // Asignar rol (COMPRADOR por defecto o rol solicitado)
        String rolNombre = request.getRolSolicitado();
        if (rolNombre == null || rolNombre.isBlank()) {
            rolNombre = "COMPRADOR";
        }
        
        Rol rol = rolService.obtenerRolPorNombre(rolNombre);
        usuario.getRoles().add(rol);
        
        usuario = usuarioRepository.save(usuario);
        
        log.info("Nuevo usuario registrado: {}", usuario.getCorreo());
        
        // Generar tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        return buildAuthResponse(usuario, accessToken, refreshToken);
    }
    
    /**
     * Refrescar el Access Token usando el Refresh Token
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String correo = jwtService.extractUsername(refreshToken);
            
            if (!jwtService.isRefreshTokenValid(refreshToken)) {
                throw new IllegalArgumentException("Refresh token ha expirado");
            }
            
            Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(correo);
            String newAccessToken = jwtService.generateToken(userDetails);
            
            return buildAuthResponse(usuario, newAccessToken, refreshToken);
            
        } catch (Exception e) {
            log.error("Error al refrescar token: {}", e.getMessage());
            throw new IllegalArgumentException("Token inválido o expirado");
        }
    }
    
    /**
     * Solicitar reset de contraseña
     */
    @Transactional
    public void forgotPassword(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        
        // Generar token temporal (UUID válido por 1 hora)
        String resetToken = UUID.randomUUID().toString();
        usuario.setResetToken(resetToken);
        usuario.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        
        usuarioRepository.save(usuario);
        
        // TODO: Enviar correo con link de reset
        log.info("Token de reset generado para: {}", correo);
    }
    
    /**
     * Resetear contraseña con token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Usuario usuario = usuarioRepository.findByResetToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Token inválido"));
        
        // Validar que el token no haya expirado
        if (usuario.getResetTokenExpiry() == null || 
            usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token ha expirado");
        }
        
        // Actualizar contraseña
        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiry(null);
        
        usuarioRepository.save(usuario);
        
        log.info("Contraseña actualizada para: {}", usuario.getCorreo());
    }
    
    /**
     * Solicitar y aprobar automáticamente una insignia de vendedor
     */
    @Transactional
    public AuthResponse solicitarInsignia(String correo, SolicitudInsigniaRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String rolNombre = request.getRol().toUpperCase();
        List<String> rolesVendedor = List.of("PRODUCTOR", "INVERNADERO", "PROVEEDOR");
        if (!rolesVendedor.contains(rolNombre)) {
            throw new IllegalArgumentException("Rol no válido para insignia: " + rolNombre);
        }

        boolean yaTieneRol = usuario.getRoles().stream()
            .anyMatch(r -> r.getNombreRol().name().equals(rolNombre));
        if (yaTieneRol) {
            throw new IllegalArgumentException("Ya tienes la insignia de " + rolNombre);
        }

        if (solicitudRepository.existsByIdUsuarioAndRolSolicitado(usuario.getIdUsuario(), rolNombre)) {
            throw new IllegalArgumentException("Ya tienes una solicitud registrada para " + rolNombre);
        }

        Rol rol = rolService.obtenerRolPorNombre(rolNombre);
        usuario.getRoles().add(rol);
        usuario.setValidado(true);
        usuarioRepository.save(usuario);

        String motivo = request.getNombreNegocio() + " - " + request.getMunicipio() + ", " + request.getEstado();
        if (request.getDescripcion() != null && !request.getDescripcion().isBlank()) {
            motivo += ". " + request.getDescripcion();
        }

        SolicitudInsignia solicitud = SolicitudInsignia.builder()
            .idUsuario(usuario.getIdUsuario())
            .nombreUsuario(usuario.getNombre() + " " + usuario.getApellidos())
            .correoUsuario(correo)
            .rolSolicitado(rolNombre)
            .motivoSolicitud(motivo)
            .estado("APROBADA")
            .fechaSolicitud(LocalDateTime.now())
            .fechaResolucion(LocalDateTime.now())
            .adminRevisor("AUTO_APROBADO")
            .build();
        solicitudRepository.save(solicitud);

        log.info("Insignia {} asignada automáticamente a: {}", rolNombre, correo);

        UserDetails userDetails = userDetailsService.loadUserByUsername(correo);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(usuario, accessToken, refreshToken);
    }

    /**
     * Login / registro con Google (Firebase ID Token)
     * Flujo: Frontend obtiene ID token de Firebase → lo envía aquí →
     * verificamos con Firebase Admin SDK → creamos o encontramos usuario en MySQL →
     * devolvemos JWT de AgroFlex.
     */
    @Transactional
    public AuthResponse loginConGoogle(String idToken) {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("Firebase Admin SDK no está inicializado. " +
                "Verifica que firebase-service-account.json esté en resources.");
        }

        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            log.warn("Token de Google inválido — código: {} mensaje: {}", e.getAuthErrorCode(), e.getMessage());
            throw new IllegalArgumentException("Token de Google inválido o expirado");
        }

        String uid   = decoded.getUid();
        String email = decoded.getEmail();
        String name  = decoded.getName() != null ? decoded.getName() : email;

        // Buscar por firebaseUid, luego por correo (usuario registrado previamente con email)
        Optional<Usuario> opt = usuarioRepository.findByFirebaseUid(uid);
        if (opt.isEmpty()) {
            opt = usuarioRepository.findByCorreo(email);
        }

        Usuario usuario;
        if (opt.isPresent()) {
            usuario = opt.get();
            // Enlazar el UID de Google si aún no está guardado
            if (usuario.getFirebaseUid() == null) {
                usuario.setFirebaseUid(uid);
                usuarioRepository.save(usuario);
            }
        } else {
            // Primer login con Google → crear cuenta automáticamente
            String[] parts    = name.split(" ", 2);
            String   nombre   = parts[0];
            String   apellidos = parts.length > 1 ? parts[1] : "-";

            usuario = Usuario.builder()
                .nombre(nombre)
                .apellidos(apellidos)
                .correo(email)
                .passwordHash("GOOGLE_" + uid)   // no se usa para login Google
                .firebaseUid(uid)
                .validado(true)
                .activo(true)
                .puntuacionRep(java.math.BigDecimal.ZERO)
                .totalReseñas(0)
                .build();

            Rol rol = rolService.obtenerRolPorNombre("COMPRADOR");
            usuario.getRoles().add(rol);
            usuario = usuarioRepository.save(usuario);
            log.info("Nuevo usuario registrado con Google: {}", email);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());
        String accessToken  = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(usuario, accessToken, refreshToken);
    }

    /**
     * Constructor auxiliar para buildear AuthResponse
     */
    private AuthResponse buildAuthResponse(Usuario usuario, String accessToken, String refreshToken) {
        List<String> roles = usuario.getRoles().stream()
            .map(rol -> rol.getNombreRol().name())
            .collect(Collectors.toList());
        
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .id(usuario.getIdUsuario())
            .nombre(usuario.getNombre())
            .correo(usuario.getCorreo())
            .roles(roles)
            .validado(usuario.getValidado())
            .fotoPerfil(usuario.getFotoPerfil())
            .build();
    }
}
