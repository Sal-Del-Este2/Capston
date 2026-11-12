package com.scout.MS_Finanzas.exception;

public class EnvioCorreoException extends RuntimeException {
    public EnvioCorreoException(String mensaje, Throwable causa) {super(mensaje, causa);}
}