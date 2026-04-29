package com.agroflex.auth.repository;

import com.agroflex.auth.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Byte> {
    
    Optional<Rol> findByNombreRol(Rol.NombreRol nombreRol);
}
