package com.scout.MS_Finanzas.repository;

import com.scout.MS_Finanzas.model.Grupo;
import com.scout.MS_Finanzas.model.Producto;
import com.scout.MS_Finanzas.model.Rama;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {
    Optional<Producto> findByTituloIgnoreCase(String titulo);
    Page<Producto> findByEstadoNombreAndGrupoIdAndRamaId(
            String estadoNombre,
            Long grupoId,
            Long ramaId,
            Pageable pageable
    );
    Page<Producto> findByEstadoNombre(String estadoNombre, Pageable pageable);
    boolean existsByGrupoAndEstadoNombre(Grupo grupo, String estadoNombre);
    boolean existsByRamaAndEstadoNombre(Rama rama, String estadoNombre);
    // Bloquea los productos mientras se confirma una compra.
    // El orden por ID reduce el riesgo de bloqueos cruzados.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT p
        FROM Producto p
        WHERE p.id IN :ids
        ORDER BY p.id ASC
    """)
    List<Producto> buscarTodosPorIdConBloqueo(@Param("ids") Collection<Long> ids);
}