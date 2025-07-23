package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.BidRequestDto;
import com.gemnet.service.BiddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bidding")
@Tag(name = "Bidding API", description = "API for managing bids and notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BiddingController {
    
    @Autowired
    private BiddingService biddingService;
    
    /**
     * Place a bid on a gem listing
     */
    @PostMapping("/place-bid")
    @Operation(summary = "Place a bid", description = "Place a bid on a gem listing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeBid(@RequestBody BidRequestDto bidRequest) {
        System.out.println("💰 Place bid request received: " + bidRequest);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.placeBid(bidRequest);
            
            if (response.isSuccess()) {
                System.out.println("✅ Bid placed successfully: " + response.getData());
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to place bid: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in place bid endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to place bid: " + e.getMessage(), null));
        }
    }
    
    /**
     * Get all bids for a specific listing
     */
    @GetMapping("/listing/{listingId}/bids")
    @Operation(summary = "Get bids for listing", description = "Get all bids for a specific gem listing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBidsForListing(
            @PathVariable String listingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("📋 Get bids request for listing: " + listingId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getBidsForListing(listingId, page, size);
            
            if (response.isSuccess()) {
                System.out.println("✅ Bids retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get bids: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get bids endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get bids: " + e.getMessage(), null));
        }
    }
    
    /**
     * Get bid statistics for a listing
     */
    @GetMapping("/listing/{listingId}/stats")
    @Operation(summary = "Get bid statistics", description = "Get bid statistics for a gem listing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBidStatistics(@PathVariable String listingId) {
        System.out.println("📊 Get bid statistics for listing: " + listingId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getBidStatistics(listingId);
            
            if (response.isSuccess()) {
                System.out.println("✅ Statistics retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get statistics: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get statistics endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get statistics: " + e.getMessage(), null));
        }
    }
    
    /**
     * Get countdown status for a listing
     */
    @GetMapping("/listing/{listingId}/countdown")
    @Operation(summary = "Get countdown status", description = "Get bidding countdown status for a gem listing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCountdownStatus(@PathVariable String listingId) {
        System.out.println("⏰ Get countdown status for listing: " + listingId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getCountdownStatus(listingId);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get countdown: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get countdown endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get countdown: " + e.getMessage(), null));
        }
    }
    
    /**
     * Get user notifications
     */
    @GetMapping("/notifications/{userId}")
    @Operation(summary = "Get user notifications", description = "Get notifications for a specific user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        System.out.println("🔔 Get notifications request for user: " + userId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getUserNotifications(userId, page, size);
            
            if (response.isSuccess()) {
                System.out.println("✅ Notifications retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get notifications: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get notifications endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get notifications: " + e.getMessage(), null));
        }
    }
      /**
     * Mark notification as read
     */
    @PutMapping("/notifications/{notificationId}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable String notificationId) {
        System.out.println("🔔 [CONTROLLER] Mark notification as read request - ID: " + notificationId);
        
        try {
            ApiResponse<String> response = biddingService.markNotificationAsRead(notificationId);
            
            if (response.isSuccess()) {
                System.out.println("🔔 [CONTROLLER] ✅ Notification marked as read successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("🔔 [CONTROLLER] ❌ Failed to mark notification as read: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("🔔 [CONTROLLER] ❌ Error in mark notification as read endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to mark notification as read: " + e.getMessage(), null));
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/notifications/{userId}/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for a specific user")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsAsRead(@PathVariable String userId) {
        System.out.println("� [CONTROLLER] Mark all notifications as read request - UserId: " + userId);
        
        try {
            ApiResponse<String> response = biddingService.markAllNotificationsAsRead(userId);
            
            if (response.isSuccess()) {
                System.out.println("🔔 [CONTROLLER] ✅ All notifications marked as read successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("🔔 [CONTROLLER] ❌ Failed to mark all notifications as read: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("🔔 [CONTROLLER] ❌ Error in mark all notifications as read endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to mark all notifications as read: " + e.getMessage(), null));
        }
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/notifications/{userId}/unread-count")
    @Operation(summary = "Get unread notification count", description = "Get count of unread notifications for a user")
    public ResponseEntity<ApiResponse<Long>> getUnreadNotificationCount(@PathVariable String userId) {
        System.out.println("🔢 Get unread count for user: " + userId);
        
        try {
            ApiResponse<Long> response = biddingService.getUnreadNotificationCount(userId);
            
            if (response.isSuccess()) {
                System.out.println("✅ Unread count retrieved successfully: " + response.getData());
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get unread count: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get unread count endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get unread count: " + e.getMessage(), 0L));
        }
    }
    
    /**
     * Get all bids placed by a specific user
     */
    @GetMapping("/user/{userId}/bids")
    @Operation(summary = "Get user bids", description = "Get all bids placed by a specific user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserBids(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("👤 Get user bids request for user: " + userId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getUserBids(userId, page, size);
            
            if (response.isSuccess()) {
                System.out.println("✅ User bids retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get user bids: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get user bids endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get user bids: " + e.getMessage(), null));
        }
    }
    
    /**
     * Utility endpoint to activate countdown for all listings that have bids but no active countdown
     */
    @PostMapping("/utility/activate-countdown")
    @Operation(summary = "Activate countdown for existing listings", description = "Utility to activate countdown for listings with bids")
    public ResponseEntity<ApiResponse<Map<String, Object>>> activateCountdownForExistingListings() {
        System.out.println("🛠️ Utility: Activating countdown for existing listings with bids");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.activateCountdownForExistingListings();
            
            if (response.isSuccess()) {
                System.out.println("✅ Countdown activation completed");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to activate countdown: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in activate countdown utility: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to activate countdown: " + e.getMessage(), null));
        }
    }
}
