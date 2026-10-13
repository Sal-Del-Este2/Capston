package com.scout.ms_pagina_publica.dto;

import java.time.LocalDateTime;

public record ContactoReinoResponseDTO(
    Long id,
    Long reinoId,
    String reinoNombre,
    Long usuarioId,
    String cargo,
    String correo,
    String telefono,
    Boolean activo,
    LocalDateTime fechaAsignacion,
    LocalDateTime fechaDesactivacion
) {

}
