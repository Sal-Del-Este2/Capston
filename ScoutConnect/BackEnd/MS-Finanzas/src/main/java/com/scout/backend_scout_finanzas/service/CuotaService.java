package com.scout.backend_scout_finanzas.service;

import com.scout.backend_scout_finanzas.dto.CuotaResponse;
import com.scout.backend_scout_finanzas.dto.ResumenCuotasResponse;
import com.scout.backend_scout_finanzas.model.Cuota;
import com.scout.backend_scout_finanzas.model.EstadoCuota;
import com.scout.backend_scout_finanzas.repository.CuotaRepository;
import com.scout.backend_scout_finanzas.repository.EstadoCuotaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CuotaService {
    private final CuotaRepository cuotaRepository;
    private final EstadoCuotaRepository estadoCuotaRepository;
    public CuotaService(CuotaRepository cuotaRepository, EstadoCuotaRepository estadoCuotaRepository) {
        this.cuotaRepository = cuotaRepository;
        this.estadoCuotaRepository = estadoCuotaRepository;
    }
    @Transactional(readOnly = true)
    public List<CuotaResponse> listarCuotasDelUsuario(Long usuarioId) {
        return cuotaRepository.findByUsuarioIdOrderByAnioDescMesDesc(usuarioId).stream().map(this::convertir).toList();
    }
    @Transactional(readOnly = true)
    public ResumenCuotasResponse obtenerResumen(Long usuarioId) {
        List<Cuota> cuotas = cuotaRepository.findByUsuarioIdOrderByAnioDescMesDesc(usuarioId);
        ResumenCuotasResponse resumen = new ResumenCuotasResponse();
        resumen.setCuotasPagadas(cuotas.stream().filter(c -> "PAGADA".equals(c.getEstado().getNombre())).count());
        resumen.setCuotasPendientes(cuotas.stream().filter(c -> "PENDIENTE".equals(c.getEstado().getNombre())).count());
        resumen.setMontoAdeudado(cuotas.stream().filter(c -> "PENDIENTE".equals(c.getEstado().getNombre())).mapToDouble(Cuota::getMonto).sum());
        return resumen;
    }
    public CuotaResponse pagarCuota(Long usuarioId, Long cuotaId) {
        Cuota cuota = buscarCuota(cuotaId);
        if (!cuota.getUsuarioId().equals(usuarioId)) {throw new IllegalArgumentException("No puedes pagar una cuota de otro usuario.");}
        if (!"PENDIENTE".equals(cuota.getEstado().getNombre())) {throw new IllegalArgumentException("La cuota ya está pagada.");}
        cuota.setEstado(buscarEstado("PAGADA"));
        return convertir(cuota);
    }
    public CuotaResponse marcarComoPagada(Long cuotaId) {
        Cuota cuota = buscarCuota(cuotaId);
        cuota.setEstado(buscarEstado("PAGADA"));
        return convertir(cuota);
    }
    public CuotaResponse fijarCuota(Long usuarioId, Integer anio, Integer mes, Double monto) {
        if (monto == null || monto < 0) {throw new IllegalArgumentException("El monto debe ser mayor o igual a cero.");}
        Cuota cuota = cuotaRepository.findByUsuarioIdAndAnioAndMes(usuarioId, anio, mes).orElseGet(Cuota::new);
        cuota.setUsuarioId(usuarioId);
        cuota.setAnio(anio);
        cuota.setMes(mes);
        cuota.setMonto(monto);
        cuota.setEstado(buscarEstado("PENDIENTE"));
        return convertir(cuotaRepository.save(cuota));
    }
    private Cuota buscarCuota(Long cuotaId) {return cuotaRepository.findById(cuotaId).orElseThrow(() -> new IllegalArgumentException("No existe la cuota indicada."));}
    private EstadoCuota buscarEstado(String nombre) {
        return estadoCuotaRepository.findByNombre(nombre).orElseThrow(() -> new IllegalArgumentException("Estado de cuota no válido."));
    }
    private CuotaResponse convertir(Cuota cuota) {
        CuotaResponse response = new CuotaResponse();
        response.setId(cuota.getId());
        response.setAnio(cuota.getAnio());
        response.setMes(cuota.getMes());
        response.setMonto(cuota.getMonto());
        response.setFechaVencimiento(cuota.getFechaVencimiento());
        response.setEstado(cuota.getEstado().getNombre());
        response.setPuedePagar("PENDIENTE".equals(cuota.getEstado().getNombre()));
        return response;
    }
}