package com.scout.ms_pagina_publica.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "informacion_institucional")
@Getter
@Setter
@NoArgsConstructor
public class InformacionInstitucional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre_institucion", nullable = false, length = 200)
    private String nombreInstitucion;
    @Column(name = "mision", columnDefinition = "TEXT")
    private String mision;
    @Column(name = "vision", columnDefinition = "TEXT")
    private String vision;
    @Column(name = "historia", columnDefinition = "TEXT")
    private String historia;
    @Column(name = "valores", columnDefinition = "TEXT")
    private String valores;
    @Column(name = "correo_contacto", length = 150)
    private String correoContacto;
    @Column(name = "telefono_contacto", length = 30)
    private String telefonoContacto;
    @Column(name = "sitio_web", length = 255)
    private String sitioWeb;
    @Column(name = "logo_url", length = 500)
    private String logoUrl;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @PrePersist
    @PreUpdate
    public void actualizarFecha() {fechaActualizacion = LocalDateTime.now();}
}
