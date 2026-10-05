package com.scout.backend_scout.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.scout.backend_scout.model.Grupo;
import com.scout.backend_scout.repository.GrupoRepository;

@CrossOrigin (origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController
@RequestMapping("/grupos")
public class GrupoController {
    @Autowired
    private GrupoRepository grupoRepository;
    @GetMapping("/listar")
    public List<Grupo> listarGrupos() {return grupoRepository.findAll();}
}
