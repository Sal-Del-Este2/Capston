package com.scout.backend_scout.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.scout.backend_scout.model.Mensaje;

public interface MensajeRepository extends JpaRepository<Mensaje, Long>{
    @EntityGraph (attributePaths = {"remitente", "destinatario", "adjuntos"})
    List<Mensaje> findByDestinatarioIdOrderByFechaCreacionDesc(Long destinatarioId);
    @EntityGraph (attributePaths = {"remitente", "destinatario", "adjuntos"})
    List<Mensaje> findByRemitenteIdOrderByFechaCreacionDesc (Long remitenteId);
    @EntityGraph(attributePaths = {"remitente", "destinatario", "adjuntos"})
    @org.springframework.data.jpa.repository.Query("""
        SELECT DISTINCT m
            FROM Mensaje m
            LEFT JOIN FETCH m.remitente
            LEFT JOIN FETCH m.destinatario
            LEFT JOIN FETCH m.adjuntos
        WHERE m.id = :id
    """)
    Optional<Mensaje> findWithRelationsById (@org.springframework.data.repository.query.Param("id") Long id);
    @Query("""
        SELECT DISTINCT m
        FROM Mensaje m
        LEFT JOIN FETCH m.remitente
        LEFT JOIN FETCH m.destinatario
        LEFT JOIN FETCH m.adjuntos
        ORDER BY m.fechaCreacion DESC
    """)
    List<Mensaje> findAllWithRelations();
}
