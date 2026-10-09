package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.FotoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FotoEventoRepository extends JpaRepository<FotoEvento, Long> {
    List<FotoEvento>findByEvento_IdOrderByOrdenVisualizacionAsc(Long eventoId);
    Optional<FotoEvento>findByEvento_IdAndEsPrincipalTrue(Long eventoId);
    long countByEvento_Id(Long eventoId);
    boolean existsByEvento_IdAndEsPrincipalTrue(Long eventoId);
}
