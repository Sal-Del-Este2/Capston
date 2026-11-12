package com.scout.backend_scout.repository;

import com.scout.backend_scout.model.EstadoRama;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoRamaRepository extends JpaRepository<EstadoRama, Long> {
    Optional<EstadoRama> findByNombreIgnoreCase(String nombre);
}