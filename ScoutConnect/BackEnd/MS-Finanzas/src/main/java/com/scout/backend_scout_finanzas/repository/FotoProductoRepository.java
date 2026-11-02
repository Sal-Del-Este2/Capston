package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.FotoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FotoProductoRepository extends JpaRepository<FotoProducto, Long> {
    List<FotoProducto> findByProducto_IdOrderByOrdenVisualizacionAsc(Long productoId);
    long countByProducto_Id(Long productoId);
}