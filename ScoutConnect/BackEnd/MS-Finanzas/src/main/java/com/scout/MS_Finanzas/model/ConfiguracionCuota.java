package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_cuotas")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionCuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal monto;
    @Column(name = "vigente_desde", nullable = false)
    private LocalDate vigenteDesde;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_configuracion_id", nullable = false)
    private EstadoConfiguracionCuota estado;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}