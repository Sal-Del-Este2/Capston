package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    List<Cuota> findByUsuarioIdOrderByAnioDescMesDesc(Long usuarioId);
    List<Cuota> findByUsuarioIdAndEstado_Nombre(Long usuarioId, String estado);
    List<Cuota> findByAnio(Integer anio);
    List<Cuota> findByEstado_Nombre(String estado);
    Optional<Cuota> findByUsuarioIdAndAnioAndMes(Long usuarioId, Integer anio, Integer mes);
}