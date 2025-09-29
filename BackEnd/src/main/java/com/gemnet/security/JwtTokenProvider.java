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
     * Generate JWT token with user identifier and role for enhanced security
     */
    public String generateToken(String identifier, String role, String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        System.out.println("🔐 Generating JWT token for identifier: " + identifier + ", role: " + role);
        
        return Jwts.builder()
                .subject(identifier)
                .claim("role", role)
                .claim("userId", userId)
                .claim("iat", now.getTime() / 1000) // Issued at timestamp
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }
    
    /**
     * Generate JWT token with user identifier (backward compatibility)
     */
    public String generateToken(String identifier) {
        return generateToken(identifier, "buyer", null); // Default role
    }
    
    /**
     * Extract user identifier (email or username) from JWT token
     */
    public String getIdentifierFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        String identifier = claims.getSubject();
        System.out.println("🔓 Extracted identifier from token: " + identifier);
        return identifier;
    }
    
    /**
     * Extract user role from JWT token
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }
    
    /**
     * Extract user ID from JWT token
     */
    public String getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("userId", String.class);
    }
    
    /**
     * Extract claims from JWT token with validation
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
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
     * Validate JWT token with enhanced security checks
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            
            // Additional security validations
            Date now = new Date();
            
            // Check if token is expired
            if (claims.getExpiration().before(now)) {
                System.out.println("⚠️ Token validation failed: Token expired");
                return false;
            }
            
            // Check if token was issued in the future (clock skew attack)
            if (claims.getIssuedAt().after(new Date(now.getTime() + 60000))) { // 1 minute tolerance
                System.out.println("⚠️ Token validation failed: Token issued in the future");
                return false;
            }
            
            // Validate required claims exist
            if (claims.getSubject() == null || claims.getSubject().trim().isEmpty()) {
                System.out.println("⚠️ Token validation failed: Missing subject");
                return false;
            }
            
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("⚠️ Token validation failed: " + e.getMessage());
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
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }
    
    /**
     * Validate if token belongs to the expected user and role
     */
    public boolean validateTokenForUser(String token, String expectedUserId, String expectedRole) {
        try {
            if (!validateToken(token)) {
                return false;
            }
            
            String tokenUserId = getUserIdFromToken(token);
            String tokenRole = getRoleFromToken(token);
            
            // Validate user ID matches
            if (expectedUserId != null && !expectedUserId.equals(tokenUserId)) {
                System.out.println("⚠️ Token validation failed: User ID mismatch");
                return false;
            }
            
            // Validate role matches (if specified)
            if (expectedRole != null && !expectedRole.equalsIgnoreCase(tokenRole)) {
                System.out.println("⚠️ Token validation failed: Role mismatch. Expected: " + expectedRole + ", Found: " + tokenRole);
                return false;
            }
            
            return true;
        } catch (Exception e) {
            System.out.println("⚠️ Token user validation failed: " + e.getMessage());
            return false;
        }
    }
}
