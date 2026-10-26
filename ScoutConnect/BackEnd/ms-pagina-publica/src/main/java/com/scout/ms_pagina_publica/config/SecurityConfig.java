package com.scout.ms_pagina_publica.config;

import com.scout.ms_pagina_publica.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpStatus;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {this.jwtAuthenticationFilter = jwtAuthenticationFilter;}
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/catalogos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/contactos-reino").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/contactos-reino/reino/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/informacion-institucional").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/politicas/publicadas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ubicaciones/activas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/politicas/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/ubicaciones/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/contactos-reino/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/informacion-institucional/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/politicas/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/ubicaciones/**").hasRole("ADMINISTRADOR")
                .anyRequest().authenticated()
            ).addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(List.of("http://127.0.0.1:5500","http://localhost:5500"));
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("*"));
        configuracion.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource origen = new UrlBasedCorsConfigurationSource();
        origen.registerCorsConfiguration("/**", configuracion);
        return origen;
    }
}