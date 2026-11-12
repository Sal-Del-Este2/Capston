package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CrearDonacionRequest {
    @NotNull(message = "El monto es obligatorio.")
    @DecimalMin(value = "1", message = "El monto mínimo es $1.")
    private BigDecimal monto;
    @NotBlank(message = "Debe indicar el tipo de donación.")
    private String tipoDonacion;
    private Long grupoId;
    private String nombreDonante;
    private String correoDonante;
}