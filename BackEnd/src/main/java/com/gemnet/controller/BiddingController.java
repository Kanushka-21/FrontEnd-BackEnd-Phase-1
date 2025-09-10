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
     * Get user notifications with optional context filtering
     */
    @GetMapping("/notifications/{userId}")
    @Operation(summary = "Get user notifications", description = "Get notifications for a specific user with optional role context filtering")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String context) {
        
        System.out.println("🔔 Get notifications request for user: " + userId + " (context: " + context + ")");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getUserNotifications(userId, page, size, context);
            
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
     * Get all bids received by a seller for their listings
     */
    @GetMapping("/seller/{sellerId}/received-bids")
    @Operation(summary = "Get seller received bids", description = "Get all bids received by a seller for their listings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerReceivedBids(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        System.out.println("🏪 Get seller received bids request for seller: " + sellerId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getSellerReceivedBids(sellerId, page, size);
            
            if (response.isSuccess()) {
                System.out.println("✅ Seller received bids retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get seller received bids: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get seller received bids endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get seller received bids: " + e.getMessage(), null));
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

    /**
     * Process expired bids and complete transactions
     */
    @PostMapping("/process-expired")
    @Operation(summary = "Process expired bids", description = "Process expired bids and complete transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processExpiredBids() {
        System.out.println("🔄 Processing expired bids...");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.processExpiredBids();
            
            if (response.isSuccess()) {
                System.out.println("✅ Expired bids processed successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to process expired bids: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in process expired bids endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to process expired bids: " + e.getMessage(), null));
        }
    }

    /**
     * Get purchase history for a user
     */
    @GetMapping("/purchase-history/{userId}")
    @Operation(summary = "Get purchase history", description = "Get purchase history for a user")
    public ResponseEntity<ApiResponse<java.util.List<Map<String, Object>>>> getPurchaseHistory(
            @PathVariable String userId) {
        
        System.out.println("📋 Get purchase history request for user: " + userId);
        
        try {
            ApiResponse<java.util.List<Map<String, Object>>> response = biddingService.getPurchaseHistory(userId);
            
            if (response.isSuccess()) {
                System.out.println("✅ Purchase history retrieved successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to get purchase history: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in get purchase history endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to get purchase history: " + e.getMessage(), null));
        }
    }

    /**
     * Reduce countdown time for testing purposes
     */
    @PostMapping("/testing/reduce-countdown/{listingId}")
    @Operation(summary = "Reduce countdown for testing", description = "Reduce countdown time for testing bid completion")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reduceCountdownForTesting(
            @PathVariable String listingId,
            @RequestParam long reduceByMinutes) {
        
        System.out.println("🧪 [TESTING] Reduce countdown request for listing: " + listingId + 
                          " by " + reduceByMinutes + " minutes");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.reduceCountdownForTesting(listingId, reduceByMinutes);
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] Countdown reduced successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to reduce countdown: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in reduce countdown endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to reduce countdown: " + e.getMessage(), null));
        }
    }

    /**
     * Create test purchase history data for development/testing
     */
    @PostMapping("/testing/create-test-purchase/{userId}/{listingId}")
    @Operation(summary = "Create test purchase data", description = "Create test purchase data for testing purposes")
    public ResponseEntity<ApiResponse<String>> createTestPurchase(
            @PathVariable String userId,
            @PathVariable String listingId) {
        
        System.out.println("🧪 [TESTING] Creating test purchase for user: " + userId + ", listing: " + listingId);
        
        try {
            ApiResponse<String> response = biddingService.createTestPurchase(userId, listingId);
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] Test purchase created successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to create test purchase: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in create test purchase endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to create test purchase: " + e.getMessage(), null));
        }
    }
    
    /**
     * Complete bidding for a specific listing (for testing notifications)
     * POST /api/bidding/testing/complete-bidding/{listingId}
     */
    @PostMapping("/testing/complete-bidding/{listingId}")
    public ResponseEntity<ApiResponse<String>> completeBiddingForTesting(
        @PathVariable String listingId) {
        
        try {
            System.out.println("🧪 [TESTING] Manual bidding completion for listing: " + listingId);
            
            ApiResponse<String> response = biddingService.completeBiddingForTesting(listingId);
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] Bidding completed successfully with notifications");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to complete bidding: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in complete bidding endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to complete bidding: " + e.getMessage(), null));
        }
    }

    /**
     * Complete any active bidding for testing (creates purchase data)
     */
    @PostMapping("/test/complete-any-for-testing")
    public ResponseEntity<ApiResponse<String>> completeAnyBiddingForTesting() {
        try {
            System.out.println("🧪 [TESTING] Received request to complete any active bidding");
            
            ApiResponse<String> response = biddingService.completeAnyBiddingForTesting();
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] Bidding completed successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to complete bidding: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in complete any bidding endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to complete any bidding: " + e.getMessage(), null));
        }
    }

    /**
     * Fix sold items that still have biddingActive=true
     */
    @PostMapping("/fix-sold-items")
    @Operation(summary = "Fix sold items with active bidding", 
               description = "Fix sold items that still have biddingActive=true")
    public ResponseEntity<ApiResponse<Map<String, Object>>> fixSoldItems() {
        
        System.out.println("🔧 [FIX] Starting fix for sold items with active bidding");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.fixSoldItemsWithActiveBidding();
            
            if (response.isSuccess()) {
                System.out.println("✅ [FIX] Sold items fixed successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [FIX] Failed to fix sold items: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [FIX] Error in fix sold items endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to fix sold items: " + e.getMessage(), null));
        }
    }

    /**
     * Create test purchase data for a user (for testing purposes)
     */
    @PostMapping("/testing/create-test-purchases/{userId}")
    @Operation(summary = "Create test purchases", description = "Create test purchase data for testing purposes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTestPurchaseData(
            @PathVariable String userId) {
        
        System.out.println("🧪 [TESTING] Creating test purchase data for user: " + userId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.createTestPurchaseData(userId);
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] Test purchase data created successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to create test purchase data: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in create test purchase endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to create test purchase data: " + e.getMessage(), null));
        }
    }

    /**
     * Reset user purchases (for testing purposes)
     */
    @PostMapping("/testing/reset-purchases/{userId}")
    @Operation(summary = "Reset user purchases", description = "Reset purchase data for testing purposes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetUserPurchases(
            @PathVariable String userId) {
        
        System.out.println("🧪 [TESTING] Resetting purchases for user: " + userId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.resetUserPurchases(userId);
            
            if (response.isSuccess()) {
                System.out.println("✅ [TESTING] User purchases reset successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [TESTING] Failed to reset user purchases: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [TESTING] Error in reset purchases endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to reset user purchases: " + e.getMessage(), null));
        }
    }

    /**
     * Link all SOLD items to a specific buyer (fix purchase history)
     */
    @PostMapping("/fix/link-sold-items-to-buyer")
    @Operation(summary = "Link sold items to buyer", description = "Links all SOLD marketplace items to a specific buyer's purchase history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> linkSoldItemsToBuyer(
            @RequestBody Map<String, Object> request) {
        
        String userId = (String) request.get("userId");
        String userEmail = (String) request.get("userEmail");
        
        System.out.println("🔗 [FIX] Linking SOLD items to buyer: " + userId + " (" + userEmail + ")");
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.linkAllSoldItemsToBuyer(userId, userEmail);
            
            if (response.isSuccess()) {
                System.out.println("✅ [FIX] SOLD items linked successfully to buyer");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [FIX] Failed to link SOLD items: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [FIX] Error in link sold items endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to link SOLD items to buyer: " + e.getMessage(), null));
        }
    }

    /**
     * Update the winning bidder for a specific listing (Admin endpoint for purchase history fixes)
     */
    @PostMapping("/admin/update-winner")
    @Operation(summary = "Update winning bidder", description = "Update the winning bidder ID for a specific listing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateWinningBidder(
            @RequestBody Map<String, Object> request) {
        
        String listingId = (String) request.get("listingId");
        String winningBidderId = (String) request.get("winningBidderId");
        Object finalPriceObj = request.get("finalPrice");
        
        System.out.println("🔧 [ADMIN] Updating winning bidder for listing: " + listingId);
        System.out.println("🔧 [ADMIN] New winning bidder: " + winningBidderId);
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.updateWinningBidder(listingId, winningBidderId, finalPriceObj);
            
            if (response.isSuccess()) {
                System.out.println("✅ [ADMIN] Winning bidder updated successfully");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ [ADMIN] Failed to update winning bidder: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [ADMIN] Error in update winning bidder endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to update winning bidder: " + e.getMessage(), null));
        }
    }
}
