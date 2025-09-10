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
     * Get homepage statistics for public display
     */
    @GetMapping("/homepage-stats")
    @Operation(summary = "Get homepage statistics", 
               description = "Retrieve key statistics for homepage display")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHomepageStats() {
        
        System.out.println("🏠 Admin - Homepage stats request received");
        
        try {
            // Get homepage-specific statistics from service
            ApiResponse<Map<String, Object>> serviceResponse = adminService.getHomepageStats();
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved homepage stats");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get homepage stats error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve homepage stats: " + e.getMessage()));
        }
    }

    /**
     * Helper method to validate status values
     */
    private boolean isValidStatus(String status) {
        return "APPROVED".equals(status) || "REJECTED".equals(status);
    }

    /**
     * Get admin notifications
     */
    @GetMapping("/notifications/{userId}")
    @Operation(summary = "Get admin notifications", 
               description = "Retrieve notifications for admin user")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        System.out.println("🔔 Admin - Get notifications request received");
        System.out.println("👤 User ID: " + userId);
        System.out.println("📄 Page: " + page + ", Size: " + size);
        
        try {
            // Create mock admin notifications for now
            Map<String, Object> response = new HashMap<>();
            
            // Mock notifications data
            List<Map<String, Object>> notifications = List.of(
                createMockNotification("1", "USER_REGISTRATION", "New User Registration", 
                    "John Doe has registered as a seller and requires verification", "users", "high", false),
                createMockNotification("2", "LISTING_PENDING", "Listing Approval Required", 
                    "Sapphire Ring listing by Jane Smith is pending approval", "listings", "medium", false),
                createMockNotification("3", "MEETING_REQUEST", "New Meeting Request", 
                    "Meeting requested for Ruby verification on Friday", "meetings", "medium", false),
                createMockNotification("4", "ADVERTISEMENT_PENDING", "Advertisement Approval", 
                    "Premium gemstone advertisement requires review", "advertisements", "low", true),
                createMockNotification("5", "SYSTEM_ALERT", "System Performance Alert", 
                    "Database response time increased by 15% in the last hour", "settings", "high", false)
            );
            
            response.put("notifications", notifications);
            response.put("total", notifications.size());
            response.put("unreadCount", notifications.stream().mapToInt(n -> (Boolean) n.get("isRead") ? 0 : 1).sum());
            
            System.out.println("✅ Successfully retrieved admin notifications");
            
            return ResponseEntity.ok(ApiResponse.success("Admin notifications retrieved successfully", response));
            
        } catch (Exception e) {
            System.err.println("❌ Get admin notifications error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve admin notifications: " + e.getMessage()));
        }
    }

    /**
     * Get admin unread notification count
     */
    @GetMapping("/notifications/{userId}/unread-count")
    @Operation(summary = "Get admin unread notification count", 
               description = "Get count of unread notifications for admin")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Integer>> getAdminUnreadCount(@PathVariable String userId) {
        
        System.out.println("🔔 Admin - Get unread count request received");
        System.out.println("👤 User ID: " + userId);
        
        try {
            // Mock unread count - in real implementation, this would query the database
            int unreadCount = 4; // Mock value
            
            System.out.println("✅ Successfully retrieved admin unread count: " + unreadCount);
            
            return ResponseEntity.ok(ApiResponse.success("Admin unread count retrieved successfully", unreadCount));
            
        } catch (Exception e) {
            System.err.println("❌ Get admin unread count error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve admin unread count: " + e.getMessage()));
        }
    }

    /**
     * Mark admin notification as read
     */
    @PutMapping("/notifications/{notificationId}/read")
    @Operation(summary = "Mark admin notification as read", 
               description = "Mark a specific admin notification as read")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.PUT})
    public ResponseEntity<ApiResponse<String>> markAdminNotificationAsRead(@PathVariable String notificationId) {
        
        System.out.println("🔔 Admin - Mark notification as read request received");
        System.out.println("🆔 Notification ID: " + notificationId);
        
        try {
            // Mock implementation - in real scenario, update notification in database
            System.out.println("✅ Successfully marked admin notification as read");
            
            return ResponseEntity.ok(ApiResponse.success("success", "Admin notification marked as read"));
            
        } catch (Exception e) {
            System.err.println("❌ Mark admin notification as read error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to mark admin notification as read: " + e.getMessage()));
        }
    }

    /**
     * Get all feedbacks for admin management
     */
    @GetMapping("/feedbacks")
    @Operation(summary = "Get all feedbacks", 
               description = "Retrieve all feedbacks for admin management")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("💬 Admin - Get all feedbacks request received");
        System.out.println("📄 Page: " + page + ", Size: " + size);
        
        try {
            // Get all feedbacks from feedback service
            ApiResponse<Map<String, Object>> serviceResponse = adminService.getAllFeedbacks(page, size);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved feedbacks");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get all feedbacks error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve feedbacks: " + e.getMessage()));
        }
    }

    /**
     * Delete feedback by ID
     */
    @DeleteMapping("/feedbacks/{feedbackId}")
    @Operation(summary = "Delete feedback", 
               description = "Delete a specific feedback from the system")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.DELETE})
    public ResponseEntity<ApiResponse<String>> deleteFeedback(@PathVariable String feedbackId) {
        
        System.out.println("🗑️ Admin - Delete feedback request received");
        System.out.println("🆔 Feedback ID: " + feedbackId);
        
        try {
            // Delete feedback via service
            ApiResponse<String> serviceResponse = adminService.deleteFeedback(feedbackId);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Feedback deleted successfully");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Delete feedback error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to delete feedback: " + e.getMessage()));
        }
    }

    /**
     * Helper method to create mock notification
     */
    private Map<String, Object> createMockNotification(String id, String type, String title, 
            String message, String section, String priority, boolean isRead) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("id", id);
        notification.put("type", type);
        notification.put("title", title);
        notification.put("message", message);
        notification.put("section", section);
        notification.put("priority", priority);
        notification.put("isRead", isRead);
        notification.put("createdAt", java.time.Instant.now().toString());
        notification.put("actionRequired", !type.equals("SYSTEM_ALERT"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("userId", "user123");
        metadata.put("userName", "Test User");
        notification.put("metadata", metadata);
        
        return notification;
    }
}
