package com.gemnet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Health Check", description = "System health check APIs")
public class HealthCheckController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/health/mongodb")
    @Operation(summary = "MongoDB health check", description = "Check MongoDB connection and status")
    public ResponseEntity<Map<String, Object>> checkMongoDBHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "MongoDB Connection");
        
        try {
            // Run a simple command to check if MongoDB is responding
            Map<String, Object> result = mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            
            if (result.get("ok").equals(1.0)) {
                response.put("status", "Connected");
                response.put("database", mongoTemplate.getDb().getName());
                response.put("timestamp", System.currentTimeMillis());
                
                // Get collection count to verify access
                response.put("collections", mongoTemplate.getCollectionNames().size());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "Failed");
                response.put("error", "MongoDB ping command returned unexpected result");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            response.put("status", "Failed");
            response.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(response);
        }
    }
}
