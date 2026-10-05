package com.scout.backend_scout.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.scout.backend_scout.model.Comuna;
import java.util.Optional;

public interface ComunaRepository extends JpaRepository<Comuna, Long> {
    Optional<Comuna> findByNombre(String nombre);
}
