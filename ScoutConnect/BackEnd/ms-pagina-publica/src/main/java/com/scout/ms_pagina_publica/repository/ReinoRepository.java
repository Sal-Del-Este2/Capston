package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.Reino;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReinoRepository extends JpaRepository<Reino, Long> {
    List<Reino> findByActivoTrueOrderByIdAsc();
    Optional<Reino> findByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCase(String nombre);
}
