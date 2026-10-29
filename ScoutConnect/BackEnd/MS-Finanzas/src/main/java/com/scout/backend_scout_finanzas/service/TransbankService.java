package com.scout.backend_scout_finanzas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scout.backend_scout_finanzas.dto.TransbankResponse;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class TransbankService {
    @Value("${transbank.api.key.id}")
    private String tbkApiKeyId;
    @Value("${transbank.api.key.secret}")
    private String tbkApiKeySecret;
    @Value("${transbank.base.url}")
    private String tbkBaseUrl;
    @Value("${transbank.return.url}")
    private String tbkReturnUrl;
    public TransbankResponse crearPagoWebpay(Double amount) throws Exception {
        System.out.println("******** WEBPAY ACTIVO ********");
        String buyOrder = "SCOUT-" + UUID.randomUUID().toString().substring(0, 8);
        String sessionId = UUID.randomUUID().toString();
        String jsonBody =
                """
                {
                  "buy_order":"%s",
                  "session_id":"%s",
                  "amount":%d,
                  "return_url":"%s"
                }
                """
                .formatted(buyOrder, sessionId, amount.intValue(), tbkReturnUrl);
        HttpPost post = new HttpPost(tbkBaseUrl + "/rswebpaytransaction/api/webpay/v1.2/transactions");
        post.setHeader("Tbk-Api-Key-Id", tbkApiKeyId);
        post.setHeader("Tbk-Api-Key-Secret", tbkApiKeySecret);
        post.setHeader("Content-Type", "application/json");
        post.setEntity(new StringEntity(jsonBody));
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String responseBody = client.execute(post, response -> EntityUtils.toString(response.getEntity()));
            System.out.println("======== WEBPAY CREATE ========");
            System.out.println(responseBody);
            System.out.println("===============================");
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(responseBody);
            TransbankResponse response = new TransbankResponse();
            response.setToken(json.get("token").asText());
            response.setBuyOrder(buyOrder);
            response.setUrlPago(json.get("url").asText() + "?token_ws=" + json.get("token").asText());
            return response;
        }
    }
}