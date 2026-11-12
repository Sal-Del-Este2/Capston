package com.scout.MS_Finanzas.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrdenCompraResponse {
    private Long id;
    private Long usuarioId;
    private BigDecimal neto;
    private BigDecimal montoImpuesto;
    private BigDecimal porcentajeImpuesto;
    private BigDecimal total;
    // Estado de gestión de la orden.
    private String estado;
    // Estado financiero del pago asociado.
    private String estadoPago;
    private LocalDateTime fecha;
    private List<DetalleCompraResponse> detalles = new ArrayList<>();
}