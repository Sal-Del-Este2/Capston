package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.exception.LimiteEnvioComprobanteException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

// para manipular la espera
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.Duration;

public class LimiteEnvioComprobanteServiceTest {
    private LimiteEnvioComprobanteService servicio;
    @BeforeEach
    void configurar() {servicio = new LimiteEnvioComprobanteService();}
    @Test
    void debePermitirLasPrimerasTresSolicitudes() {
        Long usuarioId = 6L;
        assertDoesNotThrow(() -> servicio.validarLimite(usuarioId));
        assertDoesNotThrow(() -> servicio.validarLimite(usuarioId));
        assertDoesNotThrow(() -> servicio.validarLimite(usuarioId));
    }
    @Test
    void debeRechazarLaCuartaSolicitud() {
        Long usuarioId = 6L;
        servicio.validarLimite(usuarioId);
        servicio.validarLimite(usuarioId);
        servicio.validarLimite(usuarioId);
        LimiteEnvioComprobanteException excepcion = assertThrows(LimiteEnvioComprobanteException.class, () -> servicio.validarLimite(usuarioId));
        assertTrue(excepcion.getSegundosRestantes() > 0);
        assertTrue(excepcion.getMessage().contains("límite"));
    }
    @Test
    void debeAplicarElLimiteIndependientementePorUsuario() {
        Long usuarioId1 = 6L;
        Long usuarioId2 = 7L;
        servicio.validarLimite(usuarioId1);
        servicio.validarLimite(usuarioId1);
        servicio.validarLimite(usuarioId1);
        assertThrows(LimiteEnvioComprobanteException.class, () -> servicio.validarLimite(usuarioId1));
        assertDoesNotThrow(() -> servicio.validarLimite(usuarioId2));
    }
    // con el tiemp omodificado
    @Test
    void debeRestablecerElLimiteDespuesDeCincoMinutos() {
        Long usuarioId = 8L;
        // 1. Crear un reloj controlado
        MutableClock reloj = new MutableClock(Instant.parse("2026-11-10T12:00:00Z"), ZoneOffset.UTC);
        // 2. Crear una única instancia del servicio
        LimiteEnvioComprobanteService servicioControlado = new LimiteEnvioComprobanteService(reloj);
        // 3. Consumir las tres solicitudes permitidas
        servicioControlado.validarLimite(usuarioId);
        servicioControlado.validarLimite(usuarioId);
        servicioControlado.validarLimite(usuarioId);
        // 4. Comprobar que la cuarta solicitud sea rechazada
        assertThrows(LimiteEnvioComprobanteException.class, () -> servicioControlado.validarLimite(usuarioId));
        // 5. Avanzar exactamente cinco minutos
        reloj.avanzar(Duration.ofMinutes(5));
        // 6. Comprobar que el mismo usuario vuelve a tener tres solicitudes
        assertDoesNotThrow(() -> servicioControlado.validarLimite(usuarioId));
        assertDoesNotThrow(() -> servicioControlado.validarLimite(usuarioId));
        assertDoesNotThrow(() -> servicioControlado.validarLimite(usuarioId));
        // 7. La cuarta solicitud vuelve a ser rechazada
        assertThrows(LimiteEnvioComprobanteException.class, () -> servicioControlado.validarLimite(usuarioId));
    }
}