package com.scout.microservicio_actividades.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import com.scout.microservicio_actividades.dto.FotoEventoResponse;
import com.scout.microservicio_actividades.model.FotoEvento;
import com.scout.microservicio_actividades.service.FotoEventoService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/eventos/{eventoId}/fotos")
public class FotoEventoController {
    private final FotoEventoService fotoEventoService;
    public FotoEventoController(FotoEventoService fotoEventoService) {
        this.fotoEventoService = fotoEventoService;}
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FotoEventoResponse>>
    subirFotos(
        @PathVariable Long eventoId,
        @RequestParam("archivos")
        List<MultipartFile> archivos) {
            List<FotoEventoResponse> respuesta = fotoEventoService.subirFotos(eventoId, archivos);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
    @PutMapping("/{fotoId}/principal")
    public ResponseEntity<FotoEventoResponse>
    marcarComoPrincipal(
        @PathVariable Long eventoId,
        @PathVariable Long fotoId) {
            return ResponseEntity.ok(fotoEventoService.marcarComoPrincipal(eventoId, fotoId));
        }
    @DeleteMapping("/{fotoId}")
    public ResponseEntity<Void> eliminarFoto(
        @PathVariable Long eventoId,
        @PathVariable Long fotoId) {
            fotoEventoService.eliminarFoto(eventoId, fotoId);
            return ResponseEntity.noContent().build();
    }
    @GetMapping("/{fotoId}")
    public ResponseEntity<Resource> verFoto(
        @PathVariable Long eventoId,
        @PathVariable Long fotoId) {

            FotoEvento foto = fotoEventoService.buscarFotoDelEvento(eventoId, fotoId);
            Path ruta = fotoEventoService.obtenerRutaFoto(eventoId, fotoId);
            FileSystemResource recurso = new FileSystemResource(ruta.toFile());
            MediaType tipoContenido = obtenerTipoContenido(ruta, foto.getTipoContenido());
            return ResponseEntity.ok().contentType(tipoContenido)
                .contentLength(foto.getTamanioBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(foto.getNombreArchivo()).build().toString())
                .body(recurso);
        }
    private MediaType obtenerTipoContenido(Path ruta, String tipoContenidoGuardado) {
        try {
            String tipoDetectado = Files.probeContentType(ruta);
            if (tipoDetectado != null) {return MediaType.parseMediaType(tipoDetectado);}
            if (tipoContenidoGuardado != null) {return MediaType.parseMediaType(tipoContenidoGuardado);}
        } catch (Exception error) {return MediaType.APPLICATION_OCTET_STREAM;}
        return MediaType.APPLICATION_OCTET_STREAM;
    }
    
}
