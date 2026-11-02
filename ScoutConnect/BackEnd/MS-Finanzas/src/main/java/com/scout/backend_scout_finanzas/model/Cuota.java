package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cuotas")
public class Cuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(name = "anio", nullable = false)
    private Integer anio;
    @Column(name = "mes", nullable = false)
    private Integer mes;
    @Column(name = "monto", nullable = false)
    private Double monto;
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoCuota estado;
    @Column(name = "pago_id")
    private Long pagoId;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public EstadoCuota getEstado() { return estado; }
    public void setEstado(EstadoCuota estado) { this.estado = estado; }
    public Long getPagoId() { return pagoId; }
    public void setPagoId(Long pagoId) { this.pagoId = pagoId; }
}