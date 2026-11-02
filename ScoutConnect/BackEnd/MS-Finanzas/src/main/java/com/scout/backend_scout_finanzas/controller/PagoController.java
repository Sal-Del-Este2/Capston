package com.scout.backend_scout_finanzas.controller;

import com.scout.backend_scout_finanzas.dto.TransbankResponse;
import com.scout.backend_scout_finanzas.model.Cuota;
import com.scout.backend_scout_finanzas.model.Donacion;
import com.scout.backend_scout_finanzas.model.EstadoCuota;
import com.scout.backend_scout_finanzas.model.EstadoPago;
import com.scout.backend_scout_finanzas.model.Pago;
import com.scout.backend_scout_finanzas.model.TipoDonacion;
import com.scout.backend_scout_finanzas.repository.CuotaRepository;
import com.scout.backend_scout_finanzas.repository.DonacionRepository;
import com.scout.backend_scout_finanzas.repository.EstadoCuotaRepository;
import com.scout.backend_scout_finanzas.repository.EstadoPagoRepository;
import com.scout.backend_scout_finanzas.repository.PagoRepository;
import com.scout.backend_scout_finanzas.repository.TipoDonacionRepository;
import com.scout.backend_scout_finanzas.security.UsuarioAutenticado;
import com.scout.backend_scout_finanzas.service.TransbankService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/finanzas")
public class PagoController {
    private final PagoRepository pagoRepository;
    private final CuotaRepository cuotaRepository;
    private final DonacionRepository donacionRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final EstadoCuotaRepository estadoCuotaRepository;
    private final TipoDonacionRepository tipoDonacionRepository;
    private final TransbankService transbankService;
    private final UsuarioAutenticado usuarioAutenticado;
    public PagoController(
            PagoRepository pagoRepository,
            CuotaRepository cuotaRepository,
            DonacionRepository donacionRepository,
            EstadoPagoRepository estadoPagoRepository,
            EstadoCuotaRepository estadoCuotaRepository,
            TipoDonacionRepository tipoDonacionRepository,
            TransbankService transbankService,
            UsuarioAutenticado usuarioAutenticado
    ) {
        this.pagoRepository = pagoRepository;
        this.cuotaRepository = cuotaRepository;
        this.donacionRepository = donacionRepository;
        this.estadoPagoRepository = estadoPagoRepository;
        this.estadoCuotaRepository = estadoCuotaRepository;
        this.tipoDonacionRepository = tipoDonacionRepository;
        this.transbankService = transbankService;
        this.usuarioAutenticado = usuarioAutenticado;
    }
    @PostMapping("/pagar")
    public ResponseEntity<Map<String, String>> pagar(@RequestBody Pago pago) {
        try {
            Long usuarioId = usuarioAutenticado.obtenerUsuarioId();
            if (pago.getMonto() == null || pago.getMonto() <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El monto del pago debe ser mayor que cero."));
            }
            if (pago.getTipoPago() == null || pago.getTipoPago().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Debe indicar el tipo de pago."));
            }
            String tipoPago = pago.getTipoPago().trim().toUpperCase();
            if (!tipoPago.equals("CUOTA") && !tipoPago.equals("DONACION")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo de pago no válido."));
            }
            Long cuotaId = null;
            if (tipoPago.equals("CUOTA")) {
                if (pago.getCuotaId() == null) {return ResponseEntity.badRequest().body(Map.of("error", "Debe indicar la cuota a pagar."));}
                Cuota cuota = cuotaRepository.findById(pago.getCuotaId()).orElse(null);
                if (cuota == null) {return ResponseEntity.badRequest().body(Map.of("error", "No existe la cuota indicada."));}
                if (!cuota.getUsuarioId().equals(usuarioId)) {return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No puedes pagar una cuota de otro usuario."));}
                if (!"PENDIENTE".equals(cuota.getEstado().getNombre())) {return ResponseEntity.badRequest().body(Map.of("error", "La cuota ya está pagada."));}
                if (!cuota.getMonto().equals(pago.getMonto())) {return ResponseEntity.badRequest().body(Map.of("error", "El monto debe coincidir con la cuota fijada."));}
                cuotaId = cuota.getId();
            }
            TransbankResponse transbankResponse = transbankService.crearPagoWebpay(pago.getMonto());
            EstadoPago estadoPendiente = estadoPagoRepository.findByNombre("PENDIENTE").orElseThrow(() -> new IllegalStateException("Estado PENDIENTE no existe."));
            Pago nuevoPago = new Pago();
            nuevoPago.setUsuarioId(usuarioId);
            nuevoPago.setTipoPago(tipoPago);
            nuevoPago.setDescripcion(pago.getDescripcion());
            nuevoPago.setMonto(pago.getMonto());
            nuevoPago.setCuotaId(cuotaId);
            nuevoPago.setEstado(estadoPendiente);
            nuevoPago.setCommerceOrder(transbankResponse.getBuyOrder());
            nuevoPago.setTokenFlow(transbankResponse.getToken());
            nuevoPago.setFlowStatus("CREADO");
            nuevoPago.setFechaCreacion(LocalDateTime.now());
            pagoRepository.save(nuevoPago);
            return ResponseEntity.ok(Map.of("urlPago", transbankResponse.getUrlPago(), "pagoId", String.valueOf(nuevoPago.getId())));
        } catch (Exception e) {e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al generar el pago Webpay."));
        }
    }
    @RequestMapping(
        value = "/retorno",
        method = {RequestMethod.GET, RequestMethod.POST}
    )
    @Transactional
    public void retorno(@RequestParam("token_ws") String token, jakarta.servlet.http.HttpServletResponse response) {
        try {
            Optional<Pago> pagoOpt = pagoRepository.findByTokenFlow(token);
            if (pagoOpt.isEmpty()) {redirigir(response, "http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-error.html"); return;}
            Pago pago = pagoOpt.get();
            if ("PAGADO".equals(pago.getEstado().getNombre())) {redirigir(response, "http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-exitoso.html"); return;}
            EstadoPago estadoPagado = estadoPagoRepository.findByNombre("PAGADO").orElseThrow(() -> new IllegalStateException("Estado PAGADO no existe."));
            pago.setEstado(estadoPagado);
            pago.setFlowStatus("PAGADO");
            pago.setFechaPago(LocalDateTime.now());
            pagoRepository.save(pago);
            if ("CUOTA".equals(pago.getTipoPago())) {procesarPagoCuota(pago);}
            if ("DONACION".equals(pago.getTipoPago())) {procesarPagoDonacion(pago);}
            redirigir(response, "http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-exitoso.html");
        } catch (Exception e) {e.printStackTrace();
            redirigir(response, "http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-error.html");
        }
    }
    private void procesarPagoCuota(Pago pago) {
        if (pago.getCuotaId() == null) {return;}
        Optional<Cuota> cuotaOpt = cuotaRepository.findById(pago.getCuotaId());
        if (cuotaOpt.isEmpty()) {return;}
        Cuota cuota = cuotaOpt.get();
        EstadoCuota estadoPagada = estadoCuotaRepository.findByNombre("PAGADA").orElseThrow(() -> new IllegalStateException("Estado PAGADA no existe."));
        cuota.setEstado(estadoPagada);
        cuota.setPagoId(pago.getId());
        cuotaRepository.save(cuota);
    }
    private void procesarPagoDonacion(Pago pago) {
        TipoDonacion tipoIdentificada = tipoDonacionRepository.findByNombre("IDENTIFICADA").orElseThrow(() -> new IllegalStateException("Tipo IDENTIFICADA no existe."));
        Donacion donacion = new Donacion();
        donacion.setUsuarioId(pago.getUsuarioId());
        donacion.setTipoDonacion(tipoIdentificada);
        donacion.setMonto(pago.getMonto());
        donacion.setFecha(LocalDateTime.now());
        donacion.setPagoId(pago.getId());
        donacionRepository.save(donacion);
    }
    private void redirigir(jakarta.servlet.http.HttpServletResponse response, String url) {
        try {response.sendRedirect(url); } catch (Exception e) {e.printStackTrace();}
    }
}