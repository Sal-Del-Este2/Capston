package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.FotoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FotoProductoRepository extends JpaRepository<FotoProducto, Long> {
    List<FotoProducto> findByProductoIdOrderByOrdenVisualizacionAsc(Long productoId);
    Optional<FotoProducto> findByProductoIdAndOrdenVisualizacion(Long productoId, Short orden);
    long countByProductoId(Long productoId);
}