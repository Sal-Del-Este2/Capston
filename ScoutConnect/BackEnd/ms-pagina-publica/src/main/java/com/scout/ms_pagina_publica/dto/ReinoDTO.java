package com.scout.ms_pagina_publica.dto;

public record ReinoDTO(
    Long id,
    String nombre,
    String descripcion,
    Boolean activo,
    Long comunaId,
    String comunaNombre,
    String regionNombre
) { }
