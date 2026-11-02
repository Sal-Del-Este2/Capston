package com.scout.backend_scout_finanzas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;

@Service
public class JwtService {
    @Value("${jwt.secreto}")
    private String secreto;
    public Claims validarToken(String token) {return Jwts.parser()
        .verifyWith(obtenerClave())
        .build()
        .parseSignedClaims(token)
        .getPayload();
    }
    public Long obtenerUsuarioId(Claims claims) {Object usuarioId = claims.get("usuarioId"); return usuarioId == null ? null : Long.valueOf(usuarioId.toString());}
    public String obtenerRol(Claims claims) {return claims.get("rol", String.class);}
    private SecretKey obtenerClave() {return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secreto));}
}