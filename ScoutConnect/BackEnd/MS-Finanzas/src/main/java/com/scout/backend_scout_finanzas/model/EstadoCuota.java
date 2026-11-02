package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "estados_cuota")
public class EstadoCuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}