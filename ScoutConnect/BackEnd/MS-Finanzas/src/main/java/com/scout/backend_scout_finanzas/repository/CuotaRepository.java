package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    List<Cuota> findByUsuarioId(Long usuarioId);
    List<Cuota> findByEstado(String estado);
    List<Cuota> findByUsuarioIdAndEstado(Long usuarioId, String estado);
}