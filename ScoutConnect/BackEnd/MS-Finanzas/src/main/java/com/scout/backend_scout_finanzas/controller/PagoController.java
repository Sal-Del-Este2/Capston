package com.scout.backend_scout_finanzas.controller;

import com.scout.backend_scout_finanzas.dto.TransbankResponse;
import com.scout.backend_scout_finanzas.model.Cuota;
import com.scout.backend_scout_finanzas.model.Donacion;
import com.scout.backend_scout_finanzas.model.Pago;
import com.scout.backend_scout_finanzas.repository.CuotaRepository;
import com.scout.backend_scout_finanzas.repository.DonacionRepository;
import com.scout.backend_scout_finanzas.repository.PagoRepository;
import com.scout.backend_scout_finanzas.service.TransbankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"})
@RestController
@RequestMapping("/finanzas")
public class PagoController {
    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private TransbankService transbankService;
    @Autowired
    private DonacionRepository donacionRepository;
    @Autowired
    private CuotaRepository cuotaRepository;
    // Registrar pago local
    @PostMapping("/registrar")
    public Map<String, String> registrarPago(@RequestBody Pago pago) {Map<String, String> respuesta = new HashMap<>();
        if (pago.getEstado() == null || pago.getEstado().isEmpty()) {pago.setEstado("PENDIENTE");}
        if (pago.getFechaCreacion() == null) {pago.setFechaCreacion(LocalDateTime.now());}
            try {pagoRepository.save(pago);
            } catch (Exception ex) {System.out.println("ERROR CREANDO DONACION");
                ex.printStackTrace();
            }respuesta.put("mensaje", "Transacción registrada correctamente.");
        return respuesta;
    }
    // Historial completo
    @GetMapping("/historial")
    public List<Pago> listarPagos() {return pagoRepository.findAll();}
    // Historial por usuario
    @GetMapping("/historial/{usuarioId}")
    public List<Pago> listarPagosPorUsuario(
        @PathVariable Long usuarioId) {return pagoRepository.findByUsuarioId(usuarioId);}
    // Crear pago Webpay
    @PostMapping("/pagar")
    public ResponseEntity<Map<String, String>> pagar(
    @RequestBody Pago pago) {
        try {
            TransbankResponse transbankResponse = transbankService.crearPagoWebpay(pago.getMonto());
            System.out.println("******** WEBPAY ACTIVO ********");
            Pago nuevoPago = new Pago();
            nuevoPago.setUsuarioId(pago.getUsuarioId());
            nuevoPago.setTipoPago(pago.getTipoPago());
            nuevoPago.setDescripcion(pago.getDescripcion());
            nuevoPago.setMonto(pago.getMonto());
            nuevoPago.setCuotaId(pago.getCuotaId());
            nuevoPago.setEstado("PENDIENTE");
            nuevoPago.setCommerceOrder(transbankResponse.getBuyOrder());
            nuevoPago.setTokenFlow(transbankResponse.getToken());
            nuevoPago.setFlowOrder(null);
            nuevoPago.setFlowStatus("CREADO");
            nuevoPago.setFechaCreacion(LocalDateTime.now());
            pagoRepository.save(nuevoPago);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("urlPago", transbankResponse.getUrlPago());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al generar pago Transbank: " + e.getMessage()));
        }
    }
    // Cambio manual de estado
    @PutMapping("/estado/{id}")
    public Map<String, String> actualizarEstado(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {Map<String, String> respuesta = new HashMap<>();
        Optional<Pago> pagoOpt = pagoRepository.findById(id);
        if (pagoOpt.isPresent()) {Pago pago = pagoOpt.get();
            System.out.println("TIPO PAGO EN RETORNO = " + pago.getTipoPago());
            pago.setEstado(body.get("estado"));
            pagoRepository.save(pago);
            respuesta.put("mensaje", "Estado actualizado correctamente.");
        } else {respuesta.put("error", "Pago no encontrado.");
        }return respuesta;
    }
    // Retorno Webpay
    @RequestMapping(
        value = "/retorno",
        method = {RequestMethod.GET, RequestMethod.POST}
    )
    public void retorno(@RequestParam("token_ws") String token, jakarta.servlet.http.HttpServletResponse response) {
        try {
            System.out.println("======== RETORNO WEBPAY ========");
            System.out.println("TOKEN = " + token);
            System.out.println("===============================");
            Optional<Pago> pagoOpt = pagoRepository.findByTokenFlow(token);
            if (pagoOpt.isPresent()) {
                Pago pago = pagoOpt.get();
                System.out.println("TIPO PAGO EN RETORNO = " + pago.getTipoPago());
                System.out.println("ID PAGO = " + pago.getId());
                pago.setEstado("PAGADO");
                pago.setFlowStatus("PAGADO");
                pago.setFechaPago(LocalDateTime.now());
                pagoRepository.save(pago);
                System.out.println("PAGO ACTUALIZADO");
                try {
                    if ("DONACION".equals(pago.getTipoPago())) {
                        System.out.println("***** CREANDO DONACION *****");
                        Donacion donacion = new Donacion();
                        donacion.setUsuarioId(pago.getUsuarioId());
                        donacion.setTipoDonacion("IDENTIFICADA");
                        donacion.setMonto(pago.getMonto());
                        donacion.setFecha(LocalDateTime.now());
                        donacion.setPagoId(pago.getId());
                        donacionRepository.save(donacion);
                        System.out.println("***** DONACION GUARDADA *****");
                    }
                } catch (Exception ex) {System.out.println("ERROR AL GUARDAR DONACION");
                    ex.printStackTrace();
                }
                if ("CUOTA".equals(pago.getTipoPago())) {
                    System.out.println("***** ACTUALIZANDO CUOTA *****");
                    Optional<Cuota> cuotaOpt = cuotaRepository.findById(pago.getCuotaId());
                    if (cuotaOpt.isPresent()) {
                            Cuota cuota = cuotaOpt.get();
                            cuota.setEstado("PAGADA");
                            cuota.setPagoId(pago.getId());
                            cuotaRepository.save(cuota);
                            System.out.println("***** CUOTA PAGADA *****");
                    } else {System.out.println("NO SE ENCONTRO LA CUOTA");
                    }
                }
            } else {System.out.println("NO SE ENCONTRO PAGO PARA TOKEN = " + token);
            }response.sendRedirect("http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-exitoso.html");
        } catch (Exception e) {e.printStackTrace();
            try {response.sendRedirect("http://127.0.0.1:5501/ScoutConnect/FrontEnd/pago-error.html");}
            catch (Exception ex) {ex.printStackTrace();}
        }
    }
}