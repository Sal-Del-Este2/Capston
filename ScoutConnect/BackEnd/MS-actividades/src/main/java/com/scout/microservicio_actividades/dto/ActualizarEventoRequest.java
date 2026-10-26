package com.scout.microservicio_actividades.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ActualizarEventoRequest {
    @NotBlank(message = "El título del evento es obligatorio.")
    @Size(max = 180, message = "El título no puede superar los 180 caracteres.")
    private String titulo;
    @NotNull(message = "La fecha de realización es obligatoria.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaRealizacion;
    @NotBlank(message = "El lugar es obligatorio.")
    @Size(max = 180, message = "El lugar no puede superar los 180 caracteres.")
    private String lugar;
    @NotBlank(message = "El estado es obligatorio.")
    @Size(max = 20, message = "El estado no puede superar los 20 caracteres.")
    private String estado;
    @NotBlank(message = "El detalle del evento es obligatorio.")
    @Size(max = 500, message = "El detalle no puede superar los 500 caracteres.")
    private String detalle;

    @NotNull(message = "Debe seleccionar una comuna.")
    private Long comunaId;
    @NotNull(message = "Debe seleccionar un grupo scout.")
    private Long grupoId;

    public ActualizarEventoRequest() { }
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

    public Long getComunaId() { return comunaId; }
    public void setComunaId(Long comunaId) { this.comunaId = comunaId; }
    public Long getGrupoId() { return grupoId; }
    public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }
}
