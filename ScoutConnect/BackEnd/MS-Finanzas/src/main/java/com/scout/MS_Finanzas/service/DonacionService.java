package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.CrearDonacionRequest;
import com.scout.MS_Finanzas.dto.DonacionResponse;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.*;
import com.scout.MS_Finanzas.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@Transactional
public class DonacionService {
    private final DonacionRepository donacionRepository;
    private final TipoDonacionRepository tipoDonacionRepository;
    private final GrupoRepository grupoRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final PagoRepository pagoRepository;
    private final WebpayService webpayService;
    public DonacionService(
        DonacionRepository donacionRepository,
        TipoDonacionRepository tipoDonacionRepository,
        GrupoRepository grupoRepository,
        EstadoPagoRepository estadoPagoRepository,
        PagoRepository pagoRepository,
        WebpayService webpayService
    ) {
        this.donacionRepository = donacionRepository;
        this.tipoDonacionRepository = tipoDonacionRepository;
        this.grupoRepository = grupoRepository;
        this.estadoPagoRepository = estadoPagoRepository;
        this.pagoRepository = pagoRepository;
        this.webpayService = webpayService;
    }
    public WebpayInicioResponse crear(CrearDonacionRequest request, Long usuarioId) {
        TipoDonacion tipoDonacion = tipoDonacionRepository.findByNombre(
            request.getTipoDonacion().trim().toUpperCase()
        ).orElseThrow(() -> new ValidacionNegocioException("Tipo de donación no válido."));
        boolean identificada = "IDENTIFICADA".equals(tipoDonacion.getNombre());
        if (identificada && (request.getNombreDonante() == null || request.getNombreDonante().isBlank())) {
            throw new ValidacionNegocioException("Debe indicar el nombre del donante.");
        }
        if (identificada && (request.getCorreoDonante() == null || request.getCorreoDonante().isBlank())) {
            throw new ValidacionNegocioException("Debe indicar el correo del donante.");
        }
        EstadoPago estadoPendiente = estadoPagoRepository.findByNombre("PENDIENTE")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no encontrado."));
        Pago pago = new Pago();
        pago.setUsuarioId(usuarioId);
        pago.setMonto(request.getMonto());
        pago.setDescripcion("Donación " + tipoDonacion.getNombre());
        pago.setEstado(estadoPendiente);
        pago.setFechaCreacion(LocalDateTime.now());
        pago.setFechaActualizacion(LocalDateTime.now());
        pago = pagoRepository.save(pago);
        Donacion donacion = new Donacion();
        donacion.setUsuarioId(usuarioId);
        donacion.setTipoDonacion(tipoDonacion);
        donacion.setNombreDonante(request.getNombreDonante());
        donacion.setCorreoDonante(request.getCorreoDonante());
        donacion.setMonto(request.getMonto());
        donacion.setFecha(LocalDateTime.now());
        donacion.setPago(pago);
        donacion.setFechaActualizacion(LocalDateTime.now());
        if (request.getGrupoId() != null) {
            Grupo grupo = grupoRepository.findById(request.getGrupoId()).orElseThrow(() -> new RecursoNoEncontradoException("Grupo no encontrado."));
            donacion.setGrupo(grupo);
        }
        donacion = donacionRepository.save(donacion);
        return webpayService.iniciarPago(
            pago,
            "DONACION-" + donacion.getId(),
            "MS-FINANZAS-DONACION-" + donacion.getId()
        );
    }
    @Transactional(readOnly = true)
    public Page<DonacionResponse> listarAdministrador(Pageable pageable) {return donacionRepository.findAll(pageable).map(this::convertir);}
    private DonacionResponse convertir(Donacion donacion) {
        DonacionResponse response = new DonacionResponse();
        response.setId(donacion.getId());
        response.setUsuarioId(donacion.getUsuarioId());
        response.setTipoDonacion(donacion.getTipoDonacion().getNombre());
        response.setNombreDonante(donacion.getNombreDonante());
        response.setCorreoDonante(donacion.getCorreoDonante());
        response.setMonto(donacion.getMonto());
        response.setFecha(donacion.getFecha());
        if (donacion.getGrupo() != null) {
            response.setGrupoId(donacion.getGrupo().getId());
            response.setGrupoNombre(donacion.getGrupo().getNombre());
        }
        if (donacion.getPago() != null) {
            response.setEstadoPago(donacion.getPago().getEstado().getNombre());
            response.setNumeroTransaccion("PAGO-" + donacion.getPago().getId());
        }
        return response;
    }
}