package com.scout.ms_pagina_publica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.scout.ms_pagina_publica.model.InformacionInstitucional;

@Repository 
public interface InformacionInstitucionalRepository extends JpaRepository<InformacionInstitucional, Long> {

}
