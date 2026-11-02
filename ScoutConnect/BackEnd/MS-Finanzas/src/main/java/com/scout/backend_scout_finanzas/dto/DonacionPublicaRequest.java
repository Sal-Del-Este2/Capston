package com.scout.backend_scout_finanzas.dto;

public class DonacionPublicaRequest {
    private String nombre;
    private String correo;
    private Double monto;
    private Long grupoId;
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public Long getGrupoId() { return grupoId; }
    public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }
}