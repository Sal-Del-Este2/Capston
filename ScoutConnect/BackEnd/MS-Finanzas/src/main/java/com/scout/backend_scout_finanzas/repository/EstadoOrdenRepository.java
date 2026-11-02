package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoOrdenRepository extends JpaRepository<EstadoOrden, Long> {
    Optional<EstadoOrden> findByNombre(String nombre);
}