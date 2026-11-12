package com.scout.MS_Finanzas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.scout.MS_Finanzas.model.DetalleCompra;

public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {
}