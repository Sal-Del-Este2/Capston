package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Comuna;
import com.scout.backend_scout.model.Estado;
import com.scout.backend_scout.model.Grupo;
import com.scout.backend_scout.model.Region;
import com.scout.backend_scout.model.Rol;
import com.scout.backend_scout.model.Usuario;

import com.scout.backend_scout.repository.ComunaRepository;
import com.scout.backend_scout.repository.EstadoRepository;
import com.scout.backend_scout.repository.GrupoRepository;
import com.scout.backend_scout.repository.RegionRepository;
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
import org.springframework.web.bind.annotation.RequestPart;
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
    private RegionRepository regionRepository;
    @Autowired
    private GrupoRepository grupoRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    // Cargar perfil
    @GetMapping("/perfil/{correo}")
    public Usuario obtenerPerfil(@PathVariable String correo) {
        return usuarioRepository
            .findByCorreo(correo)
            .orElse(null);
    }
    // actualizar perfiles
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
    // Registrar nuevos usuarios.
    @PostMapping(value = "/registro", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> registrar(
        @RequestPart("usuario") Usuario usuario,
        @RequestPart(value = "archivo", required = false) MultipartFile archivo,
        // @RequestBody Usuario usuario,
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
            if (usuario.getTelefono() == null || usuario.getTelefono().trim().isEmpty()) {respuesta.put("error", "Debe ingresar el teléfono.");
                return respuesta;
            }
            if (usuario.getNacimiento() == null) {respuesta.put("error", "Debe ingresar la fecha de nacimiento.");
                return respuesta;
            }
            if (usuario.getNickname() == null || usuario.getNickname().trim().isEmpty()) {respuesta.put("error", "Debe ingresar el nickname.");
                return respuesta;
            }
            if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {respuesta.put("error", "Debe ingresar el correo.");
                return respuesta;
            }
            if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {respuesta.put("error", "Debe ingresar la contraseña.");
                return respuesta;
            }
            if (usuario.getDireccion() == null || usuario.getDireccion().trim().isEmpty()) {respuesta.put("error", "Debe ingresar la dirección.");
                return respuesta;
            }
            if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {respuesta.put("error", "Ya existe una cuenta asociada a este correo.");
                return respuesta;
            }
            if (usuarioRepository.findByNickname(usuario.getNickname()).isPresent()) {respuesta.put("error", "Este nickname ya está registrado.");
                return respuesta;
            }
            if (usuario.getRol() == null || usuario.getRol().getId() == null) {respuesta.put("error", "Debe seleccionar un rol.");
                return respuesta;
            }
            Rol rol = rolRepository.findById(usuario.getRol().getId()).orElse(null);
            if (rol == null) {respuesta.put("error", "Rol no válido.");
                return respuesta;
            }
            if (usuario.getEstado() == null || usuario.getEstado().getId() == null) {respuesta.put("error", "Debe seleccionar un estado.");
                return respuesta;
            }
            Estado estado = estadoRepository.findById(usuario.getEstado().getId()).orElse(null);
            if (estado == null) {respuesta.put("error", "Estado no válido.");
                return respuesta;
            }
            if (usuario.getComuna() == null || usuario.getComuna().getId() == null) {respuesta.put("error", "Debe seleccionar una comuna.");
                return respuesta;
            }
            Comuna comuna = comunaRepository.findById(usuario.getComuna().getId()).orElse(null);
            if (comuna == null) {respuesta.put("error", "Comuna no válida.");
                return respuesta;
            }
            if (usuario.getRegion() == null || usuario.getRegion().getId() == null) {respuesta.put("error", "Debe seleccionar una region.");
                return respuesta;
            }
            Region region = regionRepository.findById(usuario.getRegion().getId()).orElse(null);
            if (region == null) {respuesta.put("error", "Region no válida.");
                return respuesta;
            }
            if (usuario.getGrupo() == null || usuario.getGrupo().getId() == null) {respuesta.put("error", "Debe seleccionar un grupo.");
                return respuesta;
            }
            Grupo grupo = grupoRepository.findById(usuario.getGrupo().getId()).orElse(null);
            if (grupo == null) {respuesta.put("error", "Grupo no válido.");
                return respuesta;
            }
            if (archivo != null && !archivo.isEmpty()) {
                if (archivo.getSize() > 5 * 1024 * 1024) {respuesta.put("error", "El PDF no puede superar los 5 MB.");
                    return respuesta;
                }
                if (!"application/pdf".equals(archivo.getContentType())) {respuesta.put("error","Solo se permiten archivos PDF.");
                    return respuesta;
                }
                try {
                    usuario.setPdfDato(archivo.getBytes());
                    usuario.setPdfNombre(archivo.getOriginalFilename());
                } catch (IOException e) {respuesta.put("error","No se pudo leer el archivo PDF.");
                    return respuesta;
                }
            }
            usuario.setRol(rol);
            usuario.setEstado(estado);
            usuario.setComuna(comuna);
            usuario.setRegion(region);
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
            respuesta.put("id", String.valueOf(u.getId())); // +
            respuesta.put("mensaje", "Bienvenido " + u.getNombre());
            respuesta.put("nombre", u.getNombre());
            respuesta.put("correo", u.getCorreo());
            respuesta.put("rol", u.getRol() != null ? u.getRol().getNombre() : "");
            respuesta.put("estado", u.getEstado() != null ? u.getEstado().getNombre() : "");
            return respuesta;
        }
    // Enlistar usuarios
    @GetMapping("/listar")
    public List<Usuario> listarUsuarios() {return usuarioRepository.findAll();}
    
    // Editar usuarios
    @PutMapping(value = "/editar/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> editarUsuario(
        @PathVariable Long id,
        @RequestPart ("usuario") Usuario usuarioActualizado,
        @RequestPart (value = "archivo", required = false) MultipartFile archivo) {

            Map<String, String> respuesta = new HashMap<>();

            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (usuarioExistente.isEmpty()) {respuesta.put("error", "Usuario no encontrado.");
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
            if (usuarioActualizado.getNombre() == null || usuarioActualizado.getNombre().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar el nombre.");
                return respuesta;
            }
            if (usuarioActualizado.getRut() == null || usuarioActualizado.getRut().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar el RUT.");
                return respuesta;
            }
            if (usuarioActualizado.getTelefono() == null || usuarioActualizado.getTelefono().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar el teléfono.");
                return respuesta;
            }
            if (usuarioActualizado.getNacimiento() == null) {
                respuesta.put("error", "Debe ingresar la fecha de nacimiento.");
                return respuesta;
            }
            if (usuarioActualizado.getNickname() == null || usuarioActualizado.getNickname().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar el nickname.");
                return respuesta;
            }
            if (usuarioActualizado.getCorreo() == null || usuarioActualizado.getCorreo().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar el correo.");
                return respuesta;
            }
            if (usuarioActualizado.getDireccion() == null || usuarioActualizado.getDireccion().trim().isEmpty()) {
                respuesta.put("error", "Debe ingresar la dirección.");
                return respuesta;
            }
            if (usuarioActualizado.getRol() == null || usuarioActualizado.getRol().getId() == null) {       
                respuesta.put("error", "Debe seleccionar un rol.");
                return respuesta;
            }
            if (usuarioActualizado.getEstado() == null || usuarioActualizado.getEstado().getId() == null) {
                respuesta.put("error", "Debe seleccionar un estado.");
                return respuesta;
            }
            if (usuarioActualizado.getRegion() == null || usuarioActualizado.getRegion().getId() == null) {
                respuesta.put("error", "Debe seleccionar una región.");
                return respuesta;
            }
            if (usuarioActualizado.getComuna() == null || usuarioActualizado.getComuna().getId() == null) {
                respuesta.put("error", "Debe seleccionar una comuna.");
                return respuesta;
            }
            if (usuarioActualizado.getGrupo() == null || usuarioActualizado.getGrupo().getId() == null) {
                respuesta.put("error", "Debe seleccionar un grupo.");
                return respuesta;
            }
            Rol rol = rolRepository.findById(usuarioActualizado.getRol().getId()).orElse(null);
            if (rol == null) {respuesta.put("error", "Rol no válido.");
                return respuesta;
            }
            Estado estado = estadoRepository.findById(usuarioActualizado.getEstado().getId()).orElse(null);
            if (estado == null) {respuesta.put("error", "Estado no válido.");
                return respuesta;
            }
            Region region = regionRepository.findById(usuarioActualizado.getRegion().getId()).orElse(null);
            if (region == null) {respuesta.put("error", "Región no válida.");
                return respuesta;
            }
            Comuna comuna = comunaRepository.findById(usuarioActualizado.getComuna().getId()).orElse(null);
            if (comuna == null) {respuesta.put("error", "Comuna no válida.");
                return respuesta;
            }
            Grupo grupo = grupoRepository.findById(usuarioActualizado.getGrupo().getId()).orElse(null);
            if (grupo == null) {respuesta.put("error", "Grupo no válido.");
                return respuesta;
            }

            Usuario usuario = usuarioExistente.get();

            usuario.setNombre(usuarioActualizado.getNombre());
            usuario.setRut(usuarioActualizado.getRut());
            usuario.setTelefono(usuarioActualizado.getTelefono());
            usuario.setNacimiento(usuarioActualizado.getNacimiento());
            usuario.setNickname(usuarioActualizado.getNickname());
            usuario.setCorreo(usuarioActualizado.getCorreo());
            usuario.setDireccion(usuarioActualizado.getDireccion());

            usuario.setRol(rol);
            usuario.setEstado(estado);
            usuario.setRegion(region);
            usuario.setComuna(comuna);
            usuario.setGrupo(grupo);
            if (archivo != null && !archivo.isEmpty()) {
                if (archivo.getSize() > 5 * 1024 * 1024) {respuesta.put("error", "El PDF no puede superar los 5 MB.");
                    return respuesta;
                }
                if (!"application/pdf".equals(archivo.getContentType())) {respuesta.put("error", "Solo se permiten archivos PDF.");
                    return respuesta;
                }
                try {usuario.setPdfDato(archivo.getBytes());
                    usuario.setPdfNombre(archivo.getOriginalFilename());
                } catch (IOException e) {respuesta.put("error", "No se pudo leer el archivo PDF.");
                    return respuesta;
                }
            }
            usuarioRepository.save(usuario);
            respuesta.put("mensaje", "Usuario @" + usuario.getNickname() + " actualizado correctamente.");
            return respuesta;
        }
    // Cambiar estado de usuarios
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
    // Eliminar usuarios y todo sus datos
    @DeleteMapping("/{id}")
    public Map<String, String> eliminarPorId(
        @PathVariable Long id) {
            Map<String, String> respuesta = new HashMap<>();
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (usuarioExistente.isEmpty()) {respuesta.put("error", "Usuario no encontrado.");
                return respuesta;
            }
            usuarioRepository.deleteById(id);
            respuesta.put("mensaje", "Usuario eliminado correctamente."
            );
        return respuesta;
    }
    // Generar hash BCrypt
    @GetMapping("/test-bcrypt")
    public String generarHash() {return passwordEncoder.encode("ContraseñaGenerica");}
    // Obtener usuario por ID
    @GetMapping("/{id}")
    public Usuario obtenerPorId(@PathVariable Long id) {return usuarioRepository.findById(id).orElse(null);}
    // Obtener usuarios por rol
    @GetMapping("/rol/{rolNombre}")
    public List<Usuario> listarPorRol(@PathVariable String rolNombre) {return usuarioRepository.findAll().stream()
        .filter(u -> u.getRol() != null && rolNombre.equalsIgnoreCase(u.getRol().getNombre()))
        .toList();
    }
    // Subir pdf a base de datos
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
            // if (!archivo.getContentType().equals("application/pdf")) {
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
    // Descargar pdf de base de datos
    @GetMapping("/perfil/{correo}/pdf")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable String correo) {Optional<Usuario> usuarioExistente = usuarioRepository.findByCorreo(correo);
        if (usuarioExistente.isEmpty() || usuarioExistente.get().getPdfDato() == null) {return ResponseEntity.notFound().build();}
        Usuario usuario = usuarioExistente.get();
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(usuario.getPdfDato().length)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" +
                // "attachment; filename=\""
                usuario.getPdfNombre() +
                "\"")
            .body(usuario.getPdfDato());
    }
    // Eliminar pdf de base de datos
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