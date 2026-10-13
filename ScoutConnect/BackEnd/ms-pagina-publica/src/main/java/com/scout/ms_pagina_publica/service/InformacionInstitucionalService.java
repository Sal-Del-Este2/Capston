package com.scout.ms_pagina_publica.service;

import com.scout.ms_pagina_publica.dto.InformacionInstitucionalRequestDTO;
import com.scout.ms_pagina_publica.dto.InformacionInstitucionalResponseDTO;
import com.scout.ms_pagina_publica.model.InformacionInstitucional;
import com.scout.ms_pagina_publica.repository.InformacionInstitucionalRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service 
public class InformacionInstitucionalService {
    private final InformacionInstitucionalRepository repository;
    public InformacionInstitucionalService(InformacionInstitucionalRepository repository) {this.repository = repository;}
    @Transactional(readOnly = true)
    public InformacionInstitucionalResponseDTO obtener() {InformacionInstitucional informacion = repository.findAll()
        .stream()
        .findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe información institucional registrada."));
        return mapearRespuesta(informacion);
    }
    @Transactional
    public InformacionInstitucionalResponseDTO actualizar(Long id, InformacionInstitucionalRequestDTO request) {InformacionInstitucional informacion = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La información institucional solicitada no existe."));
        informacion.setNombreInstitucion(request.nombreInstitucion());
        informacion.setMision(request.mision());
        informacion.setVision(request.vision());
        informacion.setHistoria(request.historia());
        informacion.setValores(request.valores());
        informacion.setCorreoContacto(request.correoContacto());
        informacion.setTelefonoContacto(request.telefonoContacto());
        informacion.setSitioWeb(request.sitioWeb());
        informacion.setLogoUrl(request.logoUrl());
        return mapearRespuesta(repository.save(informacion));
    }
    private InformacionInstitucionalResponseDTO mapearRespuesta(InformacionInstitucional informacion) {
        return new InformacionInstitucionalResponseDTO(
                informacion.getId(),
                informacion.getNombreInstitucion(),
                informacion.getMision(),
                informacion.getVision(),
                informacion.getHistoria(),
                informacion.getValores(),
                informacion.getCorreoContacto(),
                informacion.getTelefonoContacto(),
                informacion.getSitioWeb(),
                informacion.getLogoUrl(),
                informacion.getFechaActualizacion()
        );
    }
}
