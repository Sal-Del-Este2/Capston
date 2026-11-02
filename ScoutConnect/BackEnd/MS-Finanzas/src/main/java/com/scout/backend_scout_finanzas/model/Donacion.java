package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
public class Donacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id")
    private Long usuarioId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_donacion_id", nullable = false)
    private TipoDonacion tipoDonacion;
    @Column(name = "monto", nullable = false)
    private Double monto;
    @Column(name = "fecha")
    private LocalDateTime fecha;
    @Column(name = "pago_id")
    private Long pagoId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public TipoDonacion getTipoDonacion() { return tipoDonacion; }
    public void setTipoDonacion(TipoDonacion tipoDonacion) { this.tipoDonacion = tipoDonacion; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public Long getPagoId() { return pagoId; }
    public void setPagoId(Long pagoId) { this.pagoId = pagoId; }
    public Grupo getGrupo() { return grupo; }
    public void setGrupo(Grupo grupo) { this.grupo = grupo; }
}