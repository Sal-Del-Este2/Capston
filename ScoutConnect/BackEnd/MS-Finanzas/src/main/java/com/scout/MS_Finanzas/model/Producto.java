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
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 180)
    private String titulo;
    @Column(nullable = false, length = 200)
    private String detalle;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal precio;
    @Column(nullable = false)
    private Integer stock;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rama_id", nullable = false)
    private Rama rama;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_producto_id", nullable = false)
    private EstadoProducto estado;
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordenVisualizacion ASC")
    private List<FotoProducto> fotos = new ArrayList<>();
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    public void agregarFoto(FotoProducto foto) {fotos.add(foto); foto.setProducto(this);}
    public void quitarFoto(FotoProducto foto) {fotos.remove(foto); foto.setProducto(null);}
}