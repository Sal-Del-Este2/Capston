package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.CrearOrdenRequest;
import com.scout.MS_Finanzas.dto.OrdenCompraResponse;
import com.scout.MS_Finanzas.dto.WebpayInicioResponse;
import com.scout.MS_Finanzas.dto.EnviarComprobanteRequest;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.exception.ComprobantePdfException;
import com.scout.MS_Finanzas.exception.EnvioCorreoException;
import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.service.OrdenCompraService;
import io.jsonwebtoken.Claims;
import com.scout.MS_Finanzas.service.CorreoService;
import com.scout.MS_Finanzas.service.ComprobantePdfService;
import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.*;
import com.scout.MS_Finanzas.service.LimiteEnvioComprobanteService;
import com.scout.MS_Finanzas.exception.LimiteEnvioComprobanteException;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenCompraController {
    private static final Logger logger = LoggerFactory.getLogger(OrdenCompraController.class);
    private final OrdenCompraService ordenCompraService;
    private final CorreoService correoService;
    private final ComprobantePdfService comprobantePdfService;
    private final LimiteEnvioComprobanteService limiteEnvioComprobanteService;
    public OrdenCompraController(
        OrdenCompraService ordenCompraService,
        CorreoService correoService,
        ComprobantePdfService comprobantePdfService,
        LimiteEnvioComprobanteService limiteEnvioComprobanteService
    ) {
        this.ordenCompraService = ordenCompraService;
        this.correoService = correoService;
        this.comprobantePdfService = comprobantePdfService;
        this.limiteEnvioComprobanteService = limiteEnvioComprobanteService;
    }
    // Crear una orden de compra e iniciar el pago
    @PostMapping
    public ResponseEntity<WebpayInicioResponse> crear(@Valid @RequestBody CrearOrdenRequest request, Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ordenCompraService.crear(usuarioId, request));
    }
    // Listar las órdenes del usuario autenticado
     @GetMapping("/mias")
    public ResponseEntity<Page<OrdenCompraResponse>> listarMias(Authentication authentication,
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "10") int tamanio
    ) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(ordenCompraService.listarPorUsuario(usuarioId, PageRequest.of(pagina, tamanio)));
    }
    // Consultar una orden específica del usuario autenticado
    @GetMapping("/mias/{id}")
    public ResponseEntity<OrdenCompraResponse> obtenerMiOrden(@PathVariable Long id, Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(ordenCompraService.obtenerPorUsuario(id, usuarioId));
    }
    // Listar todas las órdenes para administración
    @GetMapping("/admin")
    public ResponseEntity<Page<OrdenCompraResponse>> listarAdministrador(@RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "10") int tamanio) {
        return ResponseEntity.ok(ordenCompraService.listarAdministrador(PageRequest.of(pagina, tamanio)));
    }
    // Cambiar estado de una orden desde administración
    @PutMapping("/admin/{id}/estado")
    public ResponseEntity<OrdenCompraResponse> cambiarEstadoAdministrador(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(ordenCompraService.cambiarEstado(id, estado));
    }
    // envio del comprobante por correo
    @PostMapping("/mias/{id}/comprobante")
    public ResponseEntity<Map<String, String>> enviarComprobante(@PathVariable Long id, @Valid @RequestBody EnviarComprobanteRequest request,
        Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        // Verificar que la orden pertenezca al usuario autenticado
        OrdenCompraResponse orden = ordenCompraService.obtenerPorUsuario(id, usuarioId);
        // Controlar el límite de solicitudes del usuario
        limiteEnvioComprobanteService.validarLimite(usuarioId);
        // Generar el PDF con los datos de la orden
        byte[] pdf = comprobantePdfService.generarComprobante(orden);
        // Enviar el documento al correo solicitado
        correoService.enviarComprobante(request.getCorreo().trim(), orden.getId(), pdf);
        return ResponseEntity.ok(Map.of("mensaje", "El comprobante fue enviado correctamente al correo indicado."));
    }
    // validar el id del usuario que inicio sesión
    private Long obtenerUsuarioId(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getDetails() instanceof io.jsonwebtoken.Claims claims)) {
            throw new ValidacionNegocioException("No fue posible identificar al usuario autenticado.");
        }
        Object idClaim = claims.get("id");
        if (!(idClaim instanceof Number)) {throw new ValidacionNegocioException("El token no contiene un ID de usuario válido.");}
        Long usuarioId = ((Number) idClaim).longValue();
        if (usuarioId <= 0) {throw new ValidacionNegocioException("El ID del usuario no es válido.");}
        return usuarioId;
    }
    // Límite de solicitudes de envío de comprobantes
    @ExceptionHandler(LimiteEnvioComprobanteException.class)
    public ResponseEntity<Map<String, String>> manejarLimiteEnvios(LimiteEnvioComprobanteException e) {
        logger.warn("Límite de envíos alcanzado: {}", e.getMessage());
        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", String.valueOf(e.getSegundosRestantes()))
            .body(Map.of("error", e.getMessage(), "segundosRestantes", String.valueOf(e.getSegundosRestantes())));
    }
    // Error al generar el comprobante PDF
    @ExceptionHandler(ComprobantePdfException.class)
    public ResponseEntity<Map<String, String>> manejarErrorPdf(ComprobantePdfException e) {
        logger.error("No fue posible generar el comprobante PDF.", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "No fue posible generar el comprobante PDF. Inténtalo nuevamente."));
    }
    // Error al enviar el comprobante por correo
    @ExceptionHandler(EnvioCorreoException.class)
    public ResponseEntity<Map<String, String>> manejarErrorCorreo(EnvioCorreoException e) {
        logger.error("No fue posible enviar el comprobante por correo.", e);
        return ResponseEntity
            .status(HttpStatus.BAD_GATEWAY)
            .body(Map.of("error", "No fue posible enviar el correo en este momento. Inténtalo más tarde."));
    }
    // Errores de validación de los datos recibidos
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarErrorValidacion(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .findFirst()
            .map(error -> error.getDefaultMessage())
            .orElse("Los datos enviados no son válidos.");
        logger.warn("Error de validación: {}", mensaje);
        return ResponseEntity
            .badRequest()
            .body(Map.of("error", mensaje));
    }
    // JSON incorrecto o cuerpo de solicitud inválido
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> manejarErrorSolicitud(HttpMessageNotReadableException e) {
        logger.warn("El cuerpo de la solicitud no es válido.", e);
        return ResponseEntity
            .badRequest()
            .body(Map.of("error", "El cuerpo de la solicitud no es válido."));
    }
    // Parámetros de ruta con formato incorrecto
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> manejarErrorParametro(MethodArgumentTypeMismatchException e) {
        logger.warn("Parámetro inválido: {}", e.getName());
        return ResponseEntity
            .badRequest()
            .body(Map.of("error", "El identificador o parámetro enviado no tiene un formato válido."));
    }
    // Recurso u orden no encontrada
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> manejarRecursoNoEncontrado(RecursoNoEncontradoException e) {
        logger.warn("Recurso no encontrado: {}", e.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", e.getMessage()));
    }
    // Errores inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarErrorGeneral(Exception e) {
        logger.error("Error inesperado en OrdenCompraController.", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Ocurrió un error inesperado al procesar la solicitud."));
    }
}