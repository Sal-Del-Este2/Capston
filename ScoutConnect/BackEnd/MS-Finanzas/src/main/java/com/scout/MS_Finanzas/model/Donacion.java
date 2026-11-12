package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
@Getter
@Setter
@NoArgsConstructor
public class Donacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id")
    private Long usuarioId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_donacion_id", nullable = false)
    private TipoDonacion tipoDonacion;
    @Column(name = "nombre_donante")
    private String nombreDonante;
    @Column(name = "correo_donante")
    private String correoDonante;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal monto;
    @Column(nullable = false)
    private LocalDateTime fecha;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
}