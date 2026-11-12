package com.scout.MS_Finanzas.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductoRequest {
    @NotBlank(message = "El título es obligatorio.")
    @Size(max = 180, message = "El título no puede superar 180 caracteres.")
    private String titulo;
    @NotBlank(message = "El detalle es obligatorio.")
    @Size(max = 200, message = "El detalle no puede superar 200 caracteres.")
    private String detalle;
    @NotNull(message = "El precio es obligatorio.")
    @DecimalMin(value = "0", message = "El precio no puede ser negativo.")
    @Digits(integer = 12, fraction = 0, message = "El precio debe ser un número entero, sin decimales.")
    private BigDecimal precio;
    @NotNull(message = "El stock es obligatorio.")
    @Min(value = 0, message = "El stock no puede ser negativo.")
    private Integer stock;
    @NotNull(message = "Debe seleccionar un grupo.")
    private Long grupoId;
    @NotNull(message = "Debe seleccionar una rama.")
    private Long ramaId;
}