package com.scout.ms_pagina_publica.controller;

import jakarta.validation.Valid;

import com.scout.ms_pagina_publica.dto.InformacionInstitucionalRequestDTO;
import com.scout.ms_pagina_publica.dto.InformacionInstitucionalResponseDTO;
import com.scout.ms_pagina_publica.service.InformacionInstitucionalService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController 
@RequestMapping("/api/informacion-institucional")
public class InformacionInstitucionalController {
    private final InformacionInstitucionalService service;
    public InformacionInstitucionalController(InformacionInstitucionalService service) {this.service = service;}
    @GetMapping
    public ResponseEntity<InformacionInstitucionalResponseDTO> obtener() {return ResponseEntity.ok(service.obtener());}
    @PutMapping("/{id}")
    public ResponseEntity<InformacionInstitucionalResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody InformacionInstitucionalRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }
}
