package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoOrden estado;
    @Column(name = "fecha")
    private LocalDateTime fecha;
    @Column(name = "pago_id")
    private Long pagoId;
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCompra> detalles;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public EstadoOrden getEstado() { return estado; }
    public void setEstado(EstadoOrden estado) { this.estado = estado; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public Long getPagoId() { return pagoId; }
    public void setPagoId(Long pagoId) { this.pagoId = pagoId; }
    public List<DetalleCompra> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleCompra> detalles) { this.detalles = detalles; }
}