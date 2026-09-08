package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Usuario;
import com.scout.backend_scout.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://127.0.0.1:5501") // habilita conexión desde tu frontend
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // --- Registro de usuarios (solo administrador) ---
    @PostMapping("/registro")
    public Map<String, String> registrar(@RequestBody Usuario usuario,
                                         @RequestParam String rolSolicitante) {
        Map<String, String> respuesta = new HashMap<>();

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

        if (usuario.getEstado() == null || usuario.getEstado().isEmpty()) {
            usuario.setEstado("activo");
        }

        usuarioRepository.save(usuario);
        respuesta.put("mensaje", "Usuario @" + usuario.getNickname() + " creado correctamente.");
        return respuesta;
    }

    // --- Login de usuarios ---
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Usuario usuario) {
        Map<String, String> respuesta = new HashMap<>();

        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByCorreo(usuario.getCorreo());

        if (usuarioEncontrado.isEmpty()) {
            respuesta.put("error", "Correo no registrado.");
            return respuesta;
        }

        Usuario u = usuarioEncontrado.get();

        if (!u.getPassword().equals(usuario.getPassword())) {
            respuesta.put("error", "Contraseña incorrecta.");
            return respuesta;
        }

        // ⚠️ Validar estado antes de permitir login
        String estado = (u.getEstado() != null) ? u.getEstado().trim().toLowerCase() : "";
        if (estado.isEmpty() || estado.equals("inactivo")) {
            respuesta.put("error", "Tu cuenta está inactiva. Contacta al administrador.");
            return respuesta;
        }

        respuesta.put("mensaje", "Bienvenido " + u.getNombre());
        respuesta.put("rol", u.getRol());
        respuesta.put("estado", u.getEstado());
        return respuesta;
    }

    // --- Listar usuarios ---
    @GetMapping("/listar")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // --- Editar usuario ---
    @PutMapping("/editar/{id}")
    public Map<String, String> editarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {
        Map<String, String> respuesta = new HashMap<>();

        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
        if (usuarioExistente.isEmpty()) {
            respuesta.put("error", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario u = usuarioExistente.get();
        u.setNombre(usuarioActualizado.getNombre());
        u.setNickname(usuarioActualizado.getNickname());
        u.setCorreo(usuarioActualizado.getCorreo());
        u.setRol(usuarioActualizado.getRol());

        if (usuarioActualizado.getEstado() != null && !usuarioActualizado.getEstado().isEmpty()) {
            u.setEstado(usuarioActualizado.getEstado());
        }

        usuarioRepository.save(u);

        respuesta.put("mensaje", "Usuario @" + u.getNickname() + " actualizado correctamente.");
        return respuesta;
    }

    // --- Cambiar estado de usuario ---
    @PutMapping("/estado/{id}")
    public Map<String, String> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, String> respuesta = new HashMap<>();

        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
        if (usuarioExistente.isEmpty()) {
            respuesta.put("error", "Usuario no encontrado.");
            return respuesta;
        }

        Usuario u = usuarioExistente.get();
        String nuevoEstado = body.get("estado");

        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            respuesta.put("error", "Debe especificar un estado válido (activo/inactivo).");
            return respuesta;
        }

        u.setEstado(nuevoEstado);
        usuarioRepository.save(u);

        respuesta.put("mensaje", "Usuario @" + u.getNickname() + " actualizado a estado " + nuevoEstado + ".");
        return respuesta;
    }
}
