package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.CrearCuotaRequest;
import com.scout.MS_Finanzas.dto.CuotaResponse;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.*;
import com.scout.MS_Finanzas.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CuotaService {
    private final EstadoConfiguracionCuotaRepository estadoConfiguracionCuotaRepository;
    private final CuotaRepository cuotaRepository;
    private final ConfiguracionCuotaRepository configuracionRepository;
    private final EstadoCuotaRepository estadoCuotaRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final GrupoRepository grupoRepository;
    private final RamaRepository ramaRepository;
    private final PagoRepository pagoRepository;
    private final WebpayService webpayService;
    public CuotaService(
        CuotaRepository cuotaRepository,
        ConfiguracionCuotaRepository configuracionRepository,
        EstadoCuotaRepository estadoCuotaRepository,
        EstadoPagoRepository estadoPagoRepository,
        GrupoRepository grupoRepository,
        RamaRepository ramaRepository,
        PagoRepository pagoRepository,
        WebpayService webpayService,
        EstadoConfiguracionCuotaRepository estadoConfiguracionCuotaRepository
    ) {
        this.cuotaRepository = cuotaRepository;
        this.configuracionRepository = configuracionRepository;
        this.estadoCuotaRepository = estadoCuotaRepository;
        this.estadoPagoRepository = estadoPagoRepository;
        this.grupoRepository = grupoRepository;
        this.ramaRepository = ramaRepository;
        this.pagoRepository = pagoRepository;
        this.webpayService = webpayService;
        this.estadoConfiguracionCuotaRepository = estadoConfiguracionCuotaRepository;
    }
    public CuotaResponse definirValorComunidad(BigDecimal monto, LocalDate vigenteDesde) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {throw new ValidacionNegocioException("El monto debe ser mayor a $0.");}
        EstadoConfiguracionCuota estadoActivo = estadoConfiguracionCuotaRepository
            .findByNombre("ACTIVA")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado ACTIVA no encontrado."));
        ConfiguracionCuota configuracion = new ConfiguracionCuota();
        configuracion.setMonto(monto);
        configuracion.setVigenteDesde(vigenteDesde);
        configuracion.setEstado(estadoActivo);
        configuracion.setFechaCreacion(LocalDateTime.now());
        configuracionRepository.save(configuracion);
        CuotaResponse response = new CuotaResponse();
        response.setMonto(monto);
        return response;
    }
    public CuotaResponse crear(CrearCuotaRequest request) {
        if (cuotaRepository.findByUsuarioIdAndAnioAndMes(
            request.getUsuarioId(),
            request.getAnio(),
            request.getMes()
        ).isPresent()) {throw new ValidacionNegocioException("El usuario ya tiene una cuota para ese mes y año.");}
        BigDecimal monto = request.getMonto();
        if (monto == null) {
            ConfiguracionCuota configuracion = configuracionRepository
                .findFirstByEstadoNombreOrderByVigenteDesdeDesc("ACTIVA")
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe una configuración de cuota activa."));
            monto = configuracion.getMonto();
        }
        EstadoCuota estadoPendiente = estadoCuotaRepository.findByNombre("PENDIENTE")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no encontrado."));
        Cuota cuota = new Cuota();
        cuota.setUsuarioId(request.getUsuarioId());
        cuota.setAnio(request.getAnio());
        cuota.setMes(request.getMes());
        cuota.setMonto(monto);
        cuota.setFechaVencimiento(LocalDate.of(request.getAnio(), 12, 31)); // vencimiento de todas las cuotas de un año, 31/ diciembre
        cuota.setEstado(estadoPendiente);
        cuota.setFechaCreacion(LocalDateTime.now());
        cuota.setFechaActualizacion(LocalDateTime.now());
        if (request.getGrupoId() != null) {
            Grupo grupo = grupoRepository.findById(request.getGrupoId()).orElseThrow(() -> new RecursoNoEncontradoException("Grupo no encontrado."));
            cuota.setGrupo(grupo);
        }
        if (request.getRamaId() != null) {
            Rama rama = ramaRepository.findById(request.getRamaId()).orElseThrow(() -> new RecursoNoEncontradoException("Rama no encontrada."));
            cuota.setRama(rama);
        }
        return convertir(cuotaRepository.save(cuota));
    }
    @Transactional(readOnly = true)
    public Page<CuotaResponse> listarAdministrador(
        Long usuarioId,
        String estado,
        Long grupoId,
        Long ramaId,
        Pageable pageable
    ) {
        Specification<Cuota> especificacion = (root, query, criteriaBuilder) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (usuarioId != null) {condiciones.add(criteriaBuilder.equal(root.get("usuarioId"), usuarioId));}
            if (estado != null && !estado.isBlank()) {
                condiciones.add(criteriaBuilder.equal(
                    root.join("estado").get("nombre"),
                    estado.trim().toUpperCase()
                ));
            }
            if (grupoId != null) {condiciones.add(criteriaBuilder.equal(root.join("grupo").get("id"), grupoId));}
            if (ramaId != null) {condiciones.add(criteriaBuilder.equal(root.join("rama").get("id"), ramaId));}
            return criteriaBuilder.and(condiciones.toArray(new Predicate[0]));
        };
        return cuotaRepository.findAll(especificacion, pageable).map(this::convertir);
    }
    @Transactional(readOnly = true)
    public List<CuotaResponse> listarPorUsuario(Long usuarioId) {
        return cuotaRepository.findByUsuarioIdOrderByAnioDescMesDesc(usuarioId)
            .stream()
            .map(this::convertir)
            .toList();
    }
    public CuotaResponse pagar(Long cuotaId, Long usuarioId) {
        Cuota cuota = cuotaRepository.findById(cuotaId).orElseThrow(() -> new RecursoNoEncontradoException("Cuota no encontrada."));
        if (!cuota.getUsuarioId().equals(usuarioId)) {throw new ValidacionNegocioException("No puedes pagar una cuota de otro usuario.");}
        if ("PAGADA".equals(cuota.getEstado().getNombre())) {throw new ValidacionNegocioException("La cuota ya está pagada.");}
        EstadoPago estadoPagado = estadoPagoRepository.findByNombre("PAGADO")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PAGADO no encontrado."));
        EstadoCuota estadoPagada = estadoCuotaRepository.findByNombre("PAGADA")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PAGADA no encontrado."));
        Pago pago = new Pago();
        pago.setUsuarioId(usuarioId);
        pago.setMonto(cuota.getMonto());
        pago.setDescripcion("Pago de cuota " + cuota.getMes() + "/" + cuota.getAnio());
        pago.setEstado(estadoPagado);
        pago.setFechaCreacion(LocalDateTime.now());
        pago.setFechaPago(LocalDateTime.now());
        pago.setFechaActualizacion(LocalDateTime.now());
        pago = pagoRepository.save(pago);
        cuota.setPago(pago);
        cuota.setEstado(estadoPagada);
        cuota.setFechaPago(LocalDateTime.now());
        cuota.setFechaActualizacion(LocalDateTime.now());
        return convertir(cuotaRepository.save(cuota));
    }
    private CuotaResponse convertir(Cuota cuota) {
        CuotaResponse response = new CuotaResponse();
        response.setId(cuota.getId());
        response.setUsuarioId(cuota.getUsuarioId());
        response.setAnio(cuota.getAnio());
        response.setMes(cuota.getMes());
        response.setMonto(cuota.getMonto());
        response.setFechaVencimiento(cuota.getFechaVencimiento());
        response.setEstado(cuota.getEstado().getNombre());
        response.setFechaPago(cuota.getFechaPago());
        if (cuota.getGrupo() != null) {
            response.setGrupoId(cuota.getGrupo().getId());
            response.setGrupoNombre(cuota.getGrupo().getNombre());
        }
        if (cuota.getRama() != null) {
            response.setRamaId(cuota.getRama().getId());
            response.setRamaNombre(cuota.getRama().getNombre());
        }
        return response;
    }
    // private final WebpayService webpayService;
    public WebpayInicioResponse iniciarPagoWebpay(Long cuotaId, Long usuarioId) {
        Cuota cuota = cuotaRepository.findById(cuotaId).orElseThrow(() -> new RecursoNoEncontradoException("Cuota no encontrada."));
        if (!cuota.getUsuarioId().equals(usuarioId)) {throw new ValidacionNegocioException("No puedes pagar una cuota de otro usuario.");}
        if ("PAGADA".equals(cuota.getEstado().getNombre())) {throw new ValidacionNegocioException("La cuota ya está pagada.");}
        EstadoPago estadoPendiente = estadoPagoRepository.findByNombre("PENDIENTE")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no encontrado."));
        Pago pago = new Pago();
        pago.setUsuarioId(usuarioId);
        pago.setMonto(cuota.getMonto());
        pago.setDescripcion("Pago cuota " + cuota.getMes() + "/" + cuota.getAnio());
        pago.setEstado(estadoPendiente);
        pago.setFechaCreacion(LocalDateTime.now());
        pago.setFechaActualizacion(LocalDateTime.now());
        pago = pagoRepository.save(pago);
        cuota.setPago(pago);
        cuota.setFechaActualizacion(LocalDateTime.now());
        cuotaRepository.save(cuota);
        return webpayService.iniciarPago(
            pago,
            "CUOTA-" + cuota.getId(),
            "MS-FINANZAS-CUOTA-" + cuota.getId()
        );
    }
}