package com.scout.MS_Finanzas.service;

import cl.transbank.webpay.webpayplus.WebpayPlus;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCommitResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCreateResponse;
import com.scout.MS_Finanzas.config.TransbankConfig;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.dto.WebpayConfirmacionResponse;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.EstadoPago;
import com.scout.MS_Finanzas.model.Pago;
import com.scout.MS_Finanzas.model.TransaccionWebpay;
import com.scout.MS_Finanzas.repository.EstadoPagoRepository;
import com.scout.MS_Finanzas.repository.TransaccionWebpayRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class WebpayService {
    private static final Logger log = LoggerFactory.getLogger(WebpayService.class);
    private final TransaccionWebpayRepository transaccionRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final PagoDestinoService pagoDestinoService;
    private final TransbankConfig config;
    public WebpayService(
        TransaccionWebpayRepository transaccionRepository,
        EstadoPagoRepository estadoPagoRepository,
        PagoDestinoService pagoDestinoService,
        TransbankConfig config
    ) {
        this.transaccionRepository = transaccionRepository;
        this.estadoPagoRepository = estadoPagoRepository;
        this.pagoDestinoService = pagoDestinoService;
        this.config = config;
    }
    public WebpayInicioResponse iniciarPago(Pago pago, String buyOrder, String sessionId) {
        try {
            WebpayPlus.Transaction transaccion = WebpayPlus.Transaction.buildForIntegration(config.getCommerceCode(), config.getApiKey());
            WebpayPlusTransactionCreateResponse respuesta = transaccion.create(buyOrder, sessionId, pago.getMonto().longValueExact(), config.getReturnUrl());
            TransaccionWebpay registro = new TransaccionWebpay();
            registro.setPago(pago);
            registro.setTokenWs(respuesta.getToken());
            registro.setUrlWebpay(respuesta.getUrl());
            registro.setBuyOrder(buyOrder);
            registro.setSessionId(sessionId);
            registro.setMonto(pago.getMonto());
            registro.setFechaCreacion(LocalDateTime.now());
            registro.setFechaActualizacion(LocalDateTime.now());
            registro.setRespuestaCompleta("{\"token\":\"" + respuesta.getToken() + "\",\"url\":\"" + respuesta.getUrl() + "\"}");
            transaccionRepository.save(registro);
            WebpayInicioResponse response = new WebpayInicioResponse();
            response.setToken(respuesta.getToken());
            response.setUrl(respuesta.getUrl());
            if (buyOrder.startsWith("ORDEN-")) {response.setOrdenId(Long.parseLong(buyOrder.replace("ORDEN-", "")));}
            return response;
        } catch (Exception e) {throw new ValidacionNegocioException("No fue posible iniciar el pago con Transbank.");}
    }
    public WebpayConfirmacionResponse confirmarPago(String tokenWs) {
        if (tokenWs == null || tokenWs.isBlank()) {throw new ValidacionNegocioException("El token de Webpay es obligatorio.");}
        TransaccionWebpay registro = transaccionRepository.findByTokenWsConBloqueo(tokenWs).orElseThrow(() -> new ValidacionNegocioException("Transacción no encontrada."));
        String estadoActual = registro.getEstadoWebpay();
        // Evitar repetir la confirmación.
        if ("APROBADA".equalsIgnoreCase(estadoActual)) {return construirResultado(registro, true);}
        if ("RECHAZADA".equalsIgnoreCase(estadoActual)) {return construirResultado(registro, false);}
        try {
            WebpayPlus.Transaction transaccion = WebpayPlus.Transaction.buildForIntegration(config.getCommerceCode(), config.getApiKey());
            WebpayPlusTransactionCommitResponse respuesta = transaccion.commit(tokenWs);
            int codigoRespuesta = respuesta.getResponseCode();
            boolean aprobada = codigoRespuesta == 0;
            LocalDateTime ahora = LocalDateTime.now();
            registro.setEstadoWebpay(aprobada ? "APROBADA" : "RECHAZADA");
            registro.setResponseCode(codigoRespuesta);
            registro.setAuthorizationCode(respuesta.getAuthorizationCode());
            registro.setPaymentTypeCode(respuesta.getPaymentTypeCode());
            registro.setVci(respuesta.getVci());
            registro.setFechaActualizacion(ahora);
            registro.setRespuestaCompleta("{\"responseCode\":" + codigoRespuesta + ",\"authorizationCode\":\"" + respuesta.getAuthorizationCode() + "\"}");
            Pago pago = registro.getPago();
            EstadoPago estadoPago = estadoPagoRepository
                .findByNombre(aprobada ? "PAGADO" : "RECHAZADO")
                .orElseThrow(() -> new ValidacionNegocioException("No se encontró el estado del pago."));
            pago.setEstado(estadoPago);
            pago.setFechaActualizacion(ahora);
            if (aprobada) {pago.setFechaPago(ahora);}
            transaccionRepository.save(registro);
            if (aprobada) {
                try {pagoDestinoService.confirmarDestino(pago.getId());
                } catch (Exception e) {
                    log.warn("Pago {} aprobado, pero no se pudo procesar su destino: {}", pago.getId(), e.getMessage()); // El pago permanece aprobado y la orden pendiente.
                }
            }
            return construirResultado(registro, aprobada);
        } catch (ValidacionNegocioException e) {throw e;
        } catch (Exception e) {log.error("Error al confirmar transacción Webpay.", e);
            throw new ValidacionNegocioException("No fue posible confirmar el pago con Transbank.");
        }
    }
    private WebpayConfirmacionResponse construirResultado(TransaccionWebpay registro, boolean aprobado) {
        Long ordenId = null;
        String buyOrder = registro.getBuyOrder();
        if (buyOrder != null && buyOrder.startsWith("ORDEN-")) {ordenId = Long.parseLong(buyOrder.replace("ORDEN-", ""));}
        return new WebpayConfirmacionResponse(ordenId, aprobado);
    }
}