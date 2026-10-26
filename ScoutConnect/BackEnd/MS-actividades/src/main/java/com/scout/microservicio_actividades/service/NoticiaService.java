package com.scout.microservicio_actividades.service;

import com.scout.microservicio_actividades.dto.ActualizarNoticiaRequest;
import com.scout.microservicio_actividades.dto.CrearNoticiaRequest;
import com.scout.microservicio_actividades.dto.NoticiaResponse;
import com.scout.microservicio_actividades.model.Comuna;
import com.scout.microservicio_actividades.model.EstadoContenido;
import com.scout.microservicio_actividades.model.Grupo;
import com.scout.microservicio_actividades.model.Noticia;
import com.scout.microservicio_actividades.repository.ComunaRepository;
import com.scout.microservicio_actividades.repository.EstadoContenidoRepository;
import com.scout.microservicio_actividades.repository.GrupoRepository;
import com.scout.microservicio_actividades.repository.NoticiaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class NoticiaService {
    private static final String ESTADO_FINALIZADA = "FINALIZADA";
    private final NoticiaRepository noticiaRepository;
    private final EstadoContenidoRepository estadoContenidoRepository;
    private final ComunaRepository comunaRepository;
    private final GrupoRepository grupoRepository;
    public NoticiaService(
        NoticiaRepository noticiaRepository,
        EstadoContenidoRepository estadoContenidoRepository,
        ComunaRepository comunaRepository,
        GrupoRepository grupoRepository) {
            this.noticiaRepository = noticiaRepository;
            this.estadoContenidoRepository = estadoContenidoRepository;
            this.comunaRepository = comunaRepository;
            this.grupoRepository = grupoRepository;
        }
    public NoticiaResponse crear(CrearNoticiaRequest request, Long creadorId) {
        EstadoContenido estado = buscarEstado(request.getEstado());
        Comuna comuna = buscarComuna(request.getComunaId());
        Grupo grupo = buscarGrupo(request.getGrupoId());
        Noticia noticia = new Noticia();
        noticia.setTitulo(request.getTitulo().trim());
        noticia.setFechaRealizacion(request.getFechaRealizacion());
        noticia.setLugar(request.getLugar().trim());
        noticia.setEstado(estado);
        noticia.setDetalle(request.getDetalle().trim());
        noticia.setCreadorId(creadorId);
        noticia.setComuna(comuna);
        noticia.setGrupo(grupo);
        Noticia noticiaGuardada = noticiaRepository.save(noticia);
        return convertirAResponse(noticiaGuardada);
    }
    @Transactional(readOnly = true)
    public List<NoticiaResponse> listarParaAutenticados() {
        return noticiaRepository.findAllByOrderByFechaRealizacionDesc().stream().map(this::convertirAResponse).toList();}
    @Transactional(readOnly = true)
    public List<NoticiaResponse> listarParaPublico() {
        return noticiaRepository.findByEstado_NombreOrderByFechaRealizacionDesc(ESTADO_FINALIZADA).stream().map(this::convertirAResponse).toList();}
    @Transactional(readOnly = true)
    public NoticiaResponse obtenerPorId(Long noticiaId) {Noticia noticia = buscarNoticia(noticiaId); return convertirAResponse(noticia);}
    @Transactional(readOnly = true)
    public NoticiaResponse obtenerPublicaPorId(Long noticiaId) {Noticia noticia = buscarNoticia(noticiaId);
        if (!ESTADO_FINALIZADA.equals(noticia.getEstado().getNombre())) {
            throw new IllegalArgumentException("La noticia no está disponible para visitantes externos.");
        }
        return convertirAResponse(noticia);
    }
    public NoticiaResponse actualizar(Long noticiaId, ActualizarNoticiaRequest request ) {
        Noticia noticia = buscarNoticia(noticiaId);
        EstadoContenido estado = buscarEstado(request.getEstado());
        Comuna comuna = buscarComuna(request.getComunaId());
        Grupo grupo = buscarGrupo(request.getGrupoId());
        noticia.setTitulo(request.getTitulo().trim());
        noticia.setFechaRealizacion(request.getFechaRealizacion());
        noticia.setLugar(request.getLugar().trim());
        noticia.setEstado(estado);
        noticia.setDetalle(request.getDetalle().trim());
        noticia.setComuna(comuna);
        noticia.setGrupo(grupo);
        Noticia noticiaActualizada = noticiaRepository.save(noticia);
        return convertirAResponse(noticiaActualizada);
    }
    public void eliminar(Long noticiaId) {Noticia noticia = buscarNoticia(noticiaId);
        noticiaRepository.delete(noticia);
    }
    private Noticia buscarNoticia(Long noticiaId) {
        return noticiaRepository.findById(noticiaId).orElseThrow(() -> new IllegalArgumentException("No existe una noticia con ID " + noticiaId + "."));
    }
    private EstadoContenido buscarEstado(String nombreEstado) {
        String estadoNormalizado = nombreEstado.trim().toUpperCase(Locale.ROOT);
        return estadoContenidoRepository.findByNombre(estadoNormalizado).orElseThrow(() ->
            new IllegalArgumentException("El estado \"" + estadoNormalizado + "\" no es válido."));
    }
    private Comuna buscarComuna(Long comunaId) {
        return comunaRepository.findById(comunaId).orElseThrow(() -> new IllegalArgumentException("No existe una comuna con ID " + comunaId + "."));
    }
    private Grupo buscarGrupo(Long grupoId) {
        return grupoRepository.findById(grupoId).orElseThrow(() -> new IllegalArgumentException("No existe un grupo scout con ID " + grupoId + "."));
    }
    private NoticiaResponse convertirAResponse(Noticia noticia) {
        NoticiaResponse response = new NoticiaResponse();
        response.setId(noticia.getId());
        response.setTitulo(noticia.getTitulo());
        response.setFechaRealizacion(noticia.getFechaRealizacion());
        response.setLugar(noticia.getLugar());
        response.setEstado(noticia.getEstado().getNombre());
        response.setDetalle(noticia.getDetalle());
        response.setCreadorId(noticia.getCreadorId());
        if (noticia.getComuna() != null) {response.setComunaId(noticia.getComuna().getId());
            response.setComunaNombre(noticia.getComuna().getNombre());
        }
        if (noticia.getGrupo() != null) {response.setGrupoId(noticia.getGrupo().getId());
            response.setGrupoNombre(noticia.getGrupo().getNombre());
        }
        response.setFechaCreacion(noticia.getFechaCreacion());
        response.setFechaActualizacion(noticia.getFechaActualizacion());
        return response;
    }
}
