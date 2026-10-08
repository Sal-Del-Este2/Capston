package com.scout.backend_scout.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
// import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table (name = "adjuntos_mensaje")
public class AdjuntoMensaje {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore 
    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "mensaje_id", nullable = false)
    private Mensaje mensaje;
    @Column (name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;
    @Column(name = "tipo_archivo", nullable = false, length = 100)
    private String tipoArchivo;
    // @Lob 
    @Column (name = "datos", nullable = false, columnDefinition = "BYTEA")
    private byte[] datos;
    @Column (name = "tamanio_bytes", nullable = false)
    private Long tamanioBytes;
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Mensaje getMensaje() {return mensaje;}
    public void setMensaje(Mensaje mensaje) {this.mensaje = mensaje;}
    public String getNombreArchivo() {return nombreArchivo;}
    public void setNombreArchivo(String nombreArchivo) {this.nombreArchivo = nombreArchivo;}
    public String getTipoArchivo() {return tipoArchivo;}
    public void setTipoArchivo(String tipoArchivo) {this.tipoArchivo = tipoArchivo;}
    public byte[] getDatos() {return datos;}
    public void setDatos(byte[] datos) {this.datos = datos;}
    public Long getTamanioBytes() {return tamanioBytes;}
    public void setTamanioBytes(Long tamanioBytes) {this.tamanioBytes = tamanioBytes;}
}
