package com.scout.ms_pagina_publica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContactoReinoRequestDTO(
    @NotNull (message = "Nombre del reino obligatorio.")
    Long reinoId,
    @NotNull(message = "El usuario representante obligatorio.")
    Long usuarioId,
    @Size (max = 120, message = "El cargo no puede superar 120 caracteres.")
    String cargo,
    @Email (message = "El correo no tiene un formato válido.")
    @Size(max = 150, message = "El correo no puede superar 150 caracteres.")
    String correo,
    @Size(max = 30, message = "El teléfono no puede superar 30 caracteres.")
    String telefono
) { }
