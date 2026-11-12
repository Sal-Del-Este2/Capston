package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.ConfiguracionCuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConfiguracionCuotaRepository extends JpaRepository<ConfiguracionCuota, Long> {
    Optional<ConfiguracionCuota> findFirstByEstadoNombreOrderByVigenteDesdeDesc(String estadoNombre);
}