package com.scout.backend_scout.config;

import com.scout.backend_scout.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {this.jwtAuthenticationFilter = jwtAuthenticationFilter;}
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Públicos
            .requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll()
            .requestMatchers(HttpMethod.POST, "/usuarios/olvidar-password").permitAll()
            // Catálogos públicos
            .requestMatchers("/comunas/**", "/regiones/**", "/roles/**", "/estados/**", "/grupos/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/usuarios/destinatarios").authenticated()
            // Solo administrador
            .requestMatchers(HttpMethod.GET, "/usuarios/listar").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.POST, "/usuarios/registro").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.PUT, "/usuarios/editar/**").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.PUT, "/usuarios/estado/**").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.PUT, "/usuarios/password/**").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.DELETE, "/usuarios/**").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.GET, "/usuarios/rol/**").hasRole("ADMINISTRADOR")
            .requestMatchers(HttpMethod.GET, "/usuarios/{id:\\d+}").hasRole("ADMINISTRADOR")
            .requestMatchers("/mensajes/admin/**").hasRole("ADMINISTRADOR")
            // Todo lo demás requiere JWT
            .anyRequest().authenticated()
            )
        .exceptionHandling(excepciones -> excepciones
        .authenticationEntryPoint((request, response, excepcion) -> {
        response.setStatus(401);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"No autenticado.\"}");
        })
        .accessDeniedHandler((request, response, excepcion) -> {
        response.setStatus(403);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"No tienes permisos para realizar esta acción.\"}");
        })
        ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501"
        ));
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("*"));
        configuracion.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource origen = new UrlBasedCorsConfigurationSource();
        origen.registerCorsConfiguration("/**", configuracion);
        return origen;
    }
}
