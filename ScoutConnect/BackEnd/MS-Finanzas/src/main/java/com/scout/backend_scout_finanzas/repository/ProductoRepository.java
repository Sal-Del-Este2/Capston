package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    List<Producto> findByGrupo_IdAndRama_IdAndActivoTrue(Long grupoId, Long ramaId);
    List<Producto> findByTituloContainingIgnoreCaseAndActivoTrue(String titulo);
}