package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuarioId(Long usuarioId);
    List<Pago> findByEstado(String estado);
    List<Pago> findByTipo(String tipo);
}
