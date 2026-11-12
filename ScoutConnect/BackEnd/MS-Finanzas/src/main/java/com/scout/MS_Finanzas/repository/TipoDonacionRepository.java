package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.TipoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoDonacionRepository extends JpaRepository<TipoDonacion, Long> {
    java.util.Optional<TipoDonacion> findByNombre(String nombre);
}