package com.scout.microservicio_actividades.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "eventos")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "titulo", nullable = false, length = 180)
    private String titulo;
    @Column(name = "fecha_realizacion", nullable = false)
    private LocalDate fechaRealizacion;
    @Column(name = "lugar", nullable = false, length = 180)
    private String lugar;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoContenido estado;
    @Column(name = "detalle", nullable = false, length = 500)
    private String detalle;
    @Column(name = "creador_id", nullable = false)
    private Long creadorId;
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FotoEvento> fotos = new ArrayList<>();
    public Evento() { }
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getTitulo() {return titulo;}
    public void setTitulo(String titulo) {this.titulo = titulo;}
    public LocalDate getFechaRealizacion() {return fechaRealizacion;}
    public void setFechaRealizacion(LocalDate fechaRealizacion) {this.fechaRealizacion = fechaRealizacion;}
    public String getLugar() {return lugar;}
    public void setLugar(String lugar) {this.lugar = lugar;}
    public EstadoContenido getEstado() {return estado;}
    public void setEstado(EstadoContenido estado) {this.estado = estado;}
    public String getDetalle() {return detalle;}
    public void setDetalle(String detalle) {this.detalle = detalle;}
    public Long getCreadorId() {return creadorId;}
    public void setCreadorId(Long creadorId) {this.creadorId = creadorId;}
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
    public LocalDateTime getFechaActualizacion() {return fechaActualizacion;}
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {this.fechaActualizacion = fechaActualizacion;}
    public List<FotoEvento> getFotos() {return fotos;}
    public void setFotos(List<FotoEvento> fotos) {this.fotos = fotos;}
    public void agregarFoto(FotoEvento foto) {fotos.add(foto); foto.setEvento(this);}
    public void quitarFoto(FotoEvento foto) {fotos.remove(foto); foto.setEvento(null);}
    
}
