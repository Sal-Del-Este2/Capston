package com.scout.ms_pagina_publica.dto;

import java.time.LocalDateTime;

public record InformacionInstitucionalResponseDTO(
    Long id,
    String nombreInstitucion,
    String mision,
    String vision,
    String historia,
    String valores,
    String correoContacto,
    String telefonoContacto,
    String sitioWeb,
    String logoUrl,
    LocalDateTime fechaActualizacion
) { }
