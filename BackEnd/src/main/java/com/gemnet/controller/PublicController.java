package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for public API endpoints
 */
@RestController
@RequestMapping("/api/public")
@Tag(name = "Public API", description = "Public endpoints that don't require authentication")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private AdminService adminService;

    /**
     * Get homepage statistics (public endpoint)
     */
    @GetMapping("/homepage-stats")
    @Operation(summary = "Get homepage statistics", 
               description = "Retrieve key statistics for homepage display - public endpoint")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHomepageStats() {
        
        System.out.println("🏠 Public - Homepage stats request received");
        
        try {
            // Get homepage-specific statistics from service
            ApiResponse<Map<String, Object>> serviceResponse = adminService.getHomepageStats();
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved public homepage stats");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get public homepage stats error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve homepage stats: " + e.getMessage()));
        }
    }
}
