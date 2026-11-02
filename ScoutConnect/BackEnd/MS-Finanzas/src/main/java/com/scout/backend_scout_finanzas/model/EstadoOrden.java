package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "estados_orden")
public class EstadoOrden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    @OneToMany(mappedBy = "estado")
    private List<OrdenCompra> ordenes;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}