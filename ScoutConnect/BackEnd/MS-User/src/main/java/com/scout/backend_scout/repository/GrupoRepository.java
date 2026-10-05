package com.scout.backend_scout.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.scout.backend_scout.model.Grupo;
import java.util.Optional;

public interface GrupoRepository extends JpaRepository<Grupo, Long>{
    Optional<Grupo> findByNombre(String nombre);
}