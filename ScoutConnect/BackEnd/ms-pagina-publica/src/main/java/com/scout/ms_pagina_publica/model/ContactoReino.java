package com.scout.ms_pagina_publica.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "contactos_reino")
@Getter
@Setter
@NoArgsConstructor
public class ContactoReino {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reino_id", nullable = false)
    private Reino reino;
    // Referencia al usuario del ms-user
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    @Column(name = "cargo", length = 120)
    private String cargo;
    @Column(name = "correo", length = 150)
    private String correo;
    @Column(name = "telefono", length = 30)
    private String telefono;
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    @Column(name = "fecha_asignacion", nullable = false, updatable = false)
    private LocalDateTime fechaAsignacion;
    @Column(name = "fecha_desactivacion")
    private LocalDateTime fechaDesactivacion;
    @PrePersist
    public void asignarFechaAsignacion() {if (fechaAsignacion == null) {fechaAsignacion = LocalDateTime.now();}}
}
