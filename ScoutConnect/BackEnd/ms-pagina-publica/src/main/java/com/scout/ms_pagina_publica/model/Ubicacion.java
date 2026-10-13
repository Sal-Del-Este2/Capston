package com.scout.ms_pagina_publica.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ubicaciones")
@Getter
@Setter
@NoArgsConstructor
public class Ubicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "comuna_id", nullable = false)
    private Comuna comuna;
    @Column(name = "nombre", nullable = false, unique = true, length = 150)
    private String nombre;
    @Column(name = "descripcion", length = 500)
    private String descripcion;
    @Column(name = "direccion", length = 255)
    private String direccion;
    @Column(name = "latitud", precision = 10, scale = 7)
    private BigDecimal latitud;
    @Column(name = "longitud", precision = 10, scale = 7)
    private BigDecimal longitud;
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @PrePersist
    public void asignarFechasCreacion() {if (fechaCreacion == null) {fechaCreacion = LocalDateTime.now();}fechaActualizacion = LocalDateTime.now();}
    @PreUpdate
    public void actualizarFecha() {fechaActualizacion = LocalDateTime.now();
    }
}
