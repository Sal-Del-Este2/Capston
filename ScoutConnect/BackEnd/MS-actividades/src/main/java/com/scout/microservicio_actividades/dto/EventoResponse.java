package com.scout.microservicio_actividades.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventoResponse {
    private Long id;
    private String titulo;
    private LocalDate fechaRealizacion;
    private String lugar;
    private String estado;
    private String detalle;
    private Long creadorId;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<FotoEventoResponse> fotos = new ArrayList<>();
    public EventoResponse() { }
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getTitulo() {return titulo;}
    public void setTitulo(String titulo) {this.titulo = titulo;}
    public LocalDate getFechaRealizacion() {return fechaRealizacion;}
    public void setFechaRealizacion(LocalDate fechaRealizacion) {this.fechaRealizacion = fechaRealizacion;}
    public String getLugar() {return lugar;}
    public void setLugar(String lugar) {this.lugar = lugar;}
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
    public String getDetalle() {return detalle;}
    public void setDetalle(String detalle) {this.detalle = detalle;}
    public Long getCreadorId() {return creadorId;}
    public void setCreadorId(Long creadorId) {this.creadorId = creadorId;}
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
    public LocalDateTime getFechaActualizacion() {return fechaActualizacion;}
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {this.fechaActualizacion = fechaActualizacion;}
    public List<FotoEventoResponse> getFotos() {return fotos;}
    public void setFotos(List<FotoEventoResponse> fotos) {this.fotos = fotos;}

}