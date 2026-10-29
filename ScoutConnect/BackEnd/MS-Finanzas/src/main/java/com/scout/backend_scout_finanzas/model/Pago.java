package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(name = "tipo_pago", nullable = false)
    private String tipoPago;
    @Column(name = "descripcion")
    private String descripcion;
    @Column(name = "monto", nullable = false)
    private Double monto;
    @Column(name = "cuota_id")
    private Long cuotaId;
    @Column(name = "estado", nullable = false)
    private String estado;
    @Column(name = "commerce_order")
    private String commerceOrder;
    @Column(name = "token_flow")
    private String tokenFlow;
    @Column(name = "flow_order")
    private String flowOrder;
    @Column(name = "flow_status")
    private String flowStatus;
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    // Getters y Setters
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Long getUsuarioId() {return usuarioId;}
    public void setUsuarioId(Long usuarioId) {this.usuarioId = usuarioId;}
    public String getTipoPago() {return tipoPago;}
    public void setTipoPago(String tipoPago) {this.tipoPago = tipoPago;}
    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}
    public Double getMonto() {return monto;}
    public void setMonto(Double monto) {this.monto = monto;}
    public Long getCuotaId() {return cuotaId;}
    public void setCuotaId(Long cuotaId) {this.cuotaId = cuotaId;}
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
    public String getCommerceOrder() {return commerceOrder;}
    public void setCommerceOrder(String commerceOrder) {this.commerceOrder = commerceOrder;}
    public String getTokenFlow() {return tokenFlow;}
    public void setTokenFlow(String tokenFlow) {this.tokenFlow = tokenFlow;}
    public String getFlowOrder() {return flowOrder;}
    public void setFlowOrder(String flowOrder) {this.flowOrder = flowOrder;}
    public String getFlowStatus() {return flowStatus;}
    public void setFlowStatus(String flowStatus) {this.flowStatus = flowStatus;}
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
    public LocalDateTime getFechaPago() {return fechaPago;}
    public void setFechaPago(LocalDateTime fechaPago) {this.fechaPago = fechaPago;}
}