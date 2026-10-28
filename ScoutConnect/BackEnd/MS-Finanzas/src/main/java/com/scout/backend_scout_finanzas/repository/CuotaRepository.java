package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    List<Cuota> findByUsuarioId(Long usuarioId);

    List<Cuota> findByEstado(String estado);

    List<Cuota> findByUsuarioIdAndEstado(
            Long usuarioId,
            String estado
    );
}