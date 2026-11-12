package com.scout.backend_scout.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.scout.backend_scout.model.Rama;
import com.scout.backend_scout.repository.RamaRepository;

@CrossOrigin (origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController
@RequestMapping("/ramas")
public class RamaController {
    @Autowired
    private RamaRepository ramaRepository;
    @GetMapping("/listar")
    public List<Rama> listarRamas() {return ramaRepository.findAll();}
}