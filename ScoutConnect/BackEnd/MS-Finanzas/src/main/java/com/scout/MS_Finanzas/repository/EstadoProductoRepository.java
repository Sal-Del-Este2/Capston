package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoProducto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoProductoRepository extends JpaRepository<EstadoProducto, Long> {
    java.util.Optional<EstadoProducto> findByNombre(String nombre);
}