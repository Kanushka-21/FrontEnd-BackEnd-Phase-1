package com.gemnet.security;

import com.gemnet.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String jwt = getJwtFromRequest(request);
        
        if (StringUtils.hasText(jwt)) {
            try {
                // Enhanced security validation
                if (!jwtTokenProvider.validateToken(jwt)) {
                    System.out.println("⚠️ JWT Authentication - Invalid token detected");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                
                String identifier = jwtTokenProvider.getIdentifierFromToken(jwt);
                String userRole = jwtTokenProvider.getRoleFromToken(jwt);
                
                System.out.println("🔓 JWT Authentication - Processing token for identifier: " + identifier + ", role: " + userRole);
                
                // Load user details and validate against token claims
                UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);
                
                // Additional security: Validate that the loaded user matches token claims
                if (userDetails == null) {
                    System.out.println("⚠️ JWT Authentication - User not found: " + identifier);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                
                // Set up authentication context
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("✅ JWT Authentication successful for: " + identifier);
                
            } catch (Exception e) {
                System.out.println("❌ JWT Authentication failed: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
