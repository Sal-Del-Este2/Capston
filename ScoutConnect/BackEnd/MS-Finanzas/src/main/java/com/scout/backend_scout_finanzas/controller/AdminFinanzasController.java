package com.scout.backend_scout_finanzas.controller;

import com.scout.backend_scout_finanzas.dto.CuotaResponse;
import com.scout.backend_scout_finanzas.service.CuotaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/finanzas/admin")
public class AdminFinanzasController {
    private final CuotaService cuotaService;
    public AdminFinanzasController(CuotaService cuotaService) {this.cuotaService = cuotaService;}
    @PutMapping("/cuotas/{cuotaId}/pagar")
    public CuotaResponse marcarCuotaPagada(@PathVariable Long cuotaId) {return cuotaService.marcarComoPagada(cuotaId);}
    @PutMapping("/usuarios/{usuarioId}/cuotas")
    public CuotaResponse fijarCuota(
        @PathVariable Long usuarioId,
        @RequestParam Integer anio,
        @RequestParam Integer mes,
        @RequestParam Double monto
    ) {return cuotaService.fijarCuota(usuarioId, anio, mes, monto);}
}
