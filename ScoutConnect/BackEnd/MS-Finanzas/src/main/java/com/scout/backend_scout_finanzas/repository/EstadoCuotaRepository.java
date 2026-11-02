package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.EstadoCuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoCuotaRepository extends JpaRepository<EstadoCuota, Long> {
    Optional<EstadoCuota> findByNombre(String nombre);
}