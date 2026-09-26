package com.scout.backend_scout.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String nickname;
    private String correo;
    private String password;
    private String rol;
    private String telefono;
    private String nacimiento;
    private String comuna;
    private String direccion;
    private String grupo;
    private String rut;
    // Nuevo campo para estado
    private String estado;
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
    public String getRol() {return rol;}
    public void setRol(String rol) {this.rol = rol;}
    public String getRut() {return rut;}
    public void setRut(String rut) {this.rut = rut;}
    public String getTelefono() {return telefono;}
    public void setTelefono(String telefono) {this.telefono = telefono;}
    public String getNacimiento() {return nacimiento;}
    public void setNacimiento(String nacimiento) {this.nacimiento = nacimiento;}
    public String getComuna() {return comuna;}
    public void setComuna(String comuna) {this.comuna = comuna;}
    public String getDireccion() {return direccion;}
    public void setDireccion(String direccion) {this.direccion = direccion;}
    public String getGrupo() {return grupo;}
    public void setGrupo(String grupo) {this.grupo = grupo;}
    // Métodos para estado
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
}