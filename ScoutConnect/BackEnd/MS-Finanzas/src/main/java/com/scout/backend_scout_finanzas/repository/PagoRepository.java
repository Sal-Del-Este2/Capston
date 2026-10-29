package com.scout.backend_scout_finanzas.repository;

import com.scout.backend_scout_finanzas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuarioId(Long usuarioId);
    List<Pago> findByEstado(String estado);
    List<Pago> findByTipoPago(String tipoPago);
    Optional<Pago> findByCommerceOrder(String commerceOrder);
    Optional<Pago> findByTokenFlow(String tokenFlow);
}