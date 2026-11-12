package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoImpuesto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoImpuestoRepository extends JpaRepository<EstadoImpuesto, Long> {
    java.util.Optional<EstadoImpuesto> findByNombre(String nombre);
}