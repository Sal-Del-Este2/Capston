package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.model.Grupo;
import com.scout.MS_Finanzas.model.Rama;
import com.scout.MS_Finanzas.repository.GrupoRepository;
import com.scout.MS_Finanzas.repository.RamaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {
    private final GrupoRepository grupoRepository;
    private final RamaRepository ramaRepository;
    public CatalogoController(
        GrupoRepository grupoRepository,
        RamaRepository ramaRepository
    ) {
        this.grupoRepository = grupoRepository;
        this.ramaRepository = ramaRepository;
    }
    @GetMapping("/grupos")
    public ResponseEntity<List<Grupo>> listarGrupos() {
        return ResponseEntity.ok(grupoRepository.findAll());
    }
    @GetMapping("/ramas")
    public ResponseEntity<List<Rama>> listarRamas() {
        return ResponseEntity.ok(ramaRepository.findAll());
    }
}