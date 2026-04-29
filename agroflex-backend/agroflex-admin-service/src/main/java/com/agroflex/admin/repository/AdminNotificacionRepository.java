package com.agroflex.admin.repository;

import com.agroflex.admin.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminNotificacionRepository extends JpaRepository<Notificacion, Long> {
}
