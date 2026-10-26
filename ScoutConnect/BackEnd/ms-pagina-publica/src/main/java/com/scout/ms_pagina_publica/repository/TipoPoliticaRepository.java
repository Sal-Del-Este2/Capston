package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.TipoPolitica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoPoliticaRepository extends JpaRepository<TipoPolitica, Long> {
    Optional<TipoPolitica> findByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCase(String nombre);
}
