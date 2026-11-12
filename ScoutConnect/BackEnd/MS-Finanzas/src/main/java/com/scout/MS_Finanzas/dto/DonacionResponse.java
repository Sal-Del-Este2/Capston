package com.scout.MS_Finanzas.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DonacionResponse {
    private Long id;
    private Long usuarioId;
    private String tipoDonacion;
    private String nombreDonante;
    private String correoDonante;
    private BigDecimal monto;
    private LocalDateTime fecha;
    private Long grupoId;
    private String grupoNombre;
    private String estadoPago;
    private String numeroTransaccion;
}