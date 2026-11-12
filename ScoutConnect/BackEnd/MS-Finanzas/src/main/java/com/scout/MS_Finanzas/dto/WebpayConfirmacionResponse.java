package com.scout.MS_Finanzas.dto;

public class WebpayConfirmacionResponse {
    private Long ordenId;
    private boolean aprobado;
    public WebpayConfirmacionResponse(Long ordenId, boolean aprobado) {this.ordenId = ordenId; this.aprobado = aprobado;}
    public Long getOrdenId() {return ordenId;}
    public boolean isAprobado() {return aprobado;}
}