package com.scout.MS_Finanzas.exception;

public class LimiteEnvioComprobanteException extends RuntimeException {
    private final long segundosRestantes;
    public LimiteEnvioComprobanteException(String mensaje, long segundosRestantes) {super(mensaje); this.segundosRestantes = segundosRestantes;}
    public long getSegundosRestantes() {return segundosRestantes;}
}