package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.OrdenCompraResponse;
import com.scout.MS_Finanzas.service.OrdenCompraService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController 
@RequestMapping("/api/admin")
public class AdminFinanzasController {
    private final OrdenCompraService ordenCompraService;
    public AdminFinanzasController(OrdenCompraService ordenCompraService) {this.ordenCompraService = ordenCompraService;}
    @GetMapping("/ordenes")
    public ResponseEntity<Page<OrdenCompraResponse>> listarOrdenes(
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {return ResponseEntity.ok(ordenCompraService.listarAdministrador(PageRequest.of(pagina, tamanio)));}
    @PutMapping("/ordenes/{id}/estado")
    public ResponseEntity<OrdenCompraResponse> cambiarEstado(
        @PathVariable Long id,
        @RequestParam String estado
    ) {return ResponseEntity.ok(ordenCompraService.cambiarEstado(id, estado));}
}