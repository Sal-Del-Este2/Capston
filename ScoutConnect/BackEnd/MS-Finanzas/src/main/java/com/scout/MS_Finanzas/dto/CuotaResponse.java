package com.scout.MS_Finanzas.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CuotaResponse {
    private Long id;
    private Long usuarioId;
    private Integer anio;
    private Integer mes;
    private BigDecimal monto;
    private LocalDate fechaVencimiento;
    private String estado;
    private Long grupoId;
    private String grupoNombre;
    private Long ramaId;
    private String ramaNombre;
    private LocalDateTime fechaPago;
}