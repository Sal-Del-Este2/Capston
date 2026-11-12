package com.scout.MS_Finanzas.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class TransbankConfig {
    private final String environment;
    private final String commerceCode;
    private final String apiKey;
    private final String returnUrl;
    public TransbankConfig(
        @Value("${transbank.environment:integracion}") String environment,
        @Value("${transbank.commerce-code}") String commerceCode,
        @Value("${transbank.api-key}") String apiKey,
        @Value("${transbank.return-url}") String returnUrl
    ) {
        this.environment = environment;
        this.commerceCode = commerceCode;
        this.apiKey = apiKey;
        this.returnUrl = returnUrl;
    }
}