package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {
    List<Ubicacion> findByActivoTrueOrderByIdAsc();
    List<Ubicacion> findByComunaIdOrderByIdAsc(Long comunaId);
    boolean existsByNombreIgnoreCase(String nombre);
}
