package com.scout.MS_Finanzas.controller;

import com.scout.MS_Finanzas.dto.WebpayConfirmacionResponse;
import com.scout.MS_Finanzas.service.WebpayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;

@RestController
@RequestMapping("/api/webpay")
public class WebpayController {
    private static final String URL_TIENDA = "http://127.0.0.1:5500/FrontEnd/html/tienda.html";
    private final WebpayService webpayService;
    public WebpayController(WebpayService webpayService) {this.webpayService = webpayService;}
    @GetMapping("/retorno")
    public ResponseEntity<Void> retornoGet(
        @RequestParam(value = "token_ws", required = false) String tokenWs,
        @RequestParam(value = "TBK_TOKEN", required = false) String tokenCancelacion,
        @RequestParam(value = "TBK_ORDEN_COMPRA", required = false) String ordenCompra
    ) {return procesarRetorno(tokenWs, tokenCancelacion, ordenCompra);}
    @PostMapping("/retorno")
    public ResponseEntity<Void> retornoPost(
        @RequestParam(value = "token_ws", required = false) String tokenWs,
        @RequestParam(value = "TBK_TOKEN", required = false) String tokenCancelacion,
        @RequestParam(value = "TBK_ORDEN_COMPRA", required = false) String ordenCompra
    ) {return procesarRetorno(tokenWs, tokenCancelacion, ordenCompra);}
    private ResponseEntity<Void> procesarRetorno(String tokenWs, String tokenCancelacion, String ordenCompra) {
        try {
            if (tokenCancelacion != null && !tokenCancelacion.isBlank()) {return redirigir("cancelado", obtenerOrdenId(ordenCompra));}
            if (tokenWs == null || tokenWs.isBlank()) {return redirigir("error", obtenerOrdenId(ordenCompra));}
            WebpayConfirmacionResponse resultado = webpayService.confirmarPago(tokenWs);
            return redirigir(resultado.isAprobado() ? "aprobado" : "rechazado", resultado.getOrdenId());
        } catch (Exception e) {return redirigir("error", obtenerOrdenId(ordenCompra));}
    }
    private Long obtenerOrdenId(String buyOrder) {
        if (buyOrder == null || !buyOrder.startsWith("ORDEN-")) {return null;}
        try {return Long.parseLong(buyOrder.replace("ORDEN-", ""));
        } catch (NumberFormatException e) {return null;}
    }
    private ResponseEntity<Void> redirigir(String resultado, Long ordenId) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(URL_TIENDA).queryParam("pago", resultado);
        if (ordenId != null) {builder.queryParam("ordenId", ordenId);}
        URI destino = builder.build().encode().toUri();
        return ResponseEntity.status(HttpStatus.FOUND).location(destino).build();
    }
}