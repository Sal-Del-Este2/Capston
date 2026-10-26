package com.scout.ms_pagina_publica.repository;

import com.scout.ms_pagina_publica.model.ContactoReino;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContactoReinoRepository extends JpaRepository<ContactoReino, Long> {
    List<ContactoReino> findByActivoTrueOrderByIdAsc();
    List<ContactoReino> findByReinoIdOrderByIdAsc(Long reinoId);
    Optional<ContactoReino> findByReinoIdAndActivoTrue(Long reinoId);
    Optional<ContactoReino> findByReinoIdAndUsuarioIdAndActivoTrue(Long reinoId, Long usuarioId);
}
