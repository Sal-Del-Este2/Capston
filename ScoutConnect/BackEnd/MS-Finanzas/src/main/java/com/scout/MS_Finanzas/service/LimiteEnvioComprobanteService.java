package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.exception.LimiteEnvioComprobanteException;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.stereotype.Service;

@Service
public class LimiteEnvioComprobanteService {
    // Límite de 3 solicitudes cada 5 minutos por usuario
    private static final int MAX_SOLICITUDES = 3;
    private static final long VENTANA_MS = 5 * 60 * 1000L;
    private final ConcurrentHashMap<Long, VentanaSolicitudes> ventanas = new ConcurrentHashMap<>();
    private final AtomicLong contadorOperaciones = new AtomicLong();
    private final Clock clock;
    // Constructor utilizado con Spring Boot
    public LimiteEnvioComprobanteService() {this(Clock.systemUTC());}
    // Constructor utilizado para controlar el tiempo en las pruebas
    public LimiteEnvioComprobanteService(Clock clock) {this.clock = clock;}
    public void validarLimite(Long usuarioId) {
        long ahora = clock.millis();
        AtomicReference<Long> espera = new AtomicReference<>(0L);
        ventanas.compute(usuarioId, (id, ventana) -> {
            // Primera solicitud o ventana de tiempo vencida
            if (ventana == null || ahora - ventana.inicio >= VENTANA_MS) {return new VentanaSolicitudes(ahora, 1);}
            // El usuario ya alcanzó el límite
            if (ventana.solicitudes >= MAX_SOLICITUDES) {
                long restante = VENTANA_MS - (ahora - ventana.inicio);
                long segundos = Math.max(1, (restante + 999) / 1000);
                espera.set(segundos);
                return ventana;
            }
            // Registrar una nueva solicitud permitida
            return new VentanaSolicitudes(ventana.inicio, ventana.solicitudes + 1);
        });
        // Limpieza ocasional de ventanas vencidas
        if (contadorOperaciones.incrementAndGet() % 100 == 0) {ventanas.entrySet().removeIf(entry -> ahora - entry.getValue().inicio >= VENTANA_MS);}
        if (espera.get() > 0) {
            throw new LimiteEnvioComprobanteException("Has alcanzado el límite de envíos de comprobantes. Inténtalo más tarde.", espera.get());
        }
    }
    private record VentanaSolicitudes(long inicio, int solicitudes) {}
}