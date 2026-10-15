package com.scout.backend_scout.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SolicitudPasswordDTO(
    @NotBlank (message = "El correo es obligatorio.")
    @Email (message = "El correo no tiene un formato válido.")
    String correo
) {

}
