package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for admin operations
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Operations", description = "Admin dashboard and management APIs")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get pending gemstone listings for admin approval
     */
    @GetMapping("/pending-listings")
    @Operation(summary = "Get pending gemstone listings", 
               description = "Retrieve all pending gemstone listings that need admin approval")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingListings(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        System.out.println("🔍 Admin - Getting pending listings request received");
        System.out.println("📄 Page: " + page + ", Size: " + size);
        
        try {
            // Create pageable object with sorting by creation date (most recent first)
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Get pending listings from service
            ApiResponse<Map<String, Object>> serviceResponse = adminService.getPendingListings(pageable);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved pending listings");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get pending listings error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve pending listings: " + e.getMessage()));
        }
    }

    /**
     * Update listing status (approve or reject)
     */
    @PutMapping("/listings/{listingId}/status")
    @Operation(summary = "Update listing status", 
               description = "Approve or reject a gemstone listing")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.PUT})
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateListingStatus(
            @PathVariable String listingId,
            @RequestParam String status,
            @RequestParam(required = false) String adminComment) {
        
        System.out.println("📝 Admin - Update listing status request received");
        System.out.println("🆔 Listing ID: " + listingId);
        System.out.println("📊 New Status: " + status);
        System.out.println("💬 Admin Comment: " + adminComment);
        
        try {
            // Validate status
            if (!isValidStatus(status)) {
                System.err.println("❌ Invalid status: " + status);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status. Allowed values: APPROVED, REJECTED"));
            }
            
            // Update listing status via service
            ApiResponse<Map<String, Object>> serviceResponse = 
                adminService.updateListingStatus(listingId, status, adminComment);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Listing status updated successfully");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Update listing status error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to update listing status: " + e.getMessage()));
        }
    }

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get admin dashboard statistics", 
               description = "Retrieve key statistics for admin dashboard")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        
        System.out.println("📊 Admin - Dashboard stats request received");
        
        try {
            // Get statistics from service
            ApiResponse<Map<String, Object>> serviceResponse = adminService.getDashboardStats();
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved dashboard stats");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get dashboard stats error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve dashboard stats: " + e.getMessage()));
        }
    }

    /**
     * Get listing details by ID for admin review
     */
    @GetMapping("/listings/{listingId}")
    @Operation(summary = "Get listing details", 
               description = "Get detailed information about a specific listing for admin review")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<GemListing>> getListingDetails(
            @PathVariable String listingId) {
        
        System.out.println("🔍 Admin - Get listing details request received");
        System.out.println("🆔 Listing ID: " + listingId);
        
        try {
            // Get listing details from service
            ApiResponse<GemListing> serviceResponse = adminService.getListingDetails(listingId);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved listing details");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(404).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get listing details error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve listing details: " + e.getMessage()));
        }
    }

    /**
     * Helper method to validate status values
     */
    private boolean isValidStatus(String status) {
        return "APPROVED".equals(status) || "REJECTED".equals(status);
    }
}
