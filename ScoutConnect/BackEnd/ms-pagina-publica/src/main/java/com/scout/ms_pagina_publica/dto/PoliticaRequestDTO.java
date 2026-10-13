package com.scout.ms_pagina_publica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PoliticaRequestDTO(
    @NotNull (message = "La política es obligatorio.")
    Long tipoPoliticaId,
    @NotBlank (message = "El título es obligatorio.")
    @Size (max = 200, message = "El título no puede superar 200 caracteres.")
    String titulo,
    @NotBlank(message = "El contenido es obligatorio.")
    String contenido,
    Boolean publicada
) {

}
