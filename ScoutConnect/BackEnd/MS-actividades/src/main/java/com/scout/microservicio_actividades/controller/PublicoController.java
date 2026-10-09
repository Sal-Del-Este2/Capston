package com.scout.microservicio_actividades.controller;

import java.util.List;

import com.scout.microservicio_actividades.dto.EventoResponse;
import com.scout.microservicio_actividades.dto.NoticiaResponse;
import com.scout.microservicio_actividades.service.EventoService;
import com.scout.microservicio_actividades.service.NoticiaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicoController {
    private final NoticiaService noticiaService;
    private final EventoService eventoService;
    public PublicoController(
        NoticiaService noticiaService,
        EventoService eventoService) {
            this.noticiaService = noticiaService;
            this.eventoService = eventoService;
        }
    @GetMapping("/noticias")
    public ResponseEntity<List<NoticiaResponse>>
    listarNoticiasFinalizadas() {return ResponseEntity.ok(noticiaService.listarParaPublico());}
    @GetMapping("/noticias/{noticiaId}")
    public ResponseEntity<NoticiaResponse>
    obtenerNoticiaFinalizada(
        @PathVariable Long noticiaId) {
            return ResponseEntity.ok(noticiaService.obtenerPublicaPorId(noticiaId));
        }
    @GetMapping("/eventos")
    public ResponseEntity<List<EventoResponse>>
    listarEventosFinalizados() {return ResponseEntity.ok(eventoService.listarParaPublico());}
    @GetMapping("/eventos/{eventoId}")
    public ResponseEntity<EventoResponse>
    obtenerEventoFinalizado(
        @PathVariable Long eventoId) {
            return ResponseEntity.ok(eventoService.obtenerPublicoPorId(eventoId));
        }
    
}
