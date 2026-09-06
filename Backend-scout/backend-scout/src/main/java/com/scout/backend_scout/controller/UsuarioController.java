package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Usuario;
import com.scout.backend_scout.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public Map<String, String> registrar(@RequestBody Usuario usuario,
                                         @RequestParam String rolSolicitante) {
        Map<String, String> respuesta = new HashMap<>();

        // Solo el administrador puede crear usuarios
        if (!rolSolicitante.equals("administrador")) {
            respuesta.put("error", "Solo un administrador puede crear usuarios.");
            return respuesta;
        }

        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            respuesta.put("error", "Ya existe una cuenta asociada a este correo.");
            return respuesta;
        }

        if (usuarioRepository.findByNickname(usuario.getNickname()).isPresent()) {
            respuesta.put("error", "Este nickname ya está registrado.");
            return respuesta;
        }

        usuarioRepository.save(usuario);
        respuesta.put("mensaje", "Usuario @" + usuario.getNickname() + " creado correctamente.");
        return respuesta;
    }
}
