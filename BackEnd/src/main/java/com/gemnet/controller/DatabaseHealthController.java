package com.gemnet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for checking database health and connection status
 * This provides endpoints that the frontend can use to verify database connectivity
 */
@RestController
@RequestMapping("/api/system")
public class DatabaseHealthController {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    /**
     * Check MongoDB connection status and return health information
     * @return JSON with database connection status and information
     */
    @GetMapping("/db-status")
    public ResponseEntity<Map<String, Object>> getDatabaseStatus() {
        Map<String, Object> response = new HashMap<>();
        boolean isConnected = false;
        String databaseName = "unknown";
        long gemListingsCount = -1;
        String errorMessage = null;
        
        try {
            // Try to get database name
            databaseName = mongoTemplate.getDb().getName();
            
            // Execute a simple query to verify connection
            mongoTemplate.count(new Query(), "test");
            isConnected = true;
            
            // Check gem_listings collection
            try {
                gemListingsCount = mongoTemplate.count(new Query(), "gem_listings");
            } catch (Exception e) {
                // Collection might not exist
            }
        } catch (Exception e) {
            isConnected = false;
            errorMessage = e.getMessage();
        }
        
        // Build response
        response.put("connected", isConnected);
        response.put("database", databaseName);
        response.put("gemListingsCount", gemListingsCount);
        
        if (errorMessage != null) {
            response.put("error", errorMessage);
        }
        
        // Add troubleshooting information
        if (!isConnected) {
            response.put("troubleshooting", Map.of(
                "steps", new String[] {
                    "Start MongoDB: mongod --port 27017",
                    "Check MongoDB configuration in application.properties",
                    "Ensure MongoDB service is running",
                    "Verify port 27017 is not blocked by firewall",
                    "Restart backend application after MongoDB is running"
                }
            ));
        }
        
        return ResponseEntity.ok(response);
    }
}
