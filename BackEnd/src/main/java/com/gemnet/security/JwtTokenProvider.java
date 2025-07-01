package com.gemnet.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret:mySecretKey}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}") // 24 hours in milliseconds
    private long jwtExpirationMs;
    
    private SecretKey secretKey;
    
    @PostConstruct
    public void init() {
        // Create a secure key
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * Generate JWT token with user identifier (email or username)
     */
    public String generateToken(String identifier) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        System.out.println("🔐 Generating JWT token for identifier: " + identifier);
        
        return Jwts.builder()
                .subject(identifier)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }
    
    /**
     * Extract user identifier (email or username) from JWT token
     */
    public String getIdentifierFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        
        String identifier = claims.getSubject();
        System.out.println("🔓 Extracted identifier from token: " + identifier);
        return identifier;
    }
    
    /**
     * @deprecated Use getIdentifierFromToken() instead
     * This method is kept for backward compatibility with existing code
     */
    @Deprecated
    public String getEmailFromToken(String token) {
        return getIdentifierFromToken(token);
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            return claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }
    
    /**
     * Get expiration date from token
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        
        return claims.getExpiration();
    }
}
