package com.scout.backend_scout.dto;

public record UsuarioCuotaDTO(
    Long id,
    String nombre,
    String correo,
    String rol,
    Long grupoId,
    Long ramaId
) { }