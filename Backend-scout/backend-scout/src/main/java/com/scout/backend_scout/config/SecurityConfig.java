package com.scout.backend_scout.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactiva CSRF para peticiones desde el frontend
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/usuarios/**").permitAll() // Permite acceso libre a tus endpoints
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
