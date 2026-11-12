package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.model.FotoProducto;
import com.scout.MS_Finanzas.repository.FotoProductoRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/productos")
public class FotoProductoController {
    private final FotoProductoRepository fotoProductoRepository;
    public FotoProductoController(FotoProductoRepository fotoProductoRepository) {
        this.fotoProductoRepository = fotoProductoRepository;
    }
    @GetMapping("/{productoId}/fotos/{fotoId}")
    public ResponseEntity<FileSystemResource> obtenerFoto(
        @PathVariable Long productoId,
        @PathVariable Long fotoId
    ) {
        FotoProducto foto = fotoProductoRepository.findById(fotoId)
            .filter(f -> f.getProducto().getId().equals(productoId))
            .orElseThrow(() -> new RecursoNoEncontradoException("Imagen no encontrada."));
        Path ruta = Paths.get(foto.getRutaArchivo());
        if (!java.nio.file.Files.exists(ruta)) {
            throw new RecursoNoEncontradoException("El archivo de la imagen no existe.");
        }
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(foto.getTipoContenido()))
            .body(new FileSystemResource(ruta));
    }
}