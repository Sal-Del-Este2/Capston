package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ItemOrdenRequest {
    @NotNull(message = "Debe indicar el producto.")
    private Long productoId;
    @NotNull(message = "Debe indicar la cantidad.")
    @Min(value = 1, message = "La cantidad mínima es 1.")
    @Max(value = 100, message = "La cantidad máxima es 100.")
    private Integer cantidad;
}