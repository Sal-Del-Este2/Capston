package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.OrdenCompra;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long>, JpaSpecificationExecutor<OrdenCompra> {
    Page<OrdenCompra> findByUsuarioId(Long usuarioId, Pageable pageable);
    Optional<OrdenCompra> findByPagoId(Long pagoId);
    // Bloquea la orden para impedir que dos confirmaciones
    // procesen simultáneamente la misma compra.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT o
        FROM OrdenCompra o
        WHERE o.pago.id = :pagoId
    """)
    Optional<OrdenCompra> buscarPorPagoIdConBloqueo(@Param("pagoId") Long pagoId);
}