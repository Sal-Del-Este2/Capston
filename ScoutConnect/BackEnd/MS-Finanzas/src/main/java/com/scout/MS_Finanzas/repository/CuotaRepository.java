package com.scout.MS_Finanzas.repository;

import java.util.List;
import java.util.Optional;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.scout.MS_Finanzas.model.Cuota;

public interface CuotaRepository extends JpaRepository<Cuota, Long>, JpaSpecificationExecutor<Cuota> {
    List<Cuota> findByUsuarioIdOrderByAnioDescMesDesc(Long usuarioId);
    Optional<Cuota> findByUsuarioIdAndAnioAndMes(Long usuarioId, Integer anio, Integer mes);
    Optional<Cuota> findByPagoId(Long pagoId);
}