package com.scout.ms_pagina_publica.service;

import com.scout.ms_pagina_publica.dto.ContactoReinoRequestDTO;
import com.scout.ms_pagina_publica.dto.ContactoReinoResponseDTO;
import com.scout.ms_pagina_publica.model.ContactoReino;
import com.scout.ms_pagina_publica.model.Reino;
import com.scout.ms_pagina_publica.repository.ContactoReinoRepository;
import com.scout.ms_pagina_publica.repository.ReinoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactoReinoService {
    private final ContactoReinoRepository contactoRepository;
    private final ReinoRepository reinoRepository; public ContactoReinoService(ContactoReinoRepository contactoRepository, ReinoRepository reinoRepository) {
        this.contactoRepository = contactoRepository;
        this.reinoRepository = reinoRepository;
    }
    @Transactional(readOnly = true)
    public List<ContactoReinoResponseDTO> listarActivos() {return contactoRepository.findByActivoTrueOrderByIdAsc().stream().map(this::mapearRespuesta).toList();}
    @Transactional(readOnly = true)
    public List<ContactoReinoResponseDTO> listarPorReino(Long reinoId) {buscarReino(reinoId);
        return contactoRepository.findByReinoIdOrderByIdAsc(reinoId).stream().map(this::mapearRespuesta).toList();
    }
    @Transactional
    public ContactoReinoResponseDTO asignar(ContactoReinoRequestDTO request) {
        Reino reino = buscarReino(request.reinoId());
        contactoRepository.findByReinoIdAndActivoTrue(reino.getId()).ifPresent(contactoActual -> {
            contactoActual.setActivo(false);
            contactoActual.setFechaDesactivacion(LocalDateTime.now());
            contactoRepository.save(contactoActual);
        });
        ContactoReino contacto = new ContactoReino();
        contacto.setReino(reino);
        contacto.setUsuarioId(request.usuarioId());
        contacto.setCargo(request.cargo());
        contacto.setCorreo(request.correo());
        contacto.setTelefono(request.telefono());
        contacto.setActivo(true);
        return mapearRespuesta(contactoRepository.save(contacto));
    }
    @Transactional
    public ContactoReinoResponseDTO actualizar(Long id, ContactoReinoRequestDTO request) {
        ContactoReino contacto = contactoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El contacto solicitado no existe."));
        Reino reino = buscarReino(request.reinoId());
        contacto.setReino(reino);
        contacto.setUsuarioId(request.usuarioId());
        contacto.setCargo(request.cargo());
        contacto.setCorreo(request.correo());
        contacto.setTelefono(request.telefono());
        return mapearRespuesta(contactoRepository.save(contacto));
    }
    @Transactional
    public void eliminar(Long id) {ContactoReino contacto = contactoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El contacto solicitado no existe."));
        contacto.setActivo(false);
        contacto.setFechaDesactivacion (LocalDateTime.now());
        contactoRepository.save(contacto);
    }
    private Reino buscarReino(Long reinoId) {return reinoRepository.findById(reinoId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El reino indicado no existe."));}
    private ContactoReinoResponseDTO mapearRespuesta(ContactoReino contacto) {Reino reino = contacto.getReino();
        return new ContactoReinoResponseDTO(
                contacto.getId(),
                reino != null ? reino.getId() : null,
                reino != null ? reino.getNombre() : null,
                contacto.getUsuarioId(),
                contacto.getCargo(),
                contacto.getCorreo(),
                contacto.getTelefono(),
                contacto.getActivo(),
                contacto.getFechaAsignacion(),
                contacto.getFechaDesactivacion()
        );
    }
}
