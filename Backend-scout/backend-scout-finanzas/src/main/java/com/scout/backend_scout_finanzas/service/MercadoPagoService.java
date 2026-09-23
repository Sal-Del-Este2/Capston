package com.scout.backend_scout_finanzas.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.resources.preference.Preference;

import org.springframework.beans.factory.annotation.Value;   // Inyectar el token
import org.springframework.stereotype.Service;           // Marcar la clase como servicio
import java.math.BigDecimal; // unitPrice
import java.util.Arrays;     // Arrays.asList
import java.util.List;

@Service
public class MercadoPagoService {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    public String crearPreferencia(String titulo, String descripcion, Double monto) throws Exception {
        // Inicializa Mercado Pago con el token
        MercadoPagoConfig.setAccessToken(accessToken);

        // Item de la preferencia
        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title(titulo)
                .description(descripcion)
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(monto)) // Conversión correcta
                .currencyId("CLP")
                .build();

        // Construcción de la preferencia
        List<PreferenceItemRequest> items = Arrays.asList(item);
        PreferenceRequest request = PreferenceRequest.builder()
                .items(items)
                .build();

        // Cliente de Mercado Pago
        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(request);

        // Devuelve la URL de pago sandbox
        return preference.getInitPoint();
    }
}
