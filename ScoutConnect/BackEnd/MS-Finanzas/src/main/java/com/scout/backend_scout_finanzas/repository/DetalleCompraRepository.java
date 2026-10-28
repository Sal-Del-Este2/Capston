package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {

    List<DetalleCompra> findByOrdenId(Long ordenId);

    List<DetalleCompra> findByProductoId(Long productoId);

}