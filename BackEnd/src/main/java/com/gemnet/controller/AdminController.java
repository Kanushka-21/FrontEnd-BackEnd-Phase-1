package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.model.User;
import com.gemnet.service.AdminService;
import com.gemnet.service.UserService;
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
import java.util.List;
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

    @Autowired
    private UserService userService;

    /**
     * Get all users for admin management
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", 
               description = "Retrieve all users for admin management")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        
        System.out.println("👥 Admin - Getting all users request received");
        
        try {
            // Get all users from user service
            List<User> users = userService.findAll();
            
            System.out.println("✅ Successfully retrieved " + users.size() + " users");
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
            
        } catch (Exception e) {
            System.err.println("❌ Get all users error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    /**
     * Update user verification status
     */
    @PostMapping("/verifications/{userId}")
    @Operation(summary = "Update user verification status", 
               description = "Approve or reject user verification")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<String>> updateVerificationStatus(
            @PathVariable String userId,
            @RequestParam boolean approved) {
        
        System.out.println("✅ Admin - Update verification status request received");
        System.out.println("🆔 User ID: " + userId);
        System.out.println("📊 Approved: " + approved);
        
        try {
            // Update user verification status via service
            ApiResponse<String> serviceResponse = userService.updateVerificationStatus(userId, approved);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ User verification status updated successfully");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Update verification status error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to update verification status: " + e.getMessage()));
        }
    }

    /**
     * Verify user - sets verification status to VERIFIED
     */
    @PostMapping("/verify-user/{userId}")
    @Operation(summary = "Verify user", 
               description = "Set user verification status to VERIFIED to allow bidding")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<String>> verifyUser(@PathVariable String userId) {
        
        System.out.println("✅ Admin - Verify user request received");
        System.out.println("🆔 User ID: " + userId);
        
        try {
            // Verify user via service - set status to VERIFIED
            ApiResponse<String> serviceResponse = userService.verifyUser(userId);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ User verified successfully");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Verify user error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to verify user: " + e.getMessage()));
        }
    }

    /**
     * Update user status (activate/deactivate)
     */
    @PostMapping("/users/{userId}/status")
    @Operation(summary = "Update user status", 
               description = "Activate or deactivate a user account")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable String userId,
            @RequestParam String action) {
        
        System.out.println("🔄 Admin - Update user status request received");
        System.out.println("🆔 User ID: " + userId);
        System.out.println("⚡ Action: " + action);
        
        try {
            // Validate action
            if (!"activate".equals(action) && !"deactivate".equals(action)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid action. Use 'activate' or 'deactivate'"));
            }
            
            boolean isActive = "activate".equals(action);
            
            // Update user status via service
            ApiResponse<String> serviceResponse = userService.updateUserStatus(userId, isActive);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ User status updated successfully");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Update user status error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to update user status: " + e.getMessage()));
        }
    }

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
