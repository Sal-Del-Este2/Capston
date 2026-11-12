package com.scout.MS_Finanzas.dto;

public record UsuarioObligadoDTO(
    Long id,
    String nombre,
    String correo,
    String rol,
    Long grupoId,
    Long ramaId
) { }