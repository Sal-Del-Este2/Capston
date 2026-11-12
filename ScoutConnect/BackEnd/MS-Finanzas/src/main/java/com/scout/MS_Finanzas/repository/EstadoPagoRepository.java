package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoPagoRepository extends JpaRepository<EstadoPago, Long> {
    java.util.Optional<EstadoPago> findByNombre(String nombre);
}