package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.TipoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoDonacionRepository extends JpaRepository<TipoDonacion, Long> {
    Optional<TipoDonacion> findByNombre(String nombre);
}