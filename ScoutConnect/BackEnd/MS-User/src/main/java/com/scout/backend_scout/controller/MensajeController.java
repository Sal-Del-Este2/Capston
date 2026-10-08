package com.scout.backend_scout.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.scout.backend_scout.model.AdjuntoMensaje;
import com.scout.backend_scout.model.Mensaje;
import com.scout.backend_scout.model.Usuario;
import com.scout.backend_scout.repository.AdjuntoMensajeRepository;
import com.scout.backend_scout.repository.MensajeRepository;
import com.scout.backend_scout.repository.UsuarioRepository;

import tools.jackson.databind.ObjectMapper;

@CrossOrigin (origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController 
@RequestMapping("/mensajes")
public class MensajeController {
    private static final long MAX_ADJUNTO_BYTES = 5L * 1024L * 1024L;
    private static final List<String> TIPOS_PERMITIDOS = List.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
		"image/png",
		"image/heic",
		"image/heif",
		"image/heif-sequence"
        );
    @Autowired
    private MensajeRepository mensajeRepository;
    @Autowired 
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AdjuntoMensajeRepository adjuntoMensajeRepository;
    @GetMapping("/admin/recibidos")
    public ResponseEntity<?> listarTodosRecibidos() {
        List<Mensaje> mensajes = mensajeRepository.findAllWithRelations();
        return ResponseEntity.ok(convertirMensajes(mensajes));
    }
    @GetMapping ("/recibidos/{usuarioId}")
    public ResponseEntity<?> listarRecibidos(
        @PathVariable Long usuarioId) {
            Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
            if (usuario.isEmpty()) {return respuestaError(HttpStatus.NOT_FOUND, "Usuario no encontrado.");}
            List<Mensaje> mensajes = mensajeRepository.findByDestinatarioIdOrderByFechaCreacionDesc(usuarioId);
            return ResponseEntity.ok(convertirMensajes(mensajes));
        }
    @GetMapping("/enviados/{usuarioId}")
    public ResponseEntity<?> listarEnviados(
        @PathVariable Long usuarioId) {Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
            if (usuario.isEmpty()) {return respuestaError(HttpStatus.NOT_FOUND, "Usuario no encontrado.");}
            List<Mensaje> mensajes = mensajeRepository.findByRemitenteIdOrderByFechaCreacionDesc(usuarioId);
            return ResponseEntity.ok(convertirMensajes(mensajes));
        }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearMensaje(
        @RequestPart ("mensaje") String mensajeJson,
        @RequestPart (value = "archivos", required = false) MultipartFile[] archivos) {
            try {MensajeRequest request = objectMapper.readValue(mensajeJson, MensajeRequest.class);
                return guardarMensaje(request, archivos, null);
            } catch (Exception e) {return respuestaError(HttpStatus.BAD_REQUEST, "Los datos del mensaje no son válidos.");}
    }
    @PostMapping(value = "/{id}/respuesta", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> responderMensaje(
        @PathVariable Long id,
        @RequestPart("mensaje") String mensajeJson,
        @RequestPart(value = "archivos", required = false) MultipartFile[] archivos) {
            Optional<Mensaje> mensajeOriginal = mensajeRepository.findWithRelationsById(id);
            if (mensajeOriginal.isEmpty()) {return respuestaError(HttpStatus.NOT_FOUND, "Mensaje original no encontrado.");}
            try {
                MensajeRequest request = objectMapper.readValue(mensajeJson, MensajeRequest.class);
                if (request.getRemitenteId() == null) {return respuestaError(HttpStatus.BAD_REQUEST, "Debe indicar quién responde.");}
                request.setDestinatarioId(mensajeOriginal.get().getRemitente().getId());
                String asuntoOriginal = mensajeOriginal.get().getAsunto();
                request.setAsunto(asuntoOriginal.startsWith("Re:") ? asuntoOriginal : "Re: " + asuntoOriginal);
                return guardarMensaje(request, archivos, mensajeOriginal.get());
            } catch (Exception e) {return respuestaError(HttpStatus.BAD_REQUEST, "Los datos de la respuesta no son válidos.");}
        }
    @PutMapping("/{id}/leer")
    public ResponseEntity<?> marcarLeido(
        @PathVariable Long id,
        @RequestParam Long usuarioId) {
            Optional<Mensaje> mensajeOpcional = mensajeRepository.findById(id);
            if (mensajeOpcional.isEmpty()) {return respuestaError(HttpStatus.NOT_FOUND, "Mensaje no encontrado.");}
            Mensaje mensaje = mensajeOpcional.get();
            if (!mensaje.getDestinatario().getId().equals(usuarioId)) {return respuestaError(HttpStatus.FORBIDDEN, "No puedes modificar este mensaje.");}
            mensaje.setEstado("LEIDO");
            mensaje.setFechaLectura(LocalDateTime.now());
            mensajeRepository.save(mensaje);
            return ResponseEntity.ok(Map.of("mensaje", "Mensaje marcado como leído."));
        }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMensaje (
        @PathVariable Long id,
        @RequestParam Long usuarioId) {
            Optional<Mensaje> mensajeOpcional = mensajeRepository.findWithRelationsById(id);
            if (mensajeOpcional.isEmpty()) {return respuestaError(HttpStatus.NOT_FOUND, "Mensaje no encontrado.");}
            Mensaje mensaje = mensajeOpcional.get();
            boolean esRemitente = mensaje.getRemitente().getId().equals(usuarioId);
            boolean esDestinatario = mensaje.getDestinatario().getId().equals(usuarioId);
            if (!esRemitente && !esDestinatario) {return respuestaError(HttpStatus.FORBIDDEN, "No puedes eliminar este mensaje.");}
            mensajeRepository.delete(mensaje);
            return ResponseEntity.ok(Map.of("mensaje", "Mensaje eliminado correctamente."));
        }
    @GetMapping("/adjuntos/{id}")
    public ResponseEntity<?> descargarAdjunto(
        @PathVariable Long id,
        @RequestParam Long usuarioId) {
            Optional<AdjuntoMensaje> adjuntoOpcional = adjuntoMensajeRepository.findById(id);
            // Optional<AdjuntoMensaje> adjuntoOpcional = mensajeRepository.findAll().stream().flatMap(mensaje -> mensaje.getAdjuntos().stream()).filter(adjunto -> adjunto.getId().equals(id)).findFirst();
            if (adjuntoOpcional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            AdjuntoMensaje adjunto = adjuntoOpcional.get();
            Mensaje mensaje = adjunto.getMensaje();
            boolean autorizado = mensaje.getRemitente().getId().equals(usuarioId) || mensaje.getDestinatario().getId().equals(usuarioId);
            if (!autorizado) {return ResponseEntity.status(HttpStatus.FORBIDDEN).build();}
            ByteArrayResource recurso = new ByteArrayResource(adjunto.getDatos());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(adjunto.getTipoArchivo()))
                    .contentLength(adjunto.getTamanioBytes())
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + adjunto.getNombreArchivo() + "\"")
                    .body(recurso);
        }
    private ResponseEntity<?> guardarMensaje(
            MensajeRequest request,
            MultipartFile[] archivos,
            Mensaje mensajePadre) {
        if (request.getRemitenteId() == null || request.getDestinatarioId() == null) {
            return respuestaError(HttpStatus.BAD_REQUEST, "Debe indicar remitente y destinatario.");
        }
        if (request.getRemitenteId().equals(request.getDestinatarioId())) {
            return respuestaError(HttpStatus.BAD_REQUEST, "No puedes enviarte un mensaje a ti mismo.");
        }
        if (request.getAsunto() == null || request.getAsunto().trim().isEmpty() || request.getAsunto().length() > 255) {
            return respuestaError(HttpStatus.BAD_REQUEST, "El asunto no es válido.");
        }
        if (request.getContenido() == null || request.getContenido().trim().isEmpty() || request.getContenido().length() > 500) {
            return respuestaError(HttpStatus.BAD_REQUEST, "El mensaje debe tener entre 1 y 500 caracteres.");
        }
        Optional<Usuario> remitente = usuarioRepository.findById(request.getRemitenteId());
        Optional<Usuario> destinatario = usuarioRepository.findById(request.getDestinatarioId());
        if (remitente.isEmpty() || destinatario.isEmpty()) {
            return respuestaError(HttpStatus.NOT_FOUND, "Remitente o destinatario no encontrado.");
        }
        if (archivos != null && archivos.length > 2) {return respuestaError(HttpStatus.BAD_REQUEST, "Solo puedes adjuntar hasta 2 archivos.");}
        List<AdjuntoMensaje> adjuntos = new ArrayList<>();
        if (archivos != null) {
            for (MultipartFile archivo : archivos) {
                if (archivo == null || archivo.isEmpty()) {continue;}
                if (archivo.getSize() > MAX_ADJUNTO_BYTES) {return respuestaError(HttpStatus.BAD_REQUEST, "Cada archivo puede pesar hasta 5 MB.");}
                if (!TIPOS_PERMITIDOS.contains(archivo.getContentType())) {return respuestaError(HttpStatus.BAD_REQUEST, "Tipo de archivo no permitido.");}
                try {
                    AdjuntoMensaje adjunto = new AdjuntoMensaje();
                    adjunto.setNombreArchivo(archivo.getOriginalFilename());
                    adjunto.setTipoArchivo(archivo.getContentType());
                    adjunto.setDatos(archivo.getBytes());
                    adjunto.setTamanioBytes(archivo.getSize());
                    adjuntos.add(adjunto);
                } catch (IOException e) {return respuestaError(HttpStatus.BAD_REQUEST, "No se pudo leer un archivo.");}
            }
        }
        Mensaje mensaje = new Mensaje();
        mensaje.setRemitente(remitente.get());
        mensaje.setDestinatario(destinatario.get());
        mensaje.setAsunto(request.getAsunto().trim());
        mensaje.setContenido(request.getContenido().trim());
        mensaje.setEstado("NO_LEIDO");
        mensaje.setMensajePadre(mensajePadre);
        for (AdjuntoMensaje adjunto : adjuntos) {mensaje.agregarAdjunto(adjunto);}
        Mensaje guardado = mensajeRepository.save(mensaje);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertirMensaje(guardado));
    }
    private List<Map<String, Object>> convertirMensajes(List<Mensaje> mensajes) {
        List<Map<String, Object>> respuesta = new ArrayList<>();
        for (Mensaje mensaje : mensajes) {respuesta.add(convertirMensaje(mensaje));}
        return respuesta;
    }
    private Map<String, Object> convertirMensaje(Mensaje mensaje) {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", mensaje.getId());
        resultado.put("asunto", mensaje.getAsunto());
        resultado.put("contenido", mensaje.getContenido());
        resultado.put("estado", mensaje.getEstado());
        resultado.put("fechaCreacion", mensaje.getFechaCreacion());
        resultado.put("remitenteId", mensaje.getRemitente().getId());
        resultado.put("remitenteNombre", mensaje.getRemitente().getNombre());
        resultado.put("remitenteNickname", mensaje.getRemitente().getNickname());
        resultado.put("destinatarioId", mensaje.getDestinatario().getId());
        resultado.put("destinatarioNombre", mensaje.getDestinatario().getNombre());
        resultado.put("destinatarioNickname", mensaje.getDestinatario().getNickname());
        List<Map<String, Object>> adjuntos = new ArrayList<>();
        for (AdjuntoMensaje adjunto : mensaje.getAdjuntos()) {
            Map<String, Object> datos = new HashMap<>();
            datos.put("id", adjunto.getId());
            datos.put("nombre", adjunto.getNombreArchivo());
            datos.put("tipo", adjunto.getTipoArchivo());
            datos.put("tamanio", adjunto.getTamanioBytes());
            adjuntos.add(datos);
        }
        resultado.put("adjuntos", adjuntos);
        return resultado;
    }
    private ResponseEntity<Map<String, String>>
    respuestaError(HttpStatus estado, String mensaje) {return ResponseEntity.status(estado).body(Map.of("error", mensaje));}
    public static class MensajeRequest {
        private Long remitenteId;
        private Long destinatarioId;
        private String asunto;
        private String contenido;
        public Long getRemitenteId() {return remitenteId;}
        public void setRemitenteId(Long remitenteId) {this.remitenteId = remitenteId;}
        public Long getDestinatarioId() {return destinatarioId;}
        public void setDestinatarioId(Long destinatarioId) {this.destinatarioId = destinatarioId;}
        public String getAsunto() {return asunto;}
        public void setAsunto(String asunto) {this.asunto = asunto;}
        public String getContenido() {return contenido;}
        public void setContenido(String contenido) {this.contenido = contenido;}
    }
}
