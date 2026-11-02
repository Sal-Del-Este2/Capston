package com.scout.backend_scout_finanzas.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioAutenticado {
    public Long obtenerUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Long usuarioId)) {throw new IllegalStateException("Usuario no autenticado.");}
        return usuarioId;
    }
    public boolean esAdministrador() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));
    }
    public Claims obtenerClaims() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getDetails() instanceof Claims claims)) {throw new IllegalStateException("Usuario no autenticado.");}
        return claims;
    }
}