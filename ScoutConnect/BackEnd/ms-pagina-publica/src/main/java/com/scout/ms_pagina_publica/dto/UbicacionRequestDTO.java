package com.scout.ms_pagina_publica.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UbicacionRequestDTO(
    @NotBlank(message = "El nombre de la ubicación es obligatorio.")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres.")
    String nombre,
    @Size(max = 500, message = "La descripción no puede superar 500 caracteres.")
    String descripcion,
    @Size(max = 255, message = "La dirección no puede superar 255 caracteres.")
    String direccion,
    @NotNull(message = "La comuna es obligatoria.")
    Long comunaId,
    @DecimalMin(value = "-90.0", message = "La latitud debe estar entre -90 y 90.")
    @DecimalMax(value = "90.0", message = "La latitud debe estar entre -90 y 90.")
    BigDecimal latitud,
    @DecimalMin(value = "-180.0", message = "La longitud debe estar entre -180 y 180.")
    @DecimalMax(value = "180.0", message = "La longitud debe estar entre -180 y 180.")
    BigDecimal longitud,
    Boolean activo
) { }
