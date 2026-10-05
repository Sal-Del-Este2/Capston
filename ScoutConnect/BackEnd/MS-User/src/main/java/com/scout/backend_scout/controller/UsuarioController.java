package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Comuna;
import com.scout.backend_scout.model.Estado;
import com.scout.backend_scout.model.Grupo;
import com.scout.backend_scout.model.Rol;
import com.scout.backend_scout.model.Usuario;

import com.scout.backend_scout.repository.ComunaRepository;
import com.scout.backend_scout.repository.EstadoRepository;
import com.scout.backend_scout.repository.GrupoRepository;
import com.scout.backend_scout.repository.RolRepository;
import com.scout.backend_scout.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;
// import org.springframework.web.bind.annotation.*;
import java.io.IOException;
// import java.net.http.HttpHeaders;
import java.util.*;

@CrossOrigin (origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController 
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private EstadoRepository estadoRepository;
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private ComunaRepository comunaRepository;
    @Autowired
    private GrupoRepository grupoRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    // Perfil
    @GetMapping("/perfil/{correo}")
    public Usuario obtenerPerfil(@PathVariable String correo) {
        return usuarioRepository
            .findByCorreo(correo)
            .orElse(null);
    }
    @PutMapping("/perfil/{correo}")
    public Map<String, String> actualizarPerfil(
        @PathVariable String correo,
        @RequestBody Usuario datosPerfil) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioExistente = usuarioRepository.findByCorreo(correo);
            if (usuarioExistente.isEmpty()) {
                respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            Usuario usuario = usuarioExistente.get();
            usuario.setTelefono(datosPerfil.getTelefono());
            usuario.setDireccion(datosPerfil.getDireccion());
            if (datosPerfil.getComuna() != null && datosPerfil.getComuna().getId() != null) {
                Optional<Comuna> comuna = comunaRepository.findById(datosPerfil.getComuna().getId());
                if (comuna.isPresent()) {
                    usuario.setComuna(comuna.get());
                } else {
                    respuesta.put("error", "Comuna no válida.");
                    return respuesta;
                }
            }
            usuarioRepository.save(usuario);
            respuesta.put("mensaje", "Perfil actualizado correctamente.");
            return respuesta;
        }
    // Registrar
    @PostMapping("/registro")
    public Map<String, String> registrar(
        @RequestBody Usuario usuario,
        @RequestParam String rolSolicitante) {
            Map<String, String> respuesta = new HashMap<>();
            if (!rolSolicitante.equalsIgnoreCase("administrador")) {respuesta.put("error", "Solo un administrador puede crear usuarios.");
                return respuesta;
            }
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {respuesta.put("error", "Debe ingresar el nombre.");
                return respuesta;
            }
            if (usuario.getRut() == null || usuario.getRut().trim().isEmpty()) {respuesta.put("error", "Debe ingresar el RUT.");
                return respuesta;
            }
            if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {respuesta.put("error", "Debe ingresar la contraseña.");
                return respuesta;
            }
            if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {respuesta.put("error", "Ya existe una cuenta asociada a este correo.");
                return respuesta;
            }
            if (usuarioRepository.findByNickname(usuario.getNickname()).isPresent()) {respuesta.put("error", "Este nickname ya está registrado.");
                return respuesta;
            }
            //validar rol
            if (usuario.getRol() == null || usuario.getRol().getId() == null) {respuesta.put("error", "Debe seleccionar un rol.");
                return respuesta;
            }
            Rol rol = rolRepository
                .findById(usuario.getRol().getId())
                .orElse(null);
            if (rol == null) {respuesta.put("error", "Rol no válido.");
                return respuesta;
            }
            // validar estado
            if (usuario.getEstado() == null || usuario.getEstado().getId() == null) {respuesta.put("error", "Debe seleccionar un estado.");
                return respuesta;
            }
            Estado estado = estadoRepository
                .findById(usuario.getEstado().getId())
                .orElse(null);
            if (estado == null) {respuesta.put("error", "Estado no válido.");
                return respuesta;
            }
            // Validar Comuna
            if (usuario.getComuna() == null || usuario.getComuna().getId() == null) {respuesta.put("error", "Debe seleccionar una comuna.");
                return respuesta;
            }
            Comuna comuna = comunaRepository
                .findById(usuario.getComuna().getId())
                .orElse(null);
            if (comuna == null) {respuesta.put("error", "Comuna no válida.");
                return respuesta;
            }
            // Validar grupo
            if (usuario.getGrupo() == null || usuario.getGrupo().getId() == null) {respuesta.put("error", "Debe seleccionar un grupo.");
                return respuesta;
            }
            Grupo grupo = grupoRepository
                .findById(usuario.getGrupo().getId())
                .orElse(null);
            if (grupo == null) {respuesta.put("error", "Grupo no válido.");
                return respuesta;
            }
            usuario.setRol(rol);
            usuario.setEstado(estado);
            usuario.setComuna(comuna);
            usuario.setGrupo(grupo);
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuarioRepository.save(usuario);
            respuesta.put("mensaje", "Usuario @" + usuario.getNickname() + " creado correctamente.");
            return respuesta;
        }
    // Inicio
    @PostMapping("/login")
    public Map<String, String> login(
        @RequestBody Usuario usuario) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioEncontrado = usuarioRepository.findByCorreo(usuario.getCorreo());
            if (usuarioEncontrado.isEmpty()) {
                respuesta.put("error", "Correo no registrado.");
                return respuesta;
            }
            Usuario u = usuarioEncontrado.get();
            if (!passwordEncoder.matches(
                usuario.getPassword(), u.getPassword())) {
                    respuesta.put("error", "Contraseña incorrecta.");
                return respuesta;
            }
            String estado = (u.getEstado() != null) ? u.getEstado().getNombre().trim().toLowerCase(): "";
            if (estado.equals("inactivo")) {respuesta.put("error", "Tu cuenta está inactiva. Contacta al administrador.");
                return respuesta;
            }
            respuesta.put("mensaje", "Bienvenido " + u.getNombre());
            respuesta.put("nombre", u.getNombre());
            respuesta.put("correo", u.getCorreo());
            respuesta.put("rol", u.getRol() != null ? u.getRol().getNombre() : "");
            respuesta.put("estado", u.getEstado() != null ? u.getEstado().getNombre() : "");
            return respuesta;
        }
    // Enlistar
    @GetMapping("/listar")
    public List<Usuario> listarUsuarios() {return usuarioRepository.findAll();}
    // Editar
    @PutMapping("/editar/{id}")
    public Map<String, String> editarUsuario(
        @PathVariable Long id,
        @RequestBody Usuario usuarioActualizado) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (usuarioExistente.isEmpty()) {
                respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            Optional<Usuario> correoExistente = usuarioRepository.findByCorreo(usuarioActualizado.getCorreo());
            if (correoExistente.isPresent() && !correoExistente.get().getId().equals(id)) {
                respuesta.put("error", "Ya existe un usuario con ese correo.");
                return respuesta;
            }
            Optional<Usuario> nicknameExistente = usuarioRepository.findByNickname(usuarioActualizado.getNickname());
            if (nicknameExistente.isPresent() && !nicknameExistente.get().getId().equals(id)) {
                respuesta.put("error", "El nickname ya está registrado.");
                return respuesta;
            }
            Usuario u = usuarioExistente.get();
            u.setNombre(usuarioActualizado.getNombre());
            u.setRut(usuarioActualizado.getRut());
            u.setTelefono(usuarioActualizado.getTelefono());
            u.setNacimiento(usuarioActualizado.getNacimiento());
            u.setNickname(usuarioActualizado.getNickname());
            u.setCorreo(usuarioActualizado.getCorreo());
            u.setDireccion(usuarioActualizado.getDireccion());
            if (usuarioActualizado.getRol() != null && usuarioActualizado.getRol().getId() != null) {
                Optional<Rol> rol = rolRepository.findById(usuarioActualizado.getRol().getId());
                if (rol.isEmpty()) {respuesta.put("error", "Rol no válido.");
                    return respuesta;
                }
                u.setRol(rol.get());
            }
            if (usuarioActualizado.getEstado() != null && usuarioActualizado.getEstado().getId() != null) {
                Optional<Estado> estado = estadoRepository.findById(usuarioActualizado.getEstado().getId());
                if (estado.isEmpty()) {respuesta.put("error", "Estado no válido.");
                    return respuesta;
                }
                u.setEstado(estado.get());
            }
            if (usuarioActualizado.getGrupo() != null && usuarioActualizado.getGrupo().getId() != null) {
                Optional<Grupo> grupo = grupoRepository.findById(usuarioActualizado.getGrupo().getId());
                if (grupo.isEmpty()) {respuesta.put("error", "Grupo no válido.");
                    return respuesta;
                }
                u.setGrupo(grupo.get());
            }
            if (usuarioActualizado.getComuna() != null && usuarioActualizado.getComuna().getId() != null) {
                Optional<Comuna> comuna = comunaRepository.findById(usuarioActualizado.getComuna().getId());
                if (comuna.isEmpty()) {respuesta.put("error", "Comuna no válida.");
                    return respuesta;
                }
                u.setComuna(comuna.get());
            }
            usuarioRepository.save(u);
            respuesta.put("mensaje", "Usuario @" + u.getNickname() + " actualizado correctamente.");
            return respuesta;
        }
    // Cambiar estado
    @PutMapping("/estado/{id}")
    public Map<String, String> cambiarEstado(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (usuarioExistente.isEmpty()) {
                respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            String nombreEstado = body.get("estado");
            Optional<Estado> estado = estadoRepository.findByNombre(nombreEstado);
            if (estado.isEmpty()) {
                respuesta.put("error", "Estado no válido.");
                return respuesta;
            }
            Usuario usuario = usuarioExistente.get();
            usuario.setEstado(estado.get());
            usuarioRepository.save(usuario);
            respuesta.put("mensaje", "Estado actualizado correctamente.");
            return respuesta;
        }
    // Eliminar
    @DeleteMapping("/nombre/{nombre}")
    public Map<String, String> eliminarPorNombre(
        @PathVariable String nombre) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioExistente = usuarioRepository.findByNombre(nombre);
            if (usuarioExistente.isEmpty()) {
                respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            usuarioRepository.delete(usuarioExistente.get());
            respuesta.put("mensaje", "Usuario eliminado correctamente.");
            return respuesta;
        }
    // Test BCRYPT
    @GetMapping("/test-bcrypt")
    public String generarHash() {return passwordEncoder.encode("ClaveAdmin#2026");}
    // Obtener usuario por ID
    @GetMapping("/{id}")
    public Usuario obtenerPorId(@PathVariable Long id) {return usuarioRepository.findById(id).orElse(null);}
    // Obtener usuarios por rol
    @GetMapping("/rol/{rolNombre}")
    public List<Usuario> listarPorRol(@PathVariable String rolNombre) {return usuarioRepository.findAll().stream()
        .filter(u -> u.getRol() != null && rolNombre.equalsIgnoreCase(u.getRol().getNombre()))
        .toList();
    }
    // Subir pdf
    @PostMapping("/perfil/{correo}/pdf")
    public Map<String, String> subirPdf(
        @PathVariable String correo,
        @RequestParam("archivo") MultipartFile archivo) {
            Map<String, String> respuesta = new HashMap<>();
            if (archivo.isEmpty()) {respuesta.put("error", "No se ha seleccionado ningún archivo.");
                return respuesta;
            }
            if (archivo.getSize() > 5 * 1024 * 1024) {respuesta.put("error", "El PDF no puede superar los 5 MB.");
                return respuesta;
            }
            if (!archivo.getContentType().equals("application/pdf")) {respuesta.put("error", "Solo se permiten archivos PDF.");
                return respuesta;
            }
            if (!"application/pdf".equals(archivo.getContentType())) {
                respuesta.put("error", "Solo se permiten archivos PDF.");
                return respuesta;
            }
            Optional<Usuario> usuarioExistente = usuarioRepository.findByCorreo(correo);
            if (usuarioExistente.isEmpty()) {respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            try {
                Usuario usuario = usuarioExistente.get();
                usuario.setPdfDato(archivo.getBytes());
                usuario.setPdfNombre(archivo.getOriginalFilename());
                usuarioRepository.save(usuario);
                respuesta.put("mensaje", "PDF guardado correctamente en la base de datos.");
                respuesta.put("nombre", archivo.getOriginalFilename());
                return respuesta;
            } catch (IOException e) {respuesta.put("error", "Error al guardar el archivo: " + e.getMessage());
                return respuesta;
            }
        }
    // Descargar pdf
    @GetMapping("/perfil/{correo}/pdf")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable String correo) {Optional<Usuario> usuarioExistente = usuarioRepository.findByCorreo(correo);
        if (usuarioExistente.isEmpty() || usuarioExistente.get().getPdfDato() == null) {return ResponseEntity.notFound().build();}
        Usuario usuario = usuarioExistente.get();
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(usuario.getPdfDato().length)
            .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"" + usuario.getPdfNombre() + "\"")
            .body(usuario.getPdfDato());
    }
    // Eliminar pdf
    @DeleteMapping("/perfil/{correo}/pdf")
    public Map<String, String> eliminarPdf(@PathVariable String correo) {Map<String, String> respuesta = new HashMap<>();
        Optional<Usuario> usuarioExistente = usuarioRepository.findByCorreo(correo);
        if (usuarioExistente.isEmpty()) {respuesta.put("error", "Usuario no encontrado.");
            return respuesta;
        }
        Usuario usuario = usuarioExistente.get();
        usuario.setPdfDato(null);
        usuario.setPdfNombre(null);
        usuarioRepository.save(usuario);
        respuesta.put("mensaje", "PDF eliminado correctamente.");
        return respuesta;
    }
}