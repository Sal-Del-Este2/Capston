package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.service.OrdenCompraService;
import com.scout.MS_Finanzas.service.CorreoService;
import com.scout.MS_Finanzas.service.ComprobantePdfService;
import com.scout.MS_Finanzas.service.LimiteEnvioComprobanteService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.scout.MS_Finanzas.security.JwtService;
import com.scout.MS_Finanzas.dto.OrdenCompraResponse;

@WebMvcTest(controllers = OrdenCompraController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(LimiteEnvioComprobanteService.class)
public class OrdenCompraControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private LimiteEnvioComprobanteService limiteEnvioComprobanteService;
    @MockitoBean
    private OrdenCompraService ordenCompraService;
    @MockitoBean
    private CorreoService correoService;
    @MockitoBean
    private ComprobantePdfService comprobantePdfService;
    @MockitoBean
    private JwtService jwtService; // Simular JwtService para evtar error
    @Test
    void debeRetornar429CuandoSeSuperaElLimiteDeEnvios() throws Exception {
        // 1. Identificador del usuario autenticado
        Long usuarioId = 60001L;
        // 2. Simular tres solicitudes
        limiteEnvioComprobanteService.validarLimite(usuarioId);
        limiteEnvioComprobanteService.validarLimite(usuarioId);
        limiteEnvioComprobanteService.validarLimite(usuarioId);
        // 3. Simular los datos de autenticación
        Claims claims = mock(Claims.class);
        when(claims.get("id")).thenReturn(usuarioId);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            "usuario@scout.cl",
            null,
            List.of(new SimpleGrantedAuthority("ROLE_USUARIO"))
        );
        authentication.setDetails(claims);
        // 4. Ejecutar una cuarta solicitud HTTP
        var resultado = mockMvc.perform(post("/api/ordenes/mias/7/comprobante")
            .principal(authentication)
            .contentType("application/json")
            .content("""
                {
                    "correo": "prueba@correo.cl"
                }
            """)
        );
        // 5. Comprobar la respuesta HTTP
        resultado
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(jsonPath("$.error")
            .value("Has alcanzado el límite de envíos de comprobantes. Inténtalo más tarde."))
            .andExpect(jsonPath("$.segundosRestantes").exists());
        // 6. Comprobar que el tiempo de espera sea mayor que cero
        String retryAfter = resultado
            .andReturn()
            .getResponse()
            .getHeader("Retry-After");
        org.junit.jupiter.api.Assertions.assertNotNull(retryAfter);
        org.junit.jupiter.api.Assertions.assertTrue(Long.parseLong(retryAfter) > 0);
        // 7. Comprobar que no se generó PDF ni se envió correo
        verifyNoInteractions(comprobantePdfService, correoService);
    }
    @Test
    void debeEnviarComprobanteCorrectamenteCuandoHayLimiteDisponible() throws Exception {
        // 1. Identificador exclusivo para esta prueba
        Long usuarioId = 60002L; // para que la prueba tenga un contador independiente
        Long ordenId = 7L;
        // 2. Simular la orden de compra
        OrdenCompraResponse orden = mock(OrdenCompraResponse.class);
        when(orden.getId()).thenReturn(ordenId);
        when(ordenCompraService.obtenerPorUsuario(ordenId, usuarioId)).thenReturn(orden);
        // 3. Simular la generación del PDF
        byte[] pdfSimulado = "PDF_SIMULADO".getBytes();
        when(comprobantePdfService.generarComprobante(orden)).thenReturn(pdfSimulado);
        // 4. Simular los datos de autenticación
        Claims claims = mock(Claims.class);
        when(claims.get("id")).thenReturn(usuarioId);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            "usuario@scout.cl",
            null,
            List.of(new SimpleGrantedAuthority("ROLE_USUARIO"))
        );
        authentication.setDetails(claims);
        // 5. Ejecutar la petición HTTP
        mockMvc.perform(post("/api/ordenes/mias/" + ordenId + "/comprobante")
            .principal(authentication)
            .contentType("application/json")
            .content("""
                {"correo": "prueba@correo.cl"}
            """)
        )
        // 6. Validar la respuesta
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.mensaje")
        .value("El comprobante fue enviado correctamente al correo indicado."));
        // 7. Verificar que se consultó la orden del usuario
        verify(ordenCompraService, times(1)).obtenerPorUsuario(ordenId, usuarioId);
        // 8. Verificar que se generó el PDF
        verify(comprobantePdfService, times(1)).generarComprobante(orden);
        // 9. Verificar que se invocó el envío del correo
        verify(correoService, times(1)).enviarComprobante(
            "prueba@correo.cl",
            ordenId,
            pdfSimulado
        );
    }
}