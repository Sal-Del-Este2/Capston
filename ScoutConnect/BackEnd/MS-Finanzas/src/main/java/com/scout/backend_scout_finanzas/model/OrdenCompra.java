package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(name = "total", nullable = false)
    private Double total;
    @Column(name = "estado", nullable = false)
    private String estado;
    @Column(name = "fecha")
    private LocalDateTime fecha;
    @Column(name = "pago_id")
    private Long pagoId;
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Long getUsuarioId() {return usuarioId;}
    public void setUsuarioId(Long usuarioId) {this.usuarioId = usuarioId;}
    public Double getTotal() {return total;}
    public void setTotal(Double total) {this.total = total;}
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
    public LocalDateTime getFecha() {return fecha;}
    public void setFecha(LocalDateTime fecha) {this.fecha = fecha;}
    public Long getPagoId() {return pagoId;}
    public void setPagoId(Long pagoId) {this.pagoId = pagoId;}
}