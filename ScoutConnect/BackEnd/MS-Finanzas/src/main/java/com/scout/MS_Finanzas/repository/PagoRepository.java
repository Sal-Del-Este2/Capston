package com.scout.MS_Finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.scout.MS_Finanzas.model.Pago;

public interface PagoRepository extends JpaRepository<Pago, Long> {
}