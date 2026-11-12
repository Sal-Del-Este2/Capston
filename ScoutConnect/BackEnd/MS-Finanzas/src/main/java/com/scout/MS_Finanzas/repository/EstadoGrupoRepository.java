package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.EstadoGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoGrupoRepository extends JpaRepository<EstadoGrupo, Long> {
    java.util.Optional<EstadoGrupo> findByNombre(String nombre);
}