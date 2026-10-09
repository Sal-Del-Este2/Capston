
package com.scout.microservicio_actividades.repository;

import com.scout.microservicio_actividades.model.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia>findAllByOrderByFechaRealizacionDesc();
    List<Noticia>findByEstado_NombreOrderByFechaRealizacionDesc(String nombreEstado);

}
