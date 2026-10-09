package com.scout.microservicio_actividades.controller;

import java.util.List;

import com.scout.microservicio_actividades.dto.ActualizarEventoRequest;
import com.scout.microservicio_actividades.dto.CrearEventoRequest;
import com.scout.microservicio_actividades.dto.EventoResponse;
import com.scout.microservicio_actividades.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {
    private final EventoService eventoService;
    public EventoController(EventoService eventoService) {this.eventoService = eventoService;}
    @PostMapping
    public ResponseEntity<EventoResponse> crear(
        @Valid
        @RequestBody
        CrearEventoRequest request) {
            EventoResponse respuesta = eventoService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        }
    @GetMapping
    public ResponseEntity<List<EventoResponse>>
    listarParaAutenticados() {return ResponseEntity.ok(eventoService.listarParaAutenticados());}
    @GetMapping("/{eventoId}")
    public ResponseEntity<EventoResponse>
    obtenerPorId(@PathVariable Long eventoId) {return ResponseEntity.ok(eventoService.obtenerPorId(eventoId));}
    @PutMapping("/{eventoId}")
    public ResponseEntity<EventoResponse>
    actualizar(
        @PathVariable Long eventoId,
        @Valid
        @RequestBody
        ActualizarEventoRequest request) {
            return ResponseEntity.ok(eventoService.actualizar(eventoId, request));
        }
    @DeleteMapping("/{eventoId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long eventoId) {eventoService.eliminar(eventoId);
        return ResponseEntity.noContent().build();}
    
}
