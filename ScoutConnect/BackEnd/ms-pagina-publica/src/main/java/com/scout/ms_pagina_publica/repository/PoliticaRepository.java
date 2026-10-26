package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.Politica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PoliticaRepository extends JpaRepository<Politica, Long> {
    List<Politica> findByPublicadaTrueOrderByFechaActualizacionDesc();
    List<Politica> findByTipoPoliticaIdOrderByFechaActualizacionDesc(Long tipoPoliticaId);
    List<Politica> findAllByOrderByFechaActualizacionDesc();
}
