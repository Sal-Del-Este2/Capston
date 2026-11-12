package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cuotas")
@Getter
@Setter
@NoArgsConstructor
public class Cuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(nullable = false)
    private Integer anio;
    @Column(nullable = false)
    private Integer mes;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal monto;
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoCuota estado;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rama_id")
    private Rama rama;
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
}