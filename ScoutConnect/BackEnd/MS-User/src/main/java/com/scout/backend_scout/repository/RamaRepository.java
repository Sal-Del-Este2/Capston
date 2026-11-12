package com.scout.backend_scout.repository;

import com.scout.backend_scout.model.Rama;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RamaRepository extends JpaRepository<Rama, Long> {
    List<Rama> findByEstadoRamaNombreIgnoreCase(String nombre);
}