package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "impuestos")
@Getter
@Setter
@NoArgsConstructor
public class Impuesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String nombre;
    @Column(nullable = false, unique = true)
    private String codigo;
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;
    @Column(name = "vigente_desde", nullable = false)
    private LocalDate vigenteDesde;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_impuesto_id", nullable = false)
    private EstadoImpuesto estado;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}