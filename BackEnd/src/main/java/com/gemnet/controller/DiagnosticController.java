package com.gemnet.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gemnet.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Diagnostics", description = "Diagnostic API endpoints for monitoring and testing")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DiagnosticController {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @GetMapping("/ping")
    @Operation(summary = "Basic ping test", description = "Tests if the server is responding to requests")
    public ResponseEntity<ApiResponse<String>> ping() {
        return ResponseEntity.ok(ApiResponse.success("Pong! Server is up and running."));
    }
    
    @GetMapping("/status")
    @Operation(summary = "System status", description = "Provides detailed status of system components")
    public ResponseEntity<ApiResponse<Map<String, Object>>> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "GemNet Backend");
        status.put("timestamp", System.currentTimeMillis());
        status.put("version", "1.0.0");
        
        // Test MongoDB connectivity
        boolean mongoConnected = false;
        String mongoStatus = "Not available";
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            mongoConnected = true;
            mongoStatus = "Connected";
            
            // Get collection stats
            try {
                long userCount = mongoTemplate.getCollection("users").countDocuments();
                status.put("userCount", userCount);
            } catch (Exception e) {
                status.put("userCount", "Error: " + e.getMessage());
            }
        } catch (Exception e) {
            mongoStatus = "Error: " + e.getMessage();
        }
        
        status.put("mongoConnected", mongoConnected);
        status.put("mongoStatus", mongoStatus);
        
        // System info
        status.put("javaVersion", System.getProperty("java.version"));
        status.put("os", System.getProperty("os.name"));
        status.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        status.put("freeMemory", Runtime.getRuntime().freeMemory() / (1024 * 1024) + "MB");
        status.put("maxMemory", Runtime.getRuntime().maxMemory() / (1024 * 1024) + "MB");
        
        return ResponseEntity.ok(ApiResponse.success("System status", status));
    }
    
    @GetMapping("/cors-test")
    @Operation(summary = "CORS test", description = "Tests if CORS is properly configured")
    public ResponseEntity<ApiResponse<Map<String, Object>>> corsTest() {
        Map<String, Object> result = new HashMap<>();
        result.put("corsSupport", "Enabled");
        result.put("message", "If you can see this response in your frontend application, CORS is configured correctly");
        return ResponseEntity.ok(ApiResponse.success("CORS test successful", result));
    }
}
