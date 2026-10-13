package com.scout.ms_pagina_publica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InformacionInstitucionalRequestDTO(
    @NotBlank(message = "Nombre de la institución es obligatorio.")
    @Size(max = 200, message = "Nombre no puede superar 200 caracteres.")
    String nombreInstitucion,
    String mision,
    String vision,
    String historia,
    String valores,
    @Email(message = "El correo de contacto no tiene un formato válido.")
    @Size(max = 150, message = "Correo no puede superar 150 caracteres.")
    String correoContacto,
    @Size(max = 30, message = "Teléfono no puede superar 30 caracteres.")
    String telefonoContacto,
    @Size(max = 255, message = "Sitio web no puede superar 255 caracteres.")
    String sitioWeb,
    @Size(max = 500, message = "La URL del logo no puede superar 500 caracteres.")
    String logoUrl
) {

}
