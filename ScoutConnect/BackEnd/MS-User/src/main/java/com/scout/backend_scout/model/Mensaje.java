package com.scout.backend_scout.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity 
@Table (name = "mensajes")
public class Mensaje {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "remitente_id", nullable = false)
    private Usuario remitente;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;
    @Column(name = "asunto", nullable = false, length = 255)
    private String asunto;
    @Column(name = "contenido", nullable = false, length = 500)
    private String contenido;
    @Column(name = "fecha_creacion", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;
    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "NO_LEIDO";
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensaje_padre_id")
    private Mensaje mensajePadre;
    @OneToMany(mappedBy = "mensaje", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<AdjuntoMensaje> adjuntos =new ArrayList<>();
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Usuario getRemitente() {return remitente;}
    public void setRemitente(Usuario remitente) {this.remitente = remitente;}
    public Usuario getDestinatario() {return destinatario;}
    public void setDestinatario(Usuario destinatario) {this.destinatario = destinatario;}
    public String getAsunto() {return asunto;}
    public void setAsunto(String asunto) {this.asunto = asunto;}
    public String getContenido() {return contenido;}
    public void setContenido(String contenido) {this.contenido = contenido;}
    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
    public LocalDateTime getFechaLectura() {return fechaLectura;}
    public void setFechaLectura(LocalDateTime fechaLectura) {this.fechaLectura = fechaLectura;}
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
    public Mensaje getMensajePadre() {return mensajePadre;}
    public void setMensajePadre(Mensaje mensajePadre) {this.mensajePadre = mensajePadre;}
    public List<AdjuntoMensaje> getAdjuntos() {return adjuntos;}
    public void setAdjuntos(List<AdjuntoMensaje> adjuntos) {this.adjuntos = adjuntos;}
    public void agregarAdjunto(AdjuntoMensaje adjunto) {adjuntos.add(adjunto); adjunto.setMensaje(this);}
    public void eliminarAdjunto(AdjuntoMensaje adjunto) {adjuntos.remove(adjunto);adjunto.setMensaje(null);}  
}