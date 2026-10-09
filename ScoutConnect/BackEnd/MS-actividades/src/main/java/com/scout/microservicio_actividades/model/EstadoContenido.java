package com.scout.microservicio_actividades.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table (name ="estados_contenido")
public class EstadoContenido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;
    @Column(name = "nombre", nullable = false, unique = true, length = 20)
    private String nombre;
    public EstadoContenido() { }
    public EstadoContenido(Short id, String nombre) {this.id = id; this.nombre = nombre;}
    public Short getId() {return id;}
    public void setId(Short id) {this.id = id;}
    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
}
