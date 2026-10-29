package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {
    List<DetalleCompra> findByOrdenId(Long ordenId);
    List<DetalleCompra> findByProductoId(Long productoId);
}