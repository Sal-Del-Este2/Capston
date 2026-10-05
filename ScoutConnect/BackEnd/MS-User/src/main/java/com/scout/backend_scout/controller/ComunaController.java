package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Comuna;
import com.scout.backend_scout.repository.ComunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@CrossOrigin (origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController
@RequestMapping ("/comunas")
public class ComunaController {
    @Autowired
    private ComunaRepository comunaRepository;
    @GetMapping("/listar")
    public List<Comuna> listarComunas() {return comunaRepository.findAll();}
}
