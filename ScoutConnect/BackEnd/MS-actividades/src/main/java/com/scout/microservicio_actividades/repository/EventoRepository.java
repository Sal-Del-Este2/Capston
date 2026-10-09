
package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento>findAllByOrderByFechaRealizacionDesc();
    List<Evento>findByEstado_NombreOrderByFechaRealizacionDesc(String nombreEstado);

}
