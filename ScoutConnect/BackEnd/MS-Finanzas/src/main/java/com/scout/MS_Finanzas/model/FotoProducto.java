package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "fotos_producto")
@Getter
@Setter
@NoArgsConstructor
public class FotoProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    @Column(name = "ruta_archivo", nullable = false, unique = true)
    private String rutaArchivo;
    @Column(name = "tipo_contenido", nullable = false)
    private String tipoContenido;
    @Column(name = "tamanio_bytes", nullable = false)
    private Long tamanioBytes;
    @Column(name = "orden_visualizacion", nullable = false)
    private Short ordenVisualizacion;
    @Column(name = "fecha_carga", nullable = false, updatable = false)
    private LocalDateTime fechaCarga;
}