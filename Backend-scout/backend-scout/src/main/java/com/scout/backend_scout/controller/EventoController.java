package com.scout.backend_scout.controller;

import com.scout.backend_scout.model.Evento;
import com.scout.backend_scout.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RestController
@RequestMapping("/eventos")
public class EventoController {

    @Autowired
    private EventoRepository eventoRepository;

    // Crear evento
    @PostMapping("/crear")
    public Map<String, String> crearEvento(@RequestBody Evento evento) {
        Map<String, String> respuesta = new HashMap<>();

        if (evento.getEstado() == null || evento.getEstado().isEmpty()) {
            evento.setEstado("activo");
        }

        eventoRepository.save(evento);
        respuesta.put("mensaje", "Evento '" + evento.getTitulo() + "' creado correctamente.");
        return respuesta;
    }

    // Listar eventos
    @GetMapping("/listar")
    public List<Evento> listarEventos() {
        return eventoRepository.findAll();
    }

    // Editar evento
    @PutMapping("/editar/{id}")
    public Map<String, String> editarEvento(@PathVariable Long id, @RequestBody Evento eventoActualizado) {
        Map<String, String> respuesta = new HashMap<>();

        Optional<Evento> eventoExistente = eventoRepository.findById(id);
        if (eventoExistente.isEmpty()) {
            respuesta.put("error", "Evento no encontrado.");
            return respuesta;
        }

        Evento e = eventoExistente.get();
        e.setTitulo(eventoActualizado.getTitulo());
        e.setDescripcion(eventoActualizado.getDescripcion());
        e.setFecha(eventoActualizado.getFecha());
        e.setLugar(eventoActualizado.getLugar());
        e.setEstado(eventoActualizado.getEstado());

        eventoRepository.save(e);

        respuesta.put("mensaje", "Evento '" + e.getTitulo() + "' actualizado correctamente.");
        return respuesta;
    }

    // Cambiar estado de evento
    @PutMapping("/estado/{id}")
    public Map<String, String> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, String> respuesta = new HashMap<>();

        Optional<Evento> eventoExistente = eventoRepository.findById(id);
        if (eventoExistente.isEmpty()) {
            respuesta.put("error", "Evento no encontrado.");
            return respuesta;
        }

        Evento e = eventoExistente.get();
        String nuevoEstado = body.get("estado");

        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            respuesta.put("error", "Debe especificar un estado válido (activo/cancelado).");
            return respuesta;
        }

        e.setEstado(nuevoEstado);
        eventoRepository.save(e);

        respuesta.put("mensaje", "Evento '" + e.getTitulo() + "' actualizado a estado " + nuevoEstado + ".");
        return respuesta;
    }
}
