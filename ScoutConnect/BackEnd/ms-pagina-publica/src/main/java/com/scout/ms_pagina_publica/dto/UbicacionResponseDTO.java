package com.scout.ms_pagina_publica.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UbicacionResponseDTO(
    Long id,
    String nombre,
    String descripcion,
    String direccion,
    Long comunaId,
    String comunaNombre,
    String regionNombre,
    BigDecimal latitud,
    BigDecimal longitud,
    Boolean activo,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion
) { }
