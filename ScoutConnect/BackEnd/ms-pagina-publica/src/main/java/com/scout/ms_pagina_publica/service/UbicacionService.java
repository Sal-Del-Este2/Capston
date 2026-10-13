package com.scout.ms_pagina_publica.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.scout.ms_pagina_publica.dto.UbicacionRequestDTO;
import com.scout.ms_pagina_publica.dto.UbicacionResponseDTO;
import com.scout.ms_pagina_publica.model.Comuna;
import com.scout.ms_pagina_publica.model.Region;
import com.scout.ms_pagina_publica.model.Ubicacion;
import com.scout.ms_pagina_publica.repository.ComunaRepository;
import com.scout.ms_pagina_publica.repository.UbicacionRepository;

@Service 
public class UbicacionService {
    private final UbicacionRepository ubicacionRepository;
    private final ComunaRepository comunaRepository;
    public UbicacionService(UbicacionRepository ubicacionRepository, ComunaRepository comunaRepository) {
        this.ubicacionRepository = ubicacionRepository;
        this.comunaRepository = comunaRepository;
    }
    @Transactional (readOnly = true)
    public List<UbicacionResponseDTO> listarTodas() {return ubicacionRepository.findAll().stream().map(this::mapearRespuesta).toList();}
    @Transactional(readOnly = true)
    public List<UbicacionResponseDTO> listarActivas() {return ubicacionRepository.findByActivoTrueOrderByIdAsc().stream().map(this::mapearRespuesta).toList();}
    @Transactional(readOnly = true)
    public UbicacionResponseDTO obtenerPorId(Long id) {Ubicacion ubicacion = buscarUbicacion(id);return mapearRespuesta(ubicacion);}
    @Transactional
    public UbicacionResponseDTO crear(UbicacionRequestDTO request) {Comuna comuna = buscarComuna(request.comunaId());
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setNombre (request.nombre());
        ubicacion.setDescripcion (request.descripcion());
        ubicacion.setDireccion(request.direccion());
        ubicacion.setComuna(comuna);
        ubicacion.setLatitud(request.latitud());
        ubicacion.setLongitud(request.longitud());
        ubicacion.setActivo(request.activo() == null || request.activo());
        return mapearRespuesta(ubicacionRepository.save(ubicacion));
    }
    @Transactional
    public UbicacionResponseDTO actualizar(Long id, UbicacionRequestDTO request) {
        Ubicacion ubicacion = buscarUbicacion(id);
        Comuna comuna = buscarComuna(request.comunaId());
        ubicacion.setNombre(request.nombre());
        ubicacion.setDescripcion(request.descripcion());
        ubicacion.setDireccion(request.direccion());
        ubicacion.setComuna(comuna);
        ubicacion.setLatitud(request.latitud());
        ubicacion.setLongitud(request.longitud());
        if (request.activo() != null) {ubicacion.setActivo(request.activo());}
        return mapearRespuesta(ubicacionRepository.save(ubicacion));
    }
    @Transactional
    public void eliminar(Long id) {
        Ubicacion ubicacion = buscarUbicacion(id);
        ubicacion.setActivo(false);
        ubicacionRepository.save(ubicacion);
    }
    private Ubicacion buscarUbicacion(Long id) {
        return ubicacionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La ubicación solicitada no existe."));
    }
    private Comuna buscarComuna(Long comunaId) {
        return comunaRepository.findById(comunaId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La comuna indicada no existe."));
    }
    private UbicacionResponseDTO mapearRespuesta(Ubicacion ubicacion) {
        Comuna comuna = ubicacion.getComuna();
        Region region = comuna != null ? comuna.getRegion() : null;
        return new UbicacionResponseDTO(
                ubicacion.getId(),
                ubicacion.getNombre(),
                ubicacion.getDescripcion(),
                ubicacion.getDireccion(),
                comuna != null ? comuna.getId() : null,
                comuna != null ? comuna.getNombre() : null,
                region != null ? region.getNombre() : null,
                ubicacion.getLatitud(),
                ubicacion.getLongitud(),
                ubicacion.getActivo(),
                ubicacion.getFechaCreacion(),
                ubicacion.getFechaActualizacion()
        );
    }
}
