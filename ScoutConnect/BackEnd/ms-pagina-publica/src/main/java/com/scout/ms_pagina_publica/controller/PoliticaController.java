package com.scout.ms_pagina_publica.controller;

import jakarta.validation.Valid;
import java.util.List;

import com.scout.ms_pagina_publica.dto.PoliticaRequestDTO;
import com.scout.ms_pagina_publica.dto.PoliticaResponseDTO;
import com.scout.ms_pagina_publica.service.PoliticaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController 
@RequestMapping("/api/politicas")
public class PoliticaController {
    private final PoliticaService service;
    public PoliticaController(PoliticaService service) {this.service = service;}
    @GetMapping
    public ResponseEntity<List<PoliticaResponseDTO>> listarTodas() {return ResponseEntity.ok(service.listarTodas());}
    @GetMapping("/publicadas")
    public ResponseEntity<List<PoliticaResponseDTO>> listarPublicadas() {return ResponseEntity.ok(service.listarPublicadas());}
    @GetMapping("/{id}")
    public ResponseEntity<PoliticaResponseDTO> obtenerPorId(@PathVariable Long id) {return ResponseEntity.ok(service.obtenerPorId(id));}
    @PostMapping
    public ResponseEntity<PoliticaResponseDTO> crear(@Valid @RequestBody PoliticaRequestDTO request) {PoliticaResponseDTO respuesta = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
    @PutMapping("/{id}")
    public ResponseEntity<PoliticaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody PoliticaRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }
    @PatchMapping("/{id}/publicar")
    public ResponseEntity<PoliticaResponseDTO> cambiarPublicacion(@PathVariable Long id, @RequestParam boolean publicada) {
        return ResponseEntity.ok(service.cambiarPublicacion(id, publicada));
    }
}
