package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.ProductoRequest;
import com.scout.MS_Finanzas.dto.ProductoResponse;
import com.scout.MS_Finanzas.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;
    public ProductoController(ProductoService productoService) {this.productoService = productoService;}
    @GetMapping
    public ResponseEntity<Page<ProductoResponse>> listar(
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {return ResponseEntity.ok(productoService.listarActivos(PageRequest.of(pagina, tamanio)));}
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {return ResponseEntity.ok(productoService.obtener(id));}
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponse> crear(
        @Valid @RequestPart("producto") ProductoRequest request,
        @RequestPart("archivos") List<MultipartFile> archivos
    ) {
        ProductoResponse respuesta = productoService.crear(request, archivos);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);}
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponse> actualizar(
        @PathVariable Long id,
        @Valid @RequestPart("producto") ProductoRequest request
        // @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos
    ) {return ResponseEntity.ok(productoService.actualizar(id, request));}
    @PutMapping("/{id}/estado")
    public ResponseEntity<ProductoResponse> cambiarEstado(
        @PathVariable Long id,
        @RequestParam String estado
    ) {return ResponseEntity.ok(productoService.cambiarEstado(id, estado));}
    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponse> agregarFotos(
        @PathVariable Long id,
        @RequestPart("archivos") List<MultipartFile> archivos
    ) {
        return ResponseEntity.ok(productoService.agregarFotos(id, archivos));
    }
    @DeleteMapping("/{id}/fotos/{fotoId}")
    public ResponseEntity<ProductoResponse> eliminarFoto(
        @PathVariable Long id,
        @PathVariable Long fotoId
    ) {return ResponseEntity.ok(productoService.eliminarFoto(id, fotoId));}
    @PutMapping(
        value = "/{id}/fotos/{fotoId}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductoResponse> reemplazarFoto(
        @PathVariable Long id,
        @PathVariable Long fotoId,
        @RequestPart("archivo") MultipartFile archivo
    ) {return ResponseEntity.ok(productoService.reemplazarFoto(id, fotoId, archivo));}
    @PutMapping(
        value = "/{id}/fotos",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductoResponse> reemplazarTodasLasFotos(
        @PathVariable Long id,
        @RequestPart("archivos") List<MultipartFile> archivos
    ) {return ResponseEntity.ok(productoService.reemplazarTodasLasFotos(id, archivos));}
    @GetMapping("/admin")
    public ResponseEntity<Page<ProductoResponse>> listarAdministrador(
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {Pageable pageable = PageRequest.of(pagina, tamanio); return ResponseEntity.ok(productoService.listar(pageable));}
}