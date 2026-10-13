package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Long> {
    List<Comuna> findByRegionIdOrderByIdAsc(Long regionId);

}
