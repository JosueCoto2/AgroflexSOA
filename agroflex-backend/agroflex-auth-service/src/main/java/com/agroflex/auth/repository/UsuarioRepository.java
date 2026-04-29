package com.agroflex.auth.repository;

import com.agroflex.auth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByCorreo(String correo);
    
    boolean existsByCorreo(String correo);
    
    Optional<Usuario> findByFirebaseUid(String firebaseUid);
    
    Optional<Usuario> findByResetToken(String resetToken);
}
