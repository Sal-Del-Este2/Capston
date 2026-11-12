package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.Impuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ImpuestoRepository extends JpaRepository<Impuesto, Long> {
    Optional<Impuesto> findFirstByEstadoNombreOrderByVigenteDesdeDesc(String estadoNombre);
    Optional<Impuesto> findByCodigoIgnoreCase(String codigo);
}