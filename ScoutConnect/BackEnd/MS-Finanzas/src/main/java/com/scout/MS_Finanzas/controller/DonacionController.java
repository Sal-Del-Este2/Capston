package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.CrearDonacionRequest;
import com.scout.MS_Finanzas.dto.DonacionResponse;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.service.DonacionService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionController {
    private final DonacionService donacionService;
    public DonacionController(DonacionService donacionService) {this.donacionService = donacionService;}
    @PostMapping
    public ResponseEntity<WebpayInicioResponse> crear(
        @Valid @RequestBody CrearDonacionRequest request,
        Authentication authentication
    ) {
        Long usuarioId = null;
        if (authentication != null && authentication.getDetails() instanceof Claims claims) {usuarioId = claims.get("id", Long.class);}
        return ResponseEntity.status(HttpStatus.CREATED).body(donacionService.crear(request, usuarioId));
    }
    @GetMapping("/admin")
    public ResponseEntity<Page<DonacionResponse>> listarAdministrador(
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {return ResponseEntity.ok(donacionService.listarAdministrador(PageRequest.of(pagina, tamanio)));}
}