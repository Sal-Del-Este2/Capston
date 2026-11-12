package com.scout.MS_Finanzas.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    public JwtAuthenticationFilter(JwtService jwtService) {this.jwtService = jwtService;}
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {filterChain.doFilter(request, response); return;}
        try {
            String token = header.substring(7);
            Claims claims = jwtService.validarToken(token);
            String correo = claims.getSubject();
            String rol = claims.get("rol", String.class);
            Object idClaim = claims.get("id");
            // Validar correo
            if (correo == null || correo.isBlank()) {throw new IllegalArgumentException("El token no contiene un correo válido.");}
            // Validar rol
            if (rol == null || rol.isBlank()) {throw new IllegalArgumentException("El token no contiene un rol válido.");}
            // Validar ID
            if (!(idClaim instanceof Number)) {throw new IllegalArgumentException("El token no contiene un ID de usuario válido.");}
            Long usuarioId = ((Number) idClaim).longValue();
            if (usuarioId <= 0) {throw new IllegalArgumentException("El ID del usuario no es válido.");}
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                correo, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()))
            );
            authentication.setDetails(claims);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {SecurityContextHolder.clearContext();}
        filterChain.doFilter(request, response);
    }
}