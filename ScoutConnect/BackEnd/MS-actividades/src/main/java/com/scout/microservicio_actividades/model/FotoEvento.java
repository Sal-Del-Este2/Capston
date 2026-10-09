package com.scout.microservicio_actividades.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "fotos_evento")
public class FotoEvento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;
    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;
    @Column(name = "tipo_contenido", nullable = false, length = 100)
    private String tipoContenido;
    @Column(name = "tamanio_bytes", nullable = false)
    private Long tamanioBytes;
    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal = false;
    @Column(name = "orden_visualizacion", nullable = false)
    private Short ordenVisualizacion = 1;
    @CreationTimestamp
    @Column(name = "fecha_carga", nullable = false, updatable = false)
    private LocalDateTime fechaCarga;
    public FotoEvento() { }
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Evento getEvento() {return evento;}
    public void setEvento(Evento evento) {this.evento = evento;}
    public String getNombreArchivo() {return nombreArchivo;}
    public void setNombreArchivo(String nombreArchivo) {this.nombreArchivo = nombreArchivo;}
    public String getRutaArchivo() {return rutaArchivo;}
    public void setRutaArchivo(String rutaArchivo) {this.rutaArchivo = rutaArchivo;}
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
}
