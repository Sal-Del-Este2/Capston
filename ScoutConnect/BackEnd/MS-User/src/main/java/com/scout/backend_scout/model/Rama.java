package com.scout.backend_scout.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ramas")
public class Rama {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_rama_id", nullable = false)
    private EstadoRama estadoRama;
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
    public EstadoRama getEstadoRama() {return estadoRama;}
    public void setEstadoRama(EstadoRama estadoRama) {this.estadoRama = estadoRama;}
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
}