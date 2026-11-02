package com.scout.backend_scout_finanzas.controller;

import com.scout.backend_scout_finanzas.dto.CuotaResponse;
import com.scout.backend_scout_finanzas.dto.ResumenCuotasResponse;
import com.scout.backend_scout_finanzas.security.UsuarioAutenticado;
import com.scout.backend_scout_finanzas.service.CuotaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finanzas/cuotas")
public class CuotaController {
    private final CuotaService cuotaService;
    private final UsuarioAutenticado usuarioAutenticado;
    public CuotaController(CuotaService cuotaService, UsuarioAutenticado usuarioAutenticado) {
        this.cuotaService = cuotaService;
        this.usuarioAutenticado = usuarioAutenticado;
    }
    @GetMapping("/mias")
    public List<CuotaResponse> listarMisCuotas() {return cuotaService.listarCuotasDelUsuario(usuarioAutenticado.obtenerUsuarioId());}
    @GetMapping("/mias/resumen")
    public ResumenCuotasResponse obtenerResumen() {return cuotaService.obtenerResumen(usuarioAutenticado.obtenerUsuarioId());}
    @PutMapping("/{cuotaId}/pagar")
    public CuotaResponse pagar(@PathVariable Long cuotaId) {return cuotaService.pagarCuota(usuarioAutenticado.obtenerUsuarioId(), cuotaId);}
}
