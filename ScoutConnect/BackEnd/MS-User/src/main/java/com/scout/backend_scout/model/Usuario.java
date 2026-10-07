package com.scout.backend_scout.model;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
// import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
// import jakarta.persistence.*;

@Entity
@Table (name = "usuarios")
public class Usuario {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre")private String nombre;
    @Column(name = "rut")private String rut;
    @Column(name = "telefono")private String telefono;
    @Column(name = "nacimiento")private LocalDate nacimiento;
    @Column(name = "nickname")private String nickname;
    @Column(name = "correo")private String correo;
    @Column(name = "direccion")private String direccion;
    @Column(name = "password")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)private String password;
    @ManyToOne
    @JoinColumn (name = "rol_id") private Rol rol;
    @ManyToOne
    @JoinColumn(name = "comuna_id") private Comuna comuna;
    @ManyToOne
    @JoinColumn(name = "region_id") private Region region;
    @ManyToOne
    @JoinColumn(name = "grupo_id") private Grupo grupo;
    @ManyToOne
    @JoinColumn(name = "estado_id") private Estado estado;
    // Métodos para el pdf
    // @Lob 
    @Column(name = "pdf_dato", columnDefinition = "BYTEA")private byte[] pdfDato; // guarda el archivo
    @Column(name = "pdf_nombre")private String pdfNombre; // guardar el nombre del archivo
    // --- Getters y setters ---
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
    public String getNickname() {return nickname;}
    public void setNickname(String nickname) {this.nickname = nickname;}
    public String getCorreo() {return correo;}
    public void setCorreo(String correo) {this.correo = correo;}
    public String getPassword() {return password;}
    public void setPassword(String password) {this.password = password;}
    public String getRut() {return rut;}
    public void setRut(String rut) {this.rut = rut;}
    public String getTelefono() {return telefono;}
    public void setTelefono(String telefono) {this.telefono = telefono;}
    public LocalDate getNacimiento() {return nacimiento;}
    public void setNacimiento(LocalDate nacimiento) {this.nacimiento = nacimiento;}
    public String getDireccion() {return direccion;}
    public void setDireccion(String direccion) {this.direccion = direccion;}
    public Comuna getComuna() {return comuna;}
    public void setComuna(Comuna comuna) {this.comuna = comuna;}
    public Estado getEstado() {return estado;}
    public void setEstado(Estado estado) {this.estado = estado;}
    public Region getRegion() {return region;}
    public void setRegion(Region region) {this.region = region;}
    public Grupo getGrupo() {return grupo;}
    public void setGrupo(Grupo grupo) {this.grupo = grupo;}
    public Rol getRol() {return rol;}
    public void setRol(Rol rol) {this.rol = rol;}
    // Getters y Setters
    public byte[] getPdfDato() { return pdfDato; }
    public void setPdfDato(byte[] pdfDato) {this.pdfDato = pdfDato; }
    public String getPdfNombre() { return pdfNombre; }
    public void setPdfNombre(String pdfNombre) {this.pdfNombre = pdfNombre; }
}