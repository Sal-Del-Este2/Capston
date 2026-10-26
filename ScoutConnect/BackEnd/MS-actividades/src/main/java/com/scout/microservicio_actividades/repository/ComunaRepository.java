package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComunaRepository extends JpaRepository<Comuna, Long> {

}