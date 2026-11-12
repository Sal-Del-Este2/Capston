package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_compra")
@Getter
@Setter
@NoArgsConstructor
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false)
    private OrdenCompra orden;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    @Column(name = "nombre_producto", nullable = false)
    private String nombreProducto;
    @Column(nullable = false)
    private Integer cantidad;
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 0)
    private BigDecimal precioUnitario;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotal;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal neto;
    @Column(name = "monto_impuesto", nullable = false, precision = 12, scale = 0)
    private BigDecimal montoImpuesto;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "impuesto_id", nullable = false)
    private Impuesto impuesto;
}