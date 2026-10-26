package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
}