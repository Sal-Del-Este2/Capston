package com.scout.backend_scout_finanzas.dto;

public class ResumenCuotasResponse {
    private long cuotasPagadas;
    private long cuotasPendientes;
    private double montoAdeudado;
    public long getCuotasPagadas() { return cuotasPagadas; }
    public void setCuotasPagadas(long cuotasPagadas) { this.cuotasPagadas = cuotasPagadas; }
    public long getCuotasPendientes() { return cuotasPendientes; }
    public void setCuotasPendientes(long cuotasPendientes) { this.cuotasPendientes = cuotasPendientes; }
    public double getMontoAdeudado() { return montoAdeudado; }
    public void setMontoAdeudado(double montoAdeudado) { this.montoAdeudado = montoAdeudado; }
}