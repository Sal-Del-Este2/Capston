package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    List<Donacion> findByUsuarioId(Long usuarioId);

    List<Donacion> findByTipoDonacion(String tipoDonacion);

}