
package com.scout.microservicio_actividades.dto;

import java.time.LocalDateTime;

public class FotoEventoResponse {
    private Long id;
    private String nombreArchivo;
    private String tipoContenido;
    private Long tamanioBytes;
    private Boolean esPrincipal;
    private Short ordenVisualizacion;
    private LocalDateTime fechaCarga;
    private String url;
    public FotoEventoResponse() { }
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNombreArchivo() {return nombreArchivo;}
    public void setNombreArchivo(String nombreArchivo) {this.nombreArchivo = nombreArchivo;}
    public String getTipoContenido() {return tipoContenido;}
    public void setTipoContenido(String tipoContenido) {this.tipoContenido = tipoContenido;}
    public Long getTamanioBytes() {return tamanioBytes;}
    public void setTamanioBytes(Long tamanioBytes) {this.tamanioBytes = tamanioBytes;}
    public Boolean getEsPrincipal() {return esPrincipal;}
    public void setEsPrincipal(Boolean esPrincipal) {this.esPrincipal = esPrincipal;}
    public Short getOrdenVisualizacion() {return ordenVisualizacion;}
    public void setOrdenVisualizacion(Short ordenVisualizacion) {this.ordenVisualizacion = ordenVisualizacion;}
    public LocalDateTime getFechaCarga() {return fechaCarga;}
    public void setFechaCarga(LocalDateTime fechaCarga) {this.fechaCarga = fechaCarga;}
    public String getUrl() {return url;}
    public void setUrl(String url) {this.url = url;}
}