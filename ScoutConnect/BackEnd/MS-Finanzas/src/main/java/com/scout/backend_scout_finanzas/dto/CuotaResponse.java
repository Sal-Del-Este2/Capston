package com.scout.backend_scout_finanzas.dto;

import java.time.LocalDate;

public class CuotaResponse {
    private Long id;
    private Integer anio;
    private Integer mes;
    private Double monto;
    private LocalDate fechaVencimiento;
    private String estado;
    private boolean puedePagar;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public boolean isPuedePagar() { return puedePagar; }
    public void setPuedePagar(boolean puedePagar) { this.puedePagar = puedePagar; }
}