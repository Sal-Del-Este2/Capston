package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoCuota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoCuotaRepository extends JpaRepository<EstadoCuota, Long> {
    java.util.Optional<EstadoCuota> findByNombre(String nombre);
}