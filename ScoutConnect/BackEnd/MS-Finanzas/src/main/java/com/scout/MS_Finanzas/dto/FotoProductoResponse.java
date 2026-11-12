package com.scout.MS_Finanzas.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class FotoProductoResponse {
    private Long id;
    private String nombreArchivo;
    private String tipoContenido;
    private Long tamanioBytes;
    private Short ordenVisualizacion;
    private LocalDateTime fechaCarga;
    private String url;
}