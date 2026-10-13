package com.scout.ms_pagina_publica.controller;

import jakarta.validation.Valid;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.scout.ms_pagina_publica.dto.ContactoReinoRequestDTO;
import com.scout.ms_pagina_publica.dto.ContactoReinoResponseDTO;
import com.scout.ms_pagina_publica.service.ContactoReinoService;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController 
@RequestMapping("/api/contactos-reino")
public class ContactoReinoController {
    private final ContactoReinoService service;
    public ContactoReinoController(ContactoReinoService service) {this.service = service;}
    @GetMapping
    public ResponseEntity<List<ContactoReinoResponseDTO>> listarActivos() {return ResponseEntity.ok(service.listarActivos());}
    @GetMapping("/reino/{reinoId}")
    public ResponseEntity<List<ContactoReinoResponseDTO>> listarPorReino(@PathVariable Long reinoId) {return ResponseEntity.ok(service.listarPorReino(reinoId));}
    @PostMapping
    public ResponseEntity<ContactoReinoResponseDTO> asignar(@Valid @RequestBody ContactoReinoRequestDTO request) {ContactoReinoResponseDTO respuesta = service.asignar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ContactoReinoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody ContactoReinoRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {service.eliminar(id); return ResponseEntity.noContent().build();}

}
