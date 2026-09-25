package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;           // compra, donación, cuota
    private Double monto;
    private LocalDateTime fecha;
    private String estado;         // pagado, pendiente, rechazado
    private String descripcion;
    private Long usuarioId;

    private String transactionId;  // ID de Flow
    private String tokenFlow;      // token de seguridad
    private String urlRetorno;     // URL de confirmación
    private String metodoPago;     // tarjeta, transferencia, etc.
    private String comprobante;    // código de autorización
    private String observaciones;  // notas internas

    // 🔹 Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getTokenFlow() { return tokenFlow; }
    public void setTokenFlow(String tokenFlow) { this.tokenFlow = tokenFlow; }

    public String getUrlRetorno() { return urlRetorno; }
    public void setUrlRetorno(String urlRetorno) { this.urlRetorno = urlRetorno; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getComprobante() { return comprobante; }
    public void setComprobante(String comprobante) { this.comprobante = comprobante; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
