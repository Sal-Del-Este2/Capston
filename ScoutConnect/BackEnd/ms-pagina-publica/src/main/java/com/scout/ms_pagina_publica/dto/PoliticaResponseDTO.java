package com.scout.ms_pagina_publica.dto;

import java.time.LocalDateTime;

public record PoliticaResponseDTO(
    Long id,
    Long tipoPoliticaId,
    String tipoPoliticaNombre,
    String titulo,
    String contenido,
    Integer version,
    Boolean publicada,
    LocalDateTime fechaPublicacion,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion
) {

}
