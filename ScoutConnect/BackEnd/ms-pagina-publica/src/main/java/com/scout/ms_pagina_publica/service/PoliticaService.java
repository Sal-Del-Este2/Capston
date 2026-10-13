package com.scout.ms_pagina_publica.service;

import java.util.List;
import java.time.LocalDateTime;

import com.scout.ms_pagina_publica.dto.PoliticaRequestDTO;
import com.scout.ms_pagina_publica.dto.PoliticaResponseDTO;
import com.scout.ms_pagina_publica.model.Politica;
import com.scout.ms_pagina_publica.model.TipoPolitica;
import com.scout.ms_pagina_publica.repository.PoliticaRepository;
import com.scout.ms_pagina_publica.repository.TipoPoliticaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PoliticaService {
    private final PoliticaRepository politicaRepository;
    private final TipoPoliticaRepository tipoPoliticaRepository;
    public PoliticaService(PoliticaRepository politicaRepository, TipoPoliticaRepository tipoPoliticaRepository) {
        this.politicaRepository = politicaRepository;
        this.tipoPoliticaRepository = tipoPoliticaRepository;
    }
    @Transactional(readOnly = true)
    public List<PoliticaResponseDTO> listarTodas() {return politicaRepository.findAllByOrderByFechaActualizacionDesc().stream().map(this::mapearRespuesta).toList();}
    @Transactional(readOnly = true)
    public List<PoliticaResponseDTO> listarPublicadas() {return politicaRepository.findByPublicadaTrueOrderByFechaActualizacionDesc().stream().map(this::mapearRespuesta).toList();}
    @Transactional(readOnly = true)
    public PoliticaResponseDTO obtenerPorId(Long id) {return mapearRespuesta(buscarPolitica(id));}
    @Transactional
    public PoliticaResponseDTO crear(PoliticaRequestDTO request) {
        TipoPolitica tipo = buscarTipo(request.tipoPoliticaId());
        Politica politica = new Politica();
        politica.setTipoPolitica(tipo);
        politica.setTitulo(request.titulo());
        politica.setContenido(request.contenido());
        politica.setVersion(1);
        politica.setPublicada(Boolean.TRUE.equals(request.publicada()));
        if (politica.getPublicada()) {politica.setFechaPublicacion(LocalDateTime.now());}
        return mapearRespuesta(politicaRepository.save(politica));
    }
    @Transactional
    public PoliticaResponseDTO actualizar(Long id, PoliticaRequestDTO request) {
        Politica politica = buscarPolitica(id);
        TipoPolitica tipo = buscarTipo(request.tipoPoliticaId());
        politica.setTipoPolitica(tipo);
        politica.setTitulo(request.titulo());
        politica.setContenido(request.contenido());
        politica.setVersion(politica.getVersion() + 1);
        boolean debePublicarse = Boolean.TRUE.equals(request.publicada());
        if (debePublicarse && !Boolean.TRUE.equals(politica.getPublicada())) {politica.setFechaPublicacion(LocalDateTime.now());}
        politica.setPublicada(debePublicarse);
        return mapearRespuesta(politicaRepository.save(politica));
    }
    @Transactional
    public PoliticaResponseDTO cambiarPublicacion(Long id, boolean publicada) {
        Politica politica = buscarPolitica(id);
        politica.setPublicada(publicada);
        if (publicada && politica.getFechaPublicacion() == null) {politica.setFechaPublicacion(LocalDateTime.now());}
        return mapearRespuesta(politicaRepository.save(politica));
    }
    private Politica buscarPolitica(Long id) {return politicaRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La política solicitada no existe."));
    }
    private TipoPolitica buscarTipo(Long tipoPoliticaId) {return tipoPoliticaRepository.findById(tipoPoliticaId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El tipo de política indicado no existe."));
    }
    private PoliticaResponseDTO mapearRespuesta(Politica politica) {TipoPolitica tipo = politica.getTipoPolitica();
        return new PoliticaResponseDTO(
                politica.getId(),
                tipo != null ? tipo.getId() : null,
                tipo != null ? tipo.getNombre() : null,
                politica.getTitulo(),
                politica.getContenido(),
                politica.getVersion(),
                politica.getPublicada(),
                politica.getFechaPublicacion(),
                politica.getFechaCreacion(),
                politica.getFechaActualizacion()
        );
    }
}
