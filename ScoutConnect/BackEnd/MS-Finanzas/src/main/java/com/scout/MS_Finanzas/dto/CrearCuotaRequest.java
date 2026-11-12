package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
// import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CrearCuotaRequest {
    @NotNull(message = "Debe indicar el usuario.")
    private Long usuarioId;
    @NotNull(message = "Debe indicar el año.")
    @Min(value = 2000, message = "El año no es válido.")
    @Max(value = 2100, message = "El año no es válido.")
    private Integer anio;
    @NotNull(message = "Debe indicar el mes.")
    @Min(value = 1, message = "El mes no es válido.")
    @Max(value = 12, message = "El mes no es válido.")
    private Integer mes;
    private BigDecimal monto;
    private Long grupoId;
    private Long ramaId;
}