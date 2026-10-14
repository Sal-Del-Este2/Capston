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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity 
@Table (name = "politicas")
@Getter
@Setter
@NoArgsConstructor
public class Politica {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne (fetch = FetchType.EAGER)
    @JoinColumn (name = "tipo_politica_id", nullable = false)
    private TipoPolitica tipoPolitica;
    @Column (name = "titulo", nullable = false, length = 200)
    private String titulo;
    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;
    @Column(name = "version", nullable = false)
    private Integer version = 1;
    @Column(name = "publicada", nullable = false)
    private Boolean publicada = false;
    @Column(name = "fecha_publicacion")
    private LocalDateTime fechaPublicacion;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @PrePersist 
    public void asignarFechasCreacion() {if (fechaCreacion == null) {fechaCreacion = LocalDateTime.now();}fechaActualizacion = LocalDateTime.now();}
    @PreUpdate 
    public void actualizarFecha() {fechaActualizacion = LocalDateTime.now();}
}
