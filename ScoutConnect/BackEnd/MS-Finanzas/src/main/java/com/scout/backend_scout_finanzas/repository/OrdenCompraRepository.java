package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
    List<OrdenCompra> findByUsuarioId(Long usuarioId);
    List<OrdenCompra> findByEstado(String estado);
}