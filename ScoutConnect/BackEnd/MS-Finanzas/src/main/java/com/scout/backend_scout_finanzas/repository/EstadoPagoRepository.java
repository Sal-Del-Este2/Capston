package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoPagoRepository extends JpaRepository<EstadoPago, Long> {
    Optional<EstadoPago> findByNombre(String nombre);
}