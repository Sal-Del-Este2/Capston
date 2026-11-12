package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.ConfiguracionCuotaRequest;
import com.scout.MS_Finanzas.dto.CrearCuotaRequest;
import com.scout.MS_Finanzas.dto.CuotaResponse;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.service.CuotaService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cuotas")
public class CuotaController {
    private final CuotaService cuotaService;
    public CuotaController(CuotaService cuotaService) {this.cuotaService = cuotaService;}
    // consulta las cuotas del usuario
    @GetMapping("/mias")
    public ResponseEntity<List<CuotaResponse>> listarMias(Authentication authentication) {
        Claims claims = (Claims) authentication.getDetails();
        Long usuarioId = claims.get("id", Long.class);
        return ResponseEntity.ok(cuotaService.listarPorUsuario(usuarioId));
    }
    // registra el pago de la cuota
    @PostMapping("/{id}/pagar")
    public ResponseEntity<CuotaResponse> pagar(@PathVariable Long id,
        Authentication authentication
    ) {
        Claims claims = (Claims) authentication.getDetails();
        Long usuarioId = claims.get("id", Long.class);
        return ResponseEntity.ok(cuotaService.pagar(id, usuarioId));
    }
    // muestra las listas de cuotas administrativas
    @GetMapping("/admin")
    public ResponseEntity<Page<CuotaResponse>> listarAdministrador(
        @RequestParam(required = false) Long usuarioId,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) Long grupoId,
        @RequestParam(required = false) Long ramaId,
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {
        return ResponseEntity.ok(cuotaService.listarAdministrador(
            usuarioId,
            estado,
            grupoId,
            ramaId,
            PageRequest.of(pagina, tamanio)
        ));
    }
    // define el monto de la cuota
    @PostMapping("/admin/valor")
    public ResponseEntity<CuotaResponse> definirValorComunidad(@Valid @RequestBody ConfiguracionCuotaRequest request
    ) {return ResponseEntity.status(HttpStatus.CREATED).body(cuotaService.definirValorComunidad(request.getMonto(), request.getVigenteDesde()));}
    // para rear cuotas individuales
    @PostMapping("/admin")
    public ResponseEntity<CuotaResponse> crear(@Valid @RequestBody CrearCuotaRequest request
    ) {return ResponseEntity.status(HttpStatus.CREATED).body(cuotaService.crear(request));}
    // inicia el pago con WebPay
    @PostMapping("/{id}/iniciar-pago")
    public ResponseEntity<WebpayInicioResponse> iniciarPago(@PathVariable Long id,
        Authentication authentication
    ) {
        Claims claims = (Claims) authentication.getDetails();
        Long usuarioId = claims.get("id", Long.class);
        return ResponseEntity.ok(cuotaService.iniciarPagoWebpay(id, usuarioId));
    }
}