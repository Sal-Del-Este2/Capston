package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    List<Donacion> findByUsuarioId(Long usuarioId);
    List<Donacion> findByTipoDonacion(String tipoDonacion);
}