package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes_compra")
@Getter
@Setter
@NoArgsConstructor
public class OrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal total;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal neto;
    @Column(name = "monto_impuesto", nullable = false, precision = 12, scale = 0)
    private BigDecimal montoImpuesto;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "impuesto_id", nullable = false)
    private Impuesto impuesto;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoOrden estado;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago;
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<DetalleCompra> detalles = new ArrayList<>();
    @Column(nullable = false)
    private LocalDateTime fecha;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    public void agregarDetalle(DetalleCompra detalle) {detalles.add(detalle); detalle.setOrden(this);}
}