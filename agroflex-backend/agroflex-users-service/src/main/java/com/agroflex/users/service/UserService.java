package com.agroflex.users.service;

import com.agroflex.users.dto.*;
import com.agroflex.users.exception.ReseñaDuplicadaException;
import com.agroflex.users.exception.UsuarioNoEncontradoException;
import com.agroflex.users.model.ReseñaCalificacion;
import com.agroflex.users.model.Usuario;
import com.agroflex.users.repository.InsigniaVendedorRepository;
import com.agroflex.users.repository.ReseñaCalificacionRepository;
import com.agroflex.users.repository.UsuarioRepository;
import com.agroflex.users.security.JwtAuthPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UsuarioRepository usuarioRepository;
    private final InsigniaVendedorRepository insigniaRepository;
    private final ReseñaCalificacionRepository reseñaRepository;

    // ─── MI PERFIL ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MiPerfilResponse getMiPerfil(JwtAuthPrincipal principal) {
        Usuario u = usuarioRepository.findByIdUsuarioAndDeletedAtIsNull(principal.idUsuario())
                .orElseThrow(() -> new UsuarioNoEncontradoException(principal.idUsuario()));
        return toMiPerfilResponse(u, principal.roles());
    }

    @Transactional
    public MiPerfilResponse actualizarMiPerfil(JwtAuthPrincipal principal, ActualizarPerfilRequest req) {
        Usuario u = usuarioRepository.findByIdUsuarioAndDeletedAtIsNull(principal.idUsuario())
                .orElseThrow(() -> new UsuarioNoEncontradoException(principal.idUsuario()));

        if (req.nombre() != null)          u.setNombre(req.nombre());
        if (req.apellidos() != null)       u.setApellidos(req.apellidos());
        if (req.telefono() != null)        u.setTelefono(req.telefono());
        if (req.direccion() != null)       u.setDireccion(req.direccion());
        if (req.estadoRepublica() != null) u.setEstadoRepublica(req.estadoRepublica());
        if (req.municipio() != null)       u.setMunicipio(req.municipio());
        if (req.fcmToken() != null)        u.setFcmToken(req.fcmToken());
        if (req.latitud() != null)         u.setLatitud(BigDecimal.valueOf(req.latitud()));
        if (req.longitud() != null)        u.setLongitud(BigDecimal.valueOf(req.longitud()));
        if (req.fotoPerfil() != null)      u.setFotoPerfil(req.fotoPerfil());
        if (req.descripcion() != null)     u.setDescripcion(req.descripcion());

        return toMiPerfilResponse(usuarioRepository.save(u), principal.roles());
    }

    // ─── PERFIL PÚBLICO ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PerfilPublicoResponse getPerfilPublico(Long idUsuario) {
        Usuario u = usuarioRepository.findByIdUsuarioAndDeletedAtIsNull(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));
        return toPerfilPublicoResponse(u);
    }

    // ─── INSIGNIAS ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<InsigniaResponse> getInsignias(Long idUsuario) {
        return insigniaRepository.findByIdUsuarioOrderByCreatedAtDesc(idUsuario)
                .stream()
                .map(i -> new InsigniaResponse(
                        i.getIdInsignia(),
                        i.getTipoDocumento(),
                        i.getNombreNegocio(),
                        i.getRfc(),
                        i.getDescripcionNegocio(),
                        i.getEstadoVerificacion(),
                        i.getMotivoRechazo(),
                        i.getFechaVerificacion(),
                        i.getCreatedAt()
                ))
                .toList();
    }

    // ─── RESEÑAS ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ReseñaResponse> getReseñas(Long idUsuario, Pageable pageable) {
        return reseñaRepository
                .findByIdCalificadoAndVisibleTrueOrderByCreatedAtDesc(idUsuario, pageable)
                .map(r -> new ReseñaResponse(
                        r.getIdReseña(),
                        r.getIdOrden(),
                        r.getIdCalificador(),
                        r.getTipoReseña().name(),
                        r.getPuntuacion(),
                        r.getComentario(),
                        r.getCreatedAt()
                ));
    }

    @Transactional
    public ReseñaResponse crearReseña(JwtAuthPrincipal principal, CrearReseñaRequest req) {
        if (reseñaRepository.existsByIdOrdenAndIdCalificador(req.idOrden(), principal.idUsuario())) {
            throw new ReseñaDuplicadaException(req.idOrden());
        }

        ReseñaCalificacion reseña = ReseñaCalificacion.builder()
                .idOrden(req.idOrden())
                .idCalificador(principal.idUsuario())
                .idCalificado(req.idCalificado())
                .tipoReseña(ReseñaCalificacion.TipoReseña.valueOf(req.tipoReseña()))
                .puntuacion(req.puntuacion())
                .comentario(req.comentario())
                .visible(true)
                .reportada(false)
                .build();

        ReseñaCalificacion saved = reseñaRepository.save(reseña);
        log.info("Reseña creada: idOrden={} calificador={} calificado={} puntuacion={}",
                req.idOrden(), principal.idUsuario(), req.idCalificado(), req.puntuacion());

        return new ReseñaResponse(
                saved.getIdReseña(),
                saved.getIdOrden(),
                saved.getIdCalificador(),
                saved.getTipoReseña().name(),
                saved.getPuntuacion(),
                saved.getComentario(),
                saved.getCreatedAt()
        );
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UsuarioAdminResponse> listarUsuarios(String busqueda, Pageable pageable) {
        return usuarioRepository.buscarActivos(busqueda, pageable)
                .map(this::toUsuarioAdminResponse);
    }

    @Transactional
    public UsuarioAdminResponse cambiarEstadoUsuario(Long idUsuario, boolean activo) {
        Usuario u = usuarioRepository.findByIdUsuarioAndDeletedAtIsNull(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));
        u.setActivo(activo);
        return toUsuarioAdminResponse(usuarioRepository.save(u));
    }

    @Transactional
    public void eliminarUsuario(Long idUsuario) {
        Usuario u = usuarioRepository.findByIdUsuarioAndDeletedAtIsNull(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));
        u.setDeletedAt(LocalDateTime.now());
        u.setActivo(false);
        usuarioRepository.save(u);
        log.info("Usuario soft-deleted: id={}", idUsuario);
    }

    // ─── MAPPERS PRIVADOS ─────────────────────────────────────────────────────

    private MiPerfilResponse toMiPerfilResponse(Usuario u, List<String> roles) {
        return new MiPerfilResponse(
                u.getIdUsuario(),
                u.getNombre(),
                u.getApellidos(),
                u.getCorreo(),
                u.getTelefono(),
                u.getDireccion(),
                u.getLatitud(),
                u.getLongitud(),
                u.getEstadoRepublica(),
                u.getMunicipio(),
                u.getPuntuacionRep(),
                u.getTotalReseñas(),
                u.getValidado(),
                u.getActivo(),
                u.getFirebaseUid(),
                u.getFotoPerfil(),
                u.getDescripcion(),
                roles,
                u.getCreatedAt()
        );
    }

    private PerfilPublicoResponse toPerfilPublicoResponse(Usuario u) {
        List<String> roles = u.getRoles().stream()
                .map(r -> r.getNombreRol().name())
                .toList();
        return new PerfilPublicoResponse(
                u.getIdUsuario(),
                u.getNombre(),
                u.getApellidos(),
                u.getEstadoRepublica(),
                u.getMunicipio(),
                u.getPuntuacionRep(),
                u.getTotalReseñas(),
                u.getValidado(),
                roles,
                u.getFotoPerfil(),
                u.getDescripcion()
        );
    }

    private UsuarioAdminResponse toUsuarioAdminResponse(Usuario u) {
        List<String> roles = u.getRoles().stream()
                .map(r -> r.getNombreRol().name())
                .toList();
        return new UsuarioAdminResponse(
                u.getIdUsuario(),
                u.getNombre(),
                u.getApellidos(),
                u.getCorreo(),
                u.getTelefono(),
                u.getEstadoRepublica(),
                u.getMunicipio(),
                u.getPuntuacionRep(),
                u.getTotalReseñas(),
                u.getValidado(),
                u.getActivo(),
                roles,
                u.getCreatedAt(),
                u.getDeletedAt()
        );
    }
}
