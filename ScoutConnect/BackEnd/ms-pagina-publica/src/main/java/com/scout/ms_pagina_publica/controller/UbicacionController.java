package com.scout.ms_pagina_publica.controller;

import jakarta.validation.Valid;
import java.util.List;

import com.scout.ms_pagina_publica.dto.UbicacionRequestDTO;
import com.scout.ms_pagina_publica.dto.UbicacionResponseDTO;
import com.scout.ms_pagina_publica.service.UbicacionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/ubicaciones")

public class UbicacionController {
    private final UbicacionService ubicacionService;
    public UbicacionController(UbicacionService ubicacionService) {this.ubicacionService = ubicacionService;}
    @GetMapping
    public ResponseEntity<List<UbicacionResponseDTO>> listarTodas() {return ResponseEntity.ok(ubicacionService.listarTodas());}
    @GetMapping("/activas")
    public ResponseEntity<List<UbicacionResponseDTO>> listarActivas() {return ResponseEntity.ok(ubicacionService.listarActivas());}
    @GetMapping("/{id}")
    public ResponseEntity<UbicacionResponseDTO> obtenerPorId(@PathVariable Long id) {return ResponseEntity.ok(ubicacionService.obtenerPorId(id));}
    @PostMapping
    public ResponseEntity<UbicacionResponseDTO> crear(@Valid @RequestBody UbicacionRequestDTO request) {UbicacionResponseDTO respuesta = ubicacionService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
    @PutMapping("/{id}")
    public ResponseEntity<UbicacionResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody UbicacionRequestDTO request) {
        return ResponseEntity.ok(ubicacionService.actualizar(id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {ubicacionService.eliminar(id); return ResponseEntity.noContent().build();}
}
