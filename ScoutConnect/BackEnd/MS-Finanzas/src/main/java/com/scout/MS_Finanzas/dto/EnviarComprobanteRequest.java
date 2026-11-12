package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnviarComprobanteRequest {
    @NotBlank(message = "Debe ingresar un correo electrónico.")
    @Email(message = "El correo electrónico no tiene un formato válido.")
    private String correo;
}