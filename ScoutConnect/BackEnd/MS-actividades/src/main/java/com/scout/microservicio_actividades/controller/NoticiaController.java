package com.scout.microservicio_actividades.controller;

import java.util.List;
import com.scout.microservicio_actividades.dto.ActualizarNoticiaRequest;
import com.scout.microservicio_actividades.dto.CrearNoticiaRequest;
import com.scout.microservicio_actividades.dto.NoticiaResponse;
import com.scout.microservicio_actividades.service.NoticiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {
    private final NoticiaService noticiaService;
    public NoticiaController(NoticiaService noticiaService) {this.noticiaService = noticiaService;}
    @PostMapping
    public ResponseEntity<NoticiaResponse> crear(
        @Valid
        @RequestBody
        CrearNoticiaRequest request) {NoticiaResponse respuesta = noticiaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
    @GetMapping
    public ResponseEntity<List<NoticiaResponse>>
    listarParaAutenticados() {return ResponseEntity.ok(noticiaService.listarParaAutenticados());}
    @GetMapping("/{noticiaId}")
    public ResponseEntity<NoticiaResponse>
    obtenerPorId(@PathVariable Long noticiaId) {return ResponseEntity.ok(noticiaService.obtenerPorId(noticiaId));}
    @PutMapping("/{noticiaId}")
    public ResponseEntity<NoticiaResponse>actualizar(
        @PathVariable Long noticiaId,
        @Valid
        @RequestBody
        ActualizarNoticiaRequest request
    ) {return ResponseEntity.ok(noticiaService.actualizar(noticiaId, request));}
    @DeleteMapping("/{noticiaId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long noticiaId) {noticiaService.eliminar(noticiaId);
        return ResponseEntity.noContent().build();}
    
}
