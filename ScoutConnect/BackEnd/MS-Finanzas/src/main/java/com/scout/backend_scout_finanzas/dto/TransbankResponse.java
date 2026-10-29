package com.scout.backend_scout_finanzas.dto;

public class TransbankResponse {
    private String urlPago;
    private String token;
    private String buyOrder;
    public String getUrlPago() {return urlPago;}
    public void setUrlPago(String urlPago) {this.urlPago = urlPago;}
    public String getToken() {return token;}
    public void setToken(String token) {this.token = token;}
    public String getBuyOrder() {return buyOrder;}
    public void setBuyOrder(String buyOrder) {this.buyOrder = buyOrder;}
}