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
public class ProductoResponse {
    private Long id;
    private String titulo;
    private String detalle;
    private BigDecimal precio;
    private BigDecimal precioConIva;
    private Integer stock;
    private Long grupoId;
    private String grupoNombre;
    private Long ramaId;
    private String ramaNombre;
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<FotoProductoResponse> fotos = new ArrayList<>();
}