package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "titulo", nullable = false, length = 180)
    private String titulo;
    @Column(name = "detalle", nullable = false, length = 1000)
    private String detalle;
    @Column(name = "precio", nullable = false)
    private Double precio;
    @Column(name = "stock", nullable = false)
    private Integer stock;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rama_id", nullable = false)
    private Rama rama;
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FotoProducto> fotos;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Grupo getGrupo() { return grupo; }
    public void setGrupo(Grupo grupo) { this.grupo = grupo; }
    public Rama getRama() { return rama; }
    public void setRama(Rama rama) { this.rama = rama; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
    public List<FotoProducto> getFotos() { return fotos; }
    public void setFotos(List<FotoProducto> fotos) { this.fotos = fotos; }
}