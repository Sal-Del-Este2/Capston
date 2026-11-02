package com.scout.backend_scout_finanzas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fotos_producto")
public class FotoProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    @Column(name = "ruta_archivo", nullable = false, unique = true)
    private String rutaArchivo;
    @Column(name = "tipo_contenido", nullable = false)
    private String tipoContenido;
    @Column(name = "tamanio_bytes", nullable = false)
    private Long tamanioBytes;
    @Column(name = "orden_visualizacion", nullable = false)
    private Short ordenVisualizacion;
    @Column(name = "fecha_carga", nullable = false)
    private LocalDateTime fechaCarga;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }
    public String getTipoContenido() { return tipoContenido; }
    public void setTipoContenido(String tipoContenido) { this.tipoContenido = tipoContenido; }
    public Long getTamanioBytes() { return tamanioBytes; }
    public void setTamanioBytes(Long tamanioBytes) { this.tamanioBytes = tamanioBytes; }
    public Short getOrdenVisualizacion() { return ordenVisualizacion; }
    public void setOrdenVisualizacion(Short ordenVisualizacion) { this.ordenVisualizacion = ordenVisualizacion; }
    public LocalDateTime getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(LocalDateTime fechaCarga) { this.fechaCarga = fechaCarga; }
}