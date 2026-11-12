package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionCuotaRequest {
    @NotNull(message = "El monto es obligatorio.")
    @DecimalMin(value = "0", message = "El monto no puede ser negativo.")
    private BigDecimal monto;
    @NotNull(message = "La fecha de vigencia es obligatoria.")
    private LocalDate vigenteDesde;
}