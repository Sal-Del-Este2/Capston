package com.scout.ms_pagina_publica.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity 
@Table (name = "reinos")
@Getter
@Setter
@NoArgsConstructor
public class Reino {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne (fetch = FetchType.EAGER)
    @JoinColumn (name = "comuna_id", nullable = false)
    private Comuna comuna;
    @Column (name = "nombre", nullable = false, unique = true, length = 120)
    private String nombre;
    @Column(name = "descripcion", length = 500)
    private String descripcion;
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @PrePersist 
    public void asignarFechaCreacion() {if (fechaCreacion == null) {fechaCreacion = LocalDateTime.now();}}
}
