package com.scout.ms_pagina_publica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table (name = "tipos_politica")
@Getter
@Setter
@NoArgsConstructor
public class TipoPolitica {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Column (name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;
    @Column(name = "descripcion", length = 300)
    private String descripcion;
}