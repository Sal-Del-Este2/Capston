package com.scout.backend_scout.security;

import com.scout.backend_scout.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    @Value("${jwt.secreto}")
    private String secreto;
    @Value("${jwt.expiracion-minutos}")
    private long expiracionMinutos;
    private SecretKey obtenerClave() {return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secreto));}
    public String generarToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", usuario.getId());
        claims.put("rol", usuario.getRol() != null ? usuario.getRol().getNombre() : "USUARIO");
        claims.put("nombre", usuario.getNombre());
        claims.put("debeCambiarPassword", Boolean.TRUE.equals(usuario.getDebeCambiarPassword()));
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expiracionMinutos * 60 * 1000);
        return Jwts.builder()
                .claims(claims)
                .subject(usuario.getCorreo())
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(obtenerClave())
                .compact();
    }
    public Claims validarToken(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
