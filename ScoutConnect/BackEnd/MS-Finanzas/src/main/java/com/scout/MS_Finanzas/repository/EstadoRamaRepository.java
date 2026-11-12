package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoRama;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoRamaRepository extends JpaRepository<EstadoRama, Long> {
    java.util.Optional<EstadoRama> findByNombre(String nombre);
}