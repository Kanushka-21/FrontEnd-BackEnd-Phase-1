package com.gemnet.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;

@Configuration
public class LoggingFilterConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public Filter requestResponseLoggingFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                           FilterChain filterChain) throws IOException, ServletException {
                // Start timestamp
                long startTime = System.currentTimeMillis();
                String requestId = String.valueOf(startTime);
                
                // Log the request
                logRequest(request, requestId);
                
                // Continue with the filter chain
                filterChain.doFilter(request, response);
                
                // Calculate execution time
                long executionTime = System.currentTimeMillis() - startTime;
                
                // Log the response
                logResponse(response, requestId, executionTime);
            }
            
            private void logRequest(HttpServletRequest request, String requestId) {
                System.out.println("\n📥 REQUEST [" + requestId + "] ===================================");
                System.out.println("📥 " + request.getMethod() + " " + request.getRequestURI());
                System.out.println("📥 Remote Address: " + request.getRemoteAddr());
                
                // Log headers
                System.out.println("📥 Headers:");
                Enumeration<String> headerNames = request.getHeaderNames();
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    String headerValue = request.getHeader(headerName);
                    System.out.println("📥   " + headerName + ": " + headerValue);
                }
                
                // Log query parameters
                System.out.println("📥 Query Parameters:");
                request.getParameterMap().forEach((name, values) -> {
                    System.out.print("📥   " + name + ": ");
                    for (String value : values) {
                        System.out.print(value + " ");
                    }
                    System.out.println();
                });
                System.out.println("📥 ===================================================");
            }
            
            private void logResponse(HttpServletResponse response, String requestId, long executionTime) {
                System.out.println("\n📤 RESPONSE [" + requestId + "] ==================================");
                System.out.println("📤 Status: " + response.getStatus());
                System.out.println("📤 Execution Time: " + executionTime + "ms");
                
                // Log response headers
                System.out.println("📤 Headers:");
                Collection<String> headerNames = response.getHeaderNames();
                for (String headerName : headerNames) {
                    String headerValue = response.getHeader(headerName);
                    System.out.println("📤   " + headerName + ": " + headerValue);
                }
                System.out.println("📤 ===================================================");
            }
        };
    }
}
