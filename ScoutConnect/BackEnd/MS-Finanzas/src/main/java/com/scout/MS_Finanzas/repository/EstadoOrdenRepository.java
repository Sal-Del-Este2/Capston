package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoOrdenRepository extends JpaRepository<EstadoOrden, Long> {
    java.util.Optional<EstadoOrden> findByNombre(String nombre);
}