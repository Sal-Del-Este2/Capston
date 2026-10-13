package com.scout.ms_pagina_publica.controller;

import java.util.List;

import com.scout.ms_pagina_publica.dto.ComunaDTO;
import com.scout.ms_pagina_publica.dto.RegionDTO;
import com.scout.ms_pagina_publica.dto.ReinoDTO;
import com.scout.ms_pagina_publica.dto.TipoPoliticaDTO;

import com.scout.ms_pagina_publica.model.Comuna;
import com.scout.ms_pagina_publica.model.Region;
import com.scout.ms_pagina_publica.model.Reino;
import com.scout.ms_pagina_publica.model.TipoPolitica;

import com.scout.ms_pagina_publica.repository.ComunaRepository;
import com.scout.ms_pagina_publica.repository.RegionRepository;
import com.scout.ms_pagina_publica.repository.ReinoRepository;
import com.scout.ms_pagina_publica.repository.TipoPoliticaRepository;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController 
@RequestMapping("/api/catalogos")
public class CatalogoController {
    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;
    private final ReinoRepository reinoRepository;
    private final TipoPoliticaRepository tipoPoliticaRepository;
    public CatalogoController(
        RegionRepository regionRepository,
        ComunaRepository comunaRepository,
        ReinoRepository reinoRepository,
        TipoPoliticaRepository tipoPoliticaRepository) {
            this.regionRepository = regionRepository;
            this.comunaRepository = comunaRepository;
            this.reinoRepository = reinoRepository;
            this.tipoPoliticaRepository = tipoPoliticaRepository;
        }
    @GetMapping("/regiones")
    public ResponseEntity<List<RegionDTO>> listarRegiones() {List<RegionDTO> respuesta = regionRepository.findAll().stream().map(this::mapearRegion).toList();
        return ResponseEntity.ok(respuesta);
    }
    @GetMapping("/comunas")
    public ResponseEntity<List<ComunaDTO>> listarComunas(@RequestParam(required = false) Long regionId) {
        List<Comuna> comunas = regionId == null ? comunaRepository.findAll() : comunaRepository.findByRegionIdOrderByIdAsc(regionId);
        List<ComunaDTO> respuesta = comunas.stream().map(this::mapearComuna).toList();
        return ResponseEntity.ok(respuesta);
    }
    @GetMapping("/reinos")
    public ResponseEntity<List<ReinoDTO>> listarReinos() {List<ReinoDTO> respuesta = reinoRepository.findByActivoTrueOrderByIdAsc().stream().map(this::mapearReino).toList();
        return ResponseEntity.ok(respuesta);
    }
    @GetMapping("/tipos-politica")
    public ResponseEntity<List<TipoPoliticaDTO>> listarTiposPolitica() {List<TipoPoliticaDTO> respuesta = tipoPoliticaRepository.findAll().stream().map(this::mapearTipoPolitica).toList();
        return ResponseEntity.ok(respuesta);
    }
    private RegionDTO mapearRegion(Region region) {return new RegionDTO(region.getId(), region.getNombre());}
    private ComunaDTO mapearComuna(Comuna comuna) {Region region = comuna.getRegion();
        return new ComunaDTO(comuna.getId(), comuna.getNombre(),
            region != null ? region.getId() : null,
            region != null ? region.getNombre() : null
        );
    }
    private ReinoDTO mapearReino(Reino reino) {
        Comuna comuna = reino.getComuna();
        Region region = comuna != null ? comuna.getRegion() : null;
        return new ReinoDTO(reino.getId(), reino.getNombre(), reino.getDescripcion(), reino.getActivo(),
            comuna != null ? comuna.getId() : null,
            comuna != null ? comuna.getNombre() : null,
            region != null ? region.getNombre() : null
        );
    }
    private TipoPoliticaDTO mapearTipoPolitica(TipoPolitica tipo) {return new TipoPoliticaDTO(tipo.getId(), tipo.getNombre(), tipo.getDescripcion());}
}
