package com.busbooker.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${app.jwtSecret:your-secret-key-for-jwt-token-generation-should-be-long-enough}")
    private String jwtSecret;
    
    @Value("${app.jwtAccessExpirationMs:3600000}") // 1 hour
    private int jwtAccessExpirationMs;
    
    @Value("${app.jwtRefreshExpirationMs:86400000}") // 24 hours
    private int jwtRefreshExpirationMs;
    
    public String generateAccessToken(String userId, String role) {
        return generateToken(userId, role, jwtAccessExpirationMs);
    }
    
    public String generateRefreshToken(String userId, String role) {
        return generateToken(userId, role, jwtRefreshExpirationMs);
    }
    
    private String generateToken(String userId, String role, int expirationTime) {
        try {
            return Jwts.builder()
                    .setSubject(userId)
                    .claim("role", role)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                    .compact();
        } catch (Exception ex) {
            log.error("Error generating JWT token", ex);
            return null;
        }
    }
    
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception ex) {
            log.error("Error getting userId from token", ex);
            return null;
        }
    }
    
    public String getRoleFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return (String) claims.get("role");
        } catch (Exception ex) {
            log.error("Error getting role from token", ex);
            return null;
        }
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            log.error("Token validation failed", ex);
            return false;
        }
    }
}
