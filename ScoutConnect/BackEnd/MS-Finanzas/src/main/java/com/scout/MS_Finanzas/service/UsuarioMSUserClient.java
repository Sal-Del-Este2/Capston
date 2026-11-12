package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.UsuarioObligadoDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import java.util.List;

@Service
public class UsuarioMSUserClient {
    private final RestClient restClient;
    public UsuarioMSUserClient(RestClient msUserRestClient) {this.restClient = msUserRestClient;}
    public List<UsuarioObligadoDTO> obtenerUsuariosObligados(String authorization) {
        if (authorization == null || authorization.isBlank()) {throw new IllegalArgumentException("El token de autorización es obligatorio.");}
        try {List<UsuarioObligadoDTO> usuarios = restClient.get()
            .uri("/usuarios/cuotas/obligados")
            .header(HttpHeaders.AUTHORIZATION, authorization)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});
            if (usuarios == null) {throw new IllegalStateException("MS-User devolvió una respuesta vacía.");}
            return usuarios;
        } catch (RestClientResponseException e) {throw new IllegalStateException("Error al consultar MS-User. HTTP: " + e.getStatusCode().value(), e);}
    }
}