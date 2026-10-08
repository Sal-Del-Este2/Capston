package com.scout.backend_scout.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.scout.backend_scout.model.AdjuntoMensaje;

public interface AdjuntoMensajeRepository extends JpaRepository<AdjuntoMensaje, Long> {
    List<AdjuntoMensaje> findByMensajeIdOrderByIdAsc(Long mensajeId);
    Optional<AdjuntoMensaje> findByIdAndMensajeId(Long id,Long mensajeId);
}
