package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.EstadoContenido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoContenidoRepository extends JpaRepository<EstadoContenido, Short> {

    Optional<EstadoContenido> findByNombre(String nombre);
}
