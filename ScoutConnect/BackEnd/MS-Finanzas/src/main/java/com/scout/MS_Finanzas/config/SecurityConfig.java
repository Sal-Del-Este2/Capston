package com.scout.MS_Finanzas.config;

import com.scout.MS_Finanzas.security.JwtAuthenticationFilter;
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/webpay/retorno").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/grupos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ramas/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/donaciones").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ordenes").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/ordenes/mias").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/ordenes/mias/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/ordenes/mias/*/comprobante").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/cuotas/mias").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/cuotas/*/pagar").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/cuotas/*/iniciar-pago").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/productos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/cuotas/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/donaciones/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/catalogos/**").hasRole("ADMINISTRADOR")
                .anyRequest().denyAll()
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
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuracion = new CorsConfiguration();
        // Orígenes permitidos para el frontend local
        configuracion.setAllowedOrigins(List.of("http://localhost:5500", "http://127.0.0.1:5500"));
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuracion.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuracion.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", configuracion);
        return fuente;
    }
}