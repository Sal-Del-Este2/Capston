package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoConfiguracionCuota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoConfiguracionCuotaRepository extends JpaRepository<EstadoConfiguracionCuota, Long> {
    java.util.Optional<EstadoConfiguracionCuota> findByNombre(String nombre);
}