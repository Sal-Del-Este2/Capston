package com.scout.microservicio_actividades.service;

import com.scout.microservicio_actividades.dto.ActualizarEventoRequest;
import com.scout.microservicio_actividades.dto.CrearEventoRequest;
import com.scout.microservicio_actividades.dto.EventoResponse;
import com.scout.microservicio_actividades.dto.FotoEventoResponse;
import com.scout.microservicio_actividades.model.EstadoContenido;
import com.scout.microservicio_actividades.model.Evento;
import com.scout.microservicio_actividades.model.FotoEvento;
import com.scout.microservicio_actividades.repository.EstadoContenidoRepository;
import com.scout.microservicio_actividades.repository.EventoRepository;
import com.scout.microservicio_actividades.repository.FotoEventoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scout.microservicio_actividades.model.Comuna;
import com.scout.microservicio_actividades.model.Grupo;
import com.scout.microservicio_actividades.repository.ComunaRepository;
import com.scout.microservicio_actividades.repository.GrupoRepository;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class EventoService {
    private static final String ESTADO_FINALIZADA = "FINALIZADA";
    private final EventoRepository eventoRepository;
    private final EstadoContenidoRepository estadoContenidoRepository;
    private final FotoEventoRepository fotoEventoRepository;
    private final ComunaRepository comunaRepository;
    private final GrupoRepository grupoRepository;
    public EventoService(
        EventoRepository eventoRepository,
        EstadoContenidoRepository estadoContenidoRepository,
        FotoEventoRepository fotoEventoRepository,
        ComunaRepository comunaRepository,
        GrupoRepository grupoRepository) {
            this.eventoRepository = eventoRepository;
            this.estadoContenidoRepository = estadoContenidoRepository;
            this.fotoEventoRepository = fotoEventoRepository;
            this.comunaRepository = comunaRepository; // marcado con rojo comunaRepository
            this.grupoRepository = grupoRepository;  // marcado con rojo grupoRepository
        }
    public EventoResponse crear(CrearEventoRequest request, Long creadorId) {
        EstadoContenido estado = buscarEstado(request.getEstado());
        Evento evento = new Evento();
        evento.setTitulo(request.getTitulo().trim());
        evento.setFechaRealizacion(request.getFechaRealizacion());
        evento.setLugar(request.getLugar().trim());
        evento.setEstado(estado);
        evento.setDetalle(request.getDetalle().trim());
        evento.setCreadorId(creadorId);
        Comuna comuna = buscarComuna(request.getComunaId());
        Grupo grupo = buscarGrupo(request.getGrupoId());
        evento.setComuna(comuna);
        evento.setGrupo(grupo);
        Evento eventoGuardado = eventoRepository.save(evento);
        return convertirAResponse(eventoGuardado, false);
    }
    @Transactional(readOnly = true)
    public List<EventoResponse>listarParaAutenticados() {
        return eventoRepository.findAllByOrderByFechaRealizacionDesc().stream().map(evento ->
                convertirAResponse(evento, false)).toList();
    }
    @Transactional(readOnly = true)
    public List<EventoResponse>listarParaPublico() {
        return eventoRepository.findByEstado_NombreOrderByFechaRealizacionDesc(ESTADO_FINALIZADA).stream().map(evento ->
                convertirAResponse(evento, true)).toList();
    }
    @Transactional(readOnly = true)
    public EventoResponse obtenerPorId(Long eventoId
    ) {Evento evento = buscarEvento(eventoId);
        return convertirAResponse(evento, false);
    }
    @Transactional(readOnly = true)
    public EventoResponse
    obtenerPublicoPorId(Long eventoId) {Evento evento = buscarEvento(eventoId);
        if (!ESTADO_FINALIZADA.equals(evento.getEstado().getNombre()
            )) {throw new IllegalArgumentException("El evento no está disponible " + "para visitantes externos.");
        }return convertirAResponse(evento, true);
    }
    public EventoResponse actualizar(Long eventoId, ActualizarEventoRequest request
    ) {
        Evento evento = buscarEvento(eventoId);
        EstadoContenido estado = buscarEstado(request.getEstado());
        evento.setTitulo(request.getTitulo().trim());
        evento.setFechaRealizacion(request.getFechaRealizacion());
        evento.setLugar(request.getLugar().trim());
        evento.setEstado(estado);
        evento.setDetalle(request.getDetalle().trim());
        Comuna comuna = buscarComuna(request.getComunaId());
        Grupo grupo = buscarGrupo(request.getGrupoId());
        evento.setComuna(comuna);
        evento.setGrupo(grupo);
        Evento eventoActualizado = eventoRepository.save(evento);
        return convertirAResponse(eventoActualizado, false);
    }
    private Comuna buscarComuna(Long comunaId) {return comunaRepository.findById(comunaId)   // marcado con rojo comunaRepository
        .orElseThrow(() -> new IllegalArgumentException("No existe una comuna con ID " + comunaId + "."));
    }
    private Grupo buscarGrupo(Long grupoId) {return grupoRepository.findById(grupoId)   // marcado con rojo grupoRepository
        .orElseThrow(() -> new IllegalArgumentException("No existe un grupo scout con ID " + grupoId + "."));
    }
    public void eliminar(Long eventoId) {Evento evento = buscarEvento(eventoId); eventoRepository.delete(evento);}
    private Evento buscarEvento(Long eventoId) {return eventoRepository.findById(eventoId).orElseThrow(() ->
        new IllegalArgumentException("No existe un evento con ID " + eventoId + "."));}
    private EstadoContenido buscarEstado(String nombreEstado) {
        String estadoNormalizado = nombreEstado.trim().toUpperCase(Locale.ROOT);
        return estadoContenidoRepository.findByNombre(estadoNormalizado).orElseThrow(() ->
            new IllegalArgumentException("El estado \"" + estadoNormalizado + "\" no es válido."));
    }
    private EventoResponse convertirAResponse(Evento evento, boolean vistaPublica) {
        EventoResponse response = new EventoResponse();
        response.setId(evento.getId());
        response.setTitulo(evento.getTitulo());
        response.setFechaRealizacion(evento.getFechaRealizacion());
        response.setLugar(evento.getLugar());
        response.setEstado(evento.getEstado().getNombre());
        response.setDetalle(evento.getDetalle());
        response.setCreadorId(evento.getCreadorId());
        if (evento.getComuna() != null) {
            response.setComunaId(evento.getComuna().getId());
            response.setComunaNombre(evento.getComuna().getNombre());
        }
        if (evento.getGrupo() != null) {
            response.setGrupoId(evento.getGrupo().getId());
            response.setGrupoNombre(evento.getGrupo().getNombre());
        }
        response.setFechaCreacion(evento.getFechaCreacion());
        response.setFechaActualizacion(evento.getFechaActualizacion());
        List<FotoEventoResponse> fotos = vistaPublica
                ? fotoEventoRepository.findByEvento_IdAndEsPrincipalTrue(evento.getId())
                    .map(this::convertirFotoAResponse)
                    .stream()
                    .toList()
                : fotoEventoRepository.findByEvento_IdOrderByOrdenVisualizacionAsc(evento.getId())
                    .stream().map(this::convertirFotoAResponse).toList();
        response.setFotos(fotos);
        return response;
    }
    private FotoEventoResponse
    convertirFotoAResponse(FotoEvento foto) {FotoEventoResponse response = new FotoEventoResponse();
        response.setId(foto.getId());
        response.setNombreArchivo(foto.getNombreArchivo());
        response.setTipoContenido(foto.getTipoContenido());
        response.setTamanioBytes(foto.getTamanioBytes());
        response.setEsPrincipal(foto.getEsPrincipal());
        response.setOrdenVisualizacion(foto.getOrdenVisualizacion());
        response.setFechaCarga(foto.getFechaCarga());
        response.setUrl("/api/eventos/" + foto.getEvento().getId() + "/fotos/" + foto.getId());
        return response;
    }
}