package com.agroflex.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.agroflex.admin.dto.UsuarioResumenDTO;
import com.agroflex.admin.model.Rol;
import com.agroflex.admin.model.Usuario;
import com.agroflex.admin.repository.AdminRolRepository;
import com.agroflex.admin.repository.AdminUsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUsuariosService {

    private final AdminUsuarioRepository usuarioRepository;
    private final AdminRolRepository rolRepository;

    @Transactional(readOnly = true)
    public Page<UsuarioResumenDTO> listar(String buscar, Boolean activo, Pageable pageable) {
        return usuarioRepository.findByFiltros(buscar, activo, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public UsuarioResumenDTO getById(Long id) {
        return usuarioRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    @Transactional
    public UsuarioResumenDTO suspender(Long id, String motivo) {
        Usuario u = findOrThrow(id);
        u.setActivo(false);
        return toDTO(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResumenDTO activar(Long id, String motivo) {
        Usuario u = findOrThrow(id);
        u.setActivo(true);
        return toDTO(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResumenDTO cambiarRol(Long id, String nuevoRol) {
        Usuario u = findOrThrow(id);
        Rol rol = rolRepository.findByNombreRol(nuevoRol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no válido: " + nuevoRol));
        // Conservar ADMIN si el usuario ya lo tiene (no perder acceso admin por error)
        boolean eraAdmin = u.getRoles().stream().anyMatch(r -> r.getAuthority().equals("ADMIN"));
        u.getRoles().clear();
        u.getRoles().add(rol);
        if (eraAdmin && !nuevoRol.equals("ADMIN")) {
            // Si el target no es ADMIN, no restaurar ADMIN — el admin que hace la acción sabe lo que hace
        }
        return toDTO(usuarioRepository.save(u));
    }

    @Transactional
    public void eliminar(Long id) {
        Usuario u = findOrThrow(id);
        usuarioRepository.delete(u);
    }

    @Transactional(readOnly = true)
    public String exportarCsv() {
        List<Usuario> todos = usuarioRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Nombre,Apellidos,Correo,Telefono,Roles,Activo,Municipio,Estado,Puntuacion,Fecha Registro\n");
        for (Usuario u : todos) {
            String roles = u.getRoles().stream().map(Rol::getAuthority).collect(Collectors.joining("|"));
            sb.append(csv(u.getIdUsuario())).append(',')
              .append(csv(u.getNombre())).append(',')
              .append(csv(u.getApellidos())).append(',')
              .append(csv(u.getCorreo())).append(',')
              .append(csv(u.getTelefono())).append(',')
              .append(csv(roles)).append(',')
              .append(u.getActivo() != null && u.getActivo() ? "Activo" : "Suspendido").append(',')
              .append(csv(u.getMunicipio())).append(',')
              .append(csv(u.getEstadoRepublica())).append(',')
              .append(u.getPuntuacionRep() != null ? u.getPuntuacionRep() : "").append(',')
              .append(u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate() : "").append('\n');
        }
        return sb.toString();
    }

    private String csv(Object val) {
        if (val == null) return "";
        String s = val.toString().replace("\"", "\"\"");
        return s.contains(",") || s.contains("\"") || s.contains("\n") ? "\"" + s + "\"" : s;
    }

    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private UsuarioResumenDTO toDTO(Usuario u) {
        return UsuarioResumenDTO.builder()
                .id(u.getIdUsuario())
                .nombre(u.getNombre())
                .apellidos(u.getApellidos())
                .correo(u.getCorreo())
                .telefono(u.getTelefono())
                .roles(u.getRoles().stream().map(Rol::getAuthority).collect(Collectors.toList()))
                .validado(u.getValidado())
                .activo(u.getActivo())
                .municipio(u.getMunicipio())
                .estadoRepublica(u.getEstadoRepublica())
                .puntuacionRep(u.getPuntuacionRep())
                .fechaRegistro(u.getCreatedAt())
                .totalProductos(usuarioRepository.countProductosByVendedor(u.getIdUsuario()))
                .totalPedidos(0L)
                .build();
    }
}
