package com.agroflex.auth.service;

import com.agroflex.auth.model.Rol;
import com.agroflex.auth.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RolService {
    
    private final RolRepository rolRepository;
    
    public Rol obtenerRolPorNombre(String nombreRol) {
        try {
            Rol.NombreRol enumRol = Rol.NombreRol.valueOf(nombreRol.toUpperCase());
            return rolRepository.findByNombreRol(enumRol)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + nombreRol));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rol inválido: " + nombreRol);
        }
    }
}
