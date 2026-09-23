package com.scout.backend_scout_finanzas.controller;

import com.scout.backend_scout_finanzas.model.Pago;
import com.scout.backend_scout_finanzas.repository.PagoRepository;
import com.scout.backend_scout_finanzas.service.MercadoPagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RestController
@RequestMapping("/finanzas")
public class PagoController {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private MercadoPagoService mercadoPagoService;

    // 🔹 Registrar pago local
    @PostMapping("/registrar")
    public Map<String, String> registrarPago(@RequestBody Pago pago) {
        Map<String, String> respuesta = new HashMap<>();
        if (pago.getEstado() == null || pago.getEstado().isEmpty()) {
            pago.setEstado("pendiente");
        }
        pago.setFecha(LocalDateTime.now());
        pagoRepository.save(pago);
        respuesta.put("mensaje", "Transacción registrada correctamente.");
        return respuesta;
    }

    // 🔹 Listar todos los pagos
    @GetMapping("/historial")
    public List<Pago> listarPagos() {
        return pagoRepository.findAll();
    }

    // 🔹 Listar pagos por usuario
    @GetMapping("/historial/{usuarioId}")
    public List<Pago> listarPagosPorUsuario(@PathVariable Long usuarioId) {
        return pagoRepository.findByUsuarioId(usuarioId);
    }

    // 🔹 Actualizar estado manualmente
    @PutMapping("/estado/{id}")
    public Map<String, String> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Map<String, String> respuesta = new HashMap<>();
        Optional<Pago> pagoOpt = pagoRepository.findById(id);
        if (pagoOpt.isPresent()) {
            Pago pago = pagoOpt.get();
            pago.setEstado(body.get("estado"));
            pagoRepository.save(pago);
            respuesta.put("mensaje", "Estado actualizado correctamente.");
        } else {
            respuesta.put("error", "Pago no encontrado.");
        }
        return respuesta;
    }

    // 🔹 Generar preferencia de pago en Mercado Pago
    @PostMapping("/pagar")
    public ResponseEntity<Map<String, String>> pagar(@RequestBody Pago pago) {
        try {
            String urlPago = mercadoPagoService.crearPreferencia(
                pago.getDescripcion(),
                "Compra en tienda scout",
                pago.getMonto()
            );

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("urlPago", urlPago);
            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear preferencia: " + e.getMessage()));
        }
    }

    // 🔹 Webhook de confirmación de Mercado Pago
    @PostMapping("/confirmacion")
    public ResponseEntity<String> confirmarPago(@RequestBody Map<String, Object> payload) {
        try {
            String status = (String) payload.get("status");
            String externalRef = (String) payload.get("external_reference");

            if (externalRef != null) {
                Long pagoId = Long.valueOf(externalRef);
                Optional<Pago> pagoOpt = pagoRepository.findById(pagoId);
                if (pagoOpt.isPresent()) {
                    Pago pago = pagoOpt.get();
                    pago.setEstado(status);
                    pagoRepository.save(pago);
                }
            }
            return ResponseEntity.ok("Estado actualizado: " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar confirmación: " + e.getMessage());
        }
    }
}
