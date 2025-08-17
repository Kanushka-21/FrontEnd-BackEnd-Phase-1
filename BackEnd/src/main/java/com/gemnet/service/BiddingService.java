package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.BidRequestDto;
import com.gemnet.model.Bid;
import com.gemnet.model.GemListing;
import com.gemnet.model.Notification;
import com.gemnet.repository.BidRepository;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BiddingService {
    
    @Autowired
    private BidRepository bidRepository;
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    /**
     * Place a bid on a gem listing
     */
    public ApiResponse<Map<String, Object>> placeBid(BidRequestDto bidRequest) {
        try {
            // Validate listing exists and is available for bidding
            Optional<GemListing> listingOpt = gemListingRepository.findById(bidRequest.getListingId());
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found", null);
            }
            
            GemListing listing = listingOpt.get();
            
            // Check if listing is active and available for bidding
            if (!"approved".equalsIgnoreCase(listing.getListingStatus())) {
                return new ApiResponse<>(false, "This listing is not available for bidding", null);
            }
            
            // Prevent seller from bidding on their own listing
            if (bidRequest.getBidderId().equals(listing.getUserId())) {
                return new ApiResponse<>(false, "You cannot bid on your own listing", null);
            }
            
            // Check if bid amount is higher than listing price (minimum bid)
            if (bidRequest.getBidAmount().compareTo(listing.getPrice()) < 0) {
                return new ApiResponse<>(false, 
                    "Bid amount must be at least LKR " + formatAmount(listing.getPrice()), null);
            }
            
            // Get current highest bid
            Optional<Bid> currentHighestBid = bidRepository
                .findTopByListingIdAndStatusOrderByBidAmountDesc(bidRequest.getListingId(), "ACTIVE");
            
            // Check if new bid is higher than current highest bid
            if (currentHighestBid.isPresent()) {
                BigDecimal currentHighest = currentHighestBid.get().getBidAmount();
                if (bidRequest.getBidAmount().compareTo(currentHighest) <= 0) {
                    return new ApiResponse<>(false, 
                        "Your bid must be higher than the current highest bid of LKR " + formatAmount(currentHighest), null);
                }
            }
            
            // Check if user already has an active bid and update it to OUTBID
            Optional<Bid> existingBid = bidRepository
                .findByListingIdAndBidderIdAndStatus(bidRequest.getListingId(), bidRequest.getBidderId(), "ACTIVE");
            
            if (existingBid.isPresent()) {
                existingBid.get().setStatus("OUTBID");
                bidRepository.save(existingBid.get());
            }
            
            // Create new bid
            Bid newBid = new Bid(
                bidRequest.getListingId(),
                bidRequest.getBidderId(),
                bidRequest.getBidderName(),
                bidRequest.getBidderEmail(),
                listing.getUserId(), // seller ID
                bidRequest.getBidAmount(),
                bidRequest.getCurrency() != null ? bidRequest.getCurrency() : "LKR",
                bidRequest.getMessage()
            );
            
            // Save the bid
            Bid savedBid = bidRepository.save(newBid);
            
            // Start countdown if this is the first bid on the listing (bidding not yet active)
            if (!Boolean.TRUE.equals(listing.getBiddingActive())) {
                // This is the first bid - start the 4-day countdown
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime endTime = now.plusDays(4); // 4 days from now
                
                listing.setBiddingStartTime(now);
                listing.setBiddingEndTime(endTime);
                listing.setBiddingActive(true);
                
                // Save the updated listing
                gemListingRepository.save(listing);
                
                System.out.println("🕒 Started 4-day countdown for listing: " + listing.getId());
                System.out.println("   Start time: " + now);
                System.out.println("   End time: " + endTime);
            }
            
            // Handle notifications for all affected users
            handleBidNotifications(savedBid, listing, currentHighestBid.orElse(null));
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("bidId", savedBid.getId());
            response.put("bidAmount", savedBid.getBidAmount());
            response.put("bidTime", savedBid.getBidTime());
            response.put("status", savedBid.getStatus());
            response.put("message", "Bid placed successfully");
            
            // Get updated bid statistics
            long totalBids = bidRepository.countByListingId(bidRequest.getListingId());
            Optional<Bid> newHighestBid = bidRepository
                .findTopByListingIdAndStatusOrderByBidAmountDesc(bidRequest.getListingId(), "ACTIVE");
            
            response.put("totalBids", totalBids);
            response.put("highestBid", newHighestBid.map(Bid::getBidAmount).orElse(BigDecimal.ZERO));
            
            // Add countdown information to response
            GemListing updatedListing = gemListingRepository.findById(bidRequest.getListingId()).orElse(listing);
            if (Boolean.TRUE.equals(updatedListing.getBiddingActive())) {
                response.put("biddingActive", true);
                response.put("biddingStartTime", updatedListing.getBiddingStartTime());
                response.put("biddingEndTime", updatedListing.getBiddingEndTime());
                
                // Calculate remaining time in seconds
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime endTime = updatedListing.getBiddingEndTime();
                if (endTime != null && endTime.isAfter(now)) {
                    long remainingSeconds = java.time.Duration.between(now, endTime).getSeconds();
                    response.put("remainingTimeSeconds", remainingSeconds);
                } else {
                    response.put("remainingTimeSeconds", 0);
                }
            } else {
                response.put("biddingActive", false);
                response.put("remainingTimeSeconds", 0);
            }
            
            return new ApiResponse<>(true, "Bid placed successfully", response);
            
        } catch (Exception e) {
            System.err.println("Error placing bid: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to place bid: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get all bids for a specific listing
     */
    public ApiResponse<Map<String, Object>> getBidsForListing(String listingId, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Bid> bidsPage = bidRepository.findByListingIdOrderByBidTimeDesc(listingId, pageable);
            
            // Get current highest bid
            Optional<Bid> highestBid = bidRepository
                .findTopByListingIdAndStatusOrderByBidAmountDesc(listingId, "ACTIVE");
            
            // Count total and active bids
            long totalBids = bidRepository.countByListingId(listingId);
            long activeBids = bidRepository.countByListingIdAndStatus(listingId, "ACTIVE");
            
            Map<String, Object> response = new HashMap<>();
            response.put("bids", bidsPage.getContent());
            response.put("totalElements", bidsPage.getTotalElements());
            response.put("totalPages", bidsPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalBids", totalBids);
            response.put("activeBids", activeBids);
            response.put("highestBid", highestBid.map(Bid::getBidAmount).orElse(BigDecimal.ZERO));
            response.put("highestBidder", highestBid.map(Bid::getBidderName).orElse("No bids yet"));
            
            return new ApiResponse<>(true, "Bids retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("Error getting bids for listing: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get bids: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get bid statistics for a listing (for quick display)
     */
    public ApiResponse<Map<String, Object>> getBidStatistics(String listingId) {
        try {
            long totalBids = bidRepository.countByListingId(listingId);
            Optional<Bid> highestBid = bidRepository
                .findTopByListingIdAndStatusOrderByBidAmountDesc(listingId, "ACTIVE");
            
            // Check if listing exists and activate countdown if needed
            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (listingOpt.isPresent()) {
                GemListing listing = listingOpt.get();
                
                // If there are bids but countdown is not active, activate it
                if (totalBids > 0 && !Boolean.TRUE.equals(listing.getBiddingActive())) {
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime endTime = now.plusDays(4); // 4 days from now
                    
                    listing.setBiddingStartTime(now);
                    listing.setBiddingEndTime(endTime);
                    listing.setBiddingActive(true);
                    
                    gemListingRepository.save(listing);
                    
                    System.out.println("🕒 Activated 4-day countdown for existing listing with bids: " + listing.getId());
                    System.out.println("   Start time: " + now);
                    System.out.println("   End time: " + endTime);
                }
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBids", totalBids);
            stats.put("highestBid", highestBid.map(Bid::getBidAmount).orElse(BigDecimal.ZERO));
            stats.put("highestBidder", highestBid.map(Bid::getBidderName).orElse(null));
            stats.put("hasActiveBids", highestBid.isPresent());
            
            return new ApiResponse<>(true, "Statistics retrieved successfully", stats);
            
        } catch (Exception e) {
            System.err.println("Error getting bid statistics: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get statistics: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get user's notifications
     */
    public ApiResponse<Map<String, Object>> getUserNotifications(String userId, int page, int size) {
        try {
            System.out.println("🔔 [DEBUG] Getting notifications for userId: " + userId + ", page: " + page + ", size: " + size);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notificationsPage = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);
            
            System.out.println("🔔 [DEBUG] Found " + notificationsPage.getTotalElements() + " total notifications");
            System.out.println("🔔 [DEBUG] Current page has " + notificationsPage.getContent().size() + " notifications");
            
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
            System.out.println("🔔 [DEBUG] Unread count: " + unreadCount);
            
            // Log details of notifications being returned
            List<Notification> notifications = notificationsPage.getContent();
            for (int i = 0; i < notifications.size(); i++) {
                Notification notif = notifications.get(i);
                System.out.println("🔔 [DEBUG] Notification " + (i+1) + ": ID=" + notif.getId() + 
                                 ", Type=" + notif.getType() + ", isRead=" + notif.isRead() + 
                                 ", Title=" + notif.getTitle());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notificationsPage.getContent());
            response.put("totalElements", notificationsPage.getTotalElements());
            response.put("totalPages", notificationsPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("unreadCount", unreadCount);
            
            return new ApiResponse<>(true, "Notifications retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error getting notifications: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get notifications: " + e.getMessage(), null);
        }
    }
    
    /**
     * Mark notification as read
     */
    public ApiResponse<String> markNotificationAsRead(String notificationId) {
        try {
            System.out.println("🔔 [DEBUG] Starting markNotificationAsRead for notificationId: " + notificationId);
            
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isEmpty()) {
                System.out.println("🔔 [DEBUG] Notification not found with ID: " + notificationId);
                return new ApiResponse<>(false, "Notification not found", null);
            }
            
            Notification notification = notificationOpt.get();
            System.out.println("🔔 [DEBUG] Found notification - Type: " + notification.getType() + 
                             ", Currently isRead: " + notification.isRead() + 
                             ", UserId: " + notification.getUserId());
            
            notification.markAsRead();
            System.out.println("🔔 [DEBUG] After markAsRead() - isRead: " + notification.isRead() + 
                             ", readAt: " + notification.getReadAt());
            
            Notification savedNotification = notificationRepository.save(notification);
            System.out.println("🔔 [DEBUG] Notification saved successfully - ID: " + savedNotification.getId() + 
                             ", isRead: " + savedNotification.isRead());
            
            return new ApiResponse<>(true, "Notification marked as read successfully", "success");
            
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to mark notification as read: " + e.getMessage(), null);
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public ApiResponse<String> markAllNotificationsAsRead(String userId) {
        try {
            System.out.println("🔔 [DEBUG] Starting markAllNotificationsAsRead for userId: " + userId);
            
            // First, get all unread notifications for this user
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            System.out.println("🔔 [DEBUG] Found " + unreadNotifications.size() + " unread notifications");
            
            if (unreadNotifications.isEmpty()) {
                System.out.println("🔔 [DEBUG] No unread notifications found for user: " + userId);
                return new ApiResponse<>(true, "No unread notifications to mark", "success");
            }
            
            // Mark each notification as read and save individually for better error handling
            int successCount = 0;
            int errorCount = 0;
            
            for (int i = 0; i < unreadNotifications.size(); i++) {
                try {
                    Notification notification = unreadNotifications.get(i);
                    System.out.println("🔔 [DEBUG] Processing notification " + (i+1) + "/" + unreadNotifications.size() + 
                                     " - ID: " + notification.getId() + ", Type: " + notification.getType() + 
                                     ", Currently isRead: " + notification.isRead());
                    
                    // Mark as read
                    notification.setRead(true);
                    notification.setReadAt(LocalDateTime.now());
                    
                    System.out.println("🔔 [DEBUG] After setting read status - isRead: " + notification.isRead() + 
                                     ", readAt: " + notification.getReadAt());
                    
                    // Save individual notification
                    Notification savedNotification = notificationRepository.save(notification);
                    System.out.println("🔔 [DEBUG] Successfully saved notification ID: " + savedNotification.getId());
                    successCount++;
                    
                } catch (Exception e) {
                    System.err.println("🔔 [ERROR] Failed to save notification " + (i+1) + ": " + e.getMessage());
                    errorCount++;
                }
            }
            
            System.out.println("🔔 [DEBUG] Completed processing - Success: " + successCount + ", Errors: " + errorCount);
            
            // Verify the save by checking the database again
            long remainingUnreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
            System.out.println("🔔 [DEBUG] Remaining unread count after save: " + remainingUnreadCount);
            
            if (errorCount == 0) {
                return new ApiResponse<>(true, "All " + successCount + " notifications marked as read successfully", "success");
            } else {
                return new ApiResponse<>(true, successCount + " notifications marked as read, " + errorCount + " errors occurred", "partial_success");
            }
            
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to mark all notifications as read: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get unread notification count for a user
     */
    public ApiResponse<Long> getUnreadNotificationCount(String userId) {
        try {
            System.out.println("🔔 [DEBUG] Getting unread count for userId: " + userId);
            long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
            System.out.println("🔔 [DEBUG] Unread count result: " + count);
            return new ApiResponse<>(true, "Count retrieved successfully", count);
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get unread count: " + e.getMessage(), 0L);
        }
    }
    
    /**
     * Helper method to create notifications
     */
    private void createNotification(String userId, String listingId, String bidId, String type,
                                  String title, String message, String triggerUserId, 
                                  String triggerUserName, String bidAmount, String gemName) {
        try {
            Notification notification = new Notification(
                userId, listingId, bidId, type, title, message,
                triggerUserId, triggerUserName, bidAmount, gemName
            );
            notificationRepository.save(notification);
            System.out.println("✅ Notification created: " + type + " for user " + userId);
        } catch (Exception e) {
            System.err.println("❌ Error creating notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Helper method to format currency amounts
     */
    private String formatAmount(BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.US);
        formatter.setMaximumFractionDigits(2);
        formatter.setMinimumFractionDigits(0);
        return formatter.format(amount);
    }

    /**
     * Get all bids placed by a specific user
     */
    public ApiResponse<Map<String, Object>> getUserBids(String userId, int page, int size) {
        try {
            // Get all bids for the user
            List<Bid> userBids = bidRepository.findByBidderIdOrderByBidTimeDesc(userId);
            
            // Apply pagination
            int start = page * size;
            int end = Math.min(start + size, userBids.size());
            List<Bid> paginatedBids = userBids.subList(start, end);
            
            // Get enhanced bid information with listing details
            List<Map<String, Object>> enhancedBids = new ArrayList<>();
            
            for (Bid bid : paginatedBids) {
                Map<String, Object> bidInfo = new HashMap<>();
                bidInfo.put("bidId", bid.getId());
                bidInfo.put("listingId", bid.getListingId());
                bidInfo.put("bidAmount", bid.getBidAmount());
                bidInfo.put("currency", bid.getCurrency());
                bidInfo.put("bidTime", bid.getBidTime());
                bidInfo.put("status", bid.getStatus());
                bidInfo.put("message", bid.getMessage());
                
                // Get listing details
                Optional<GemListing> listingOpt = gemListingRepository.findById(bid.getListingId());
                if (listingOpt.isPresent()) {
                    GemListing listing = listingOpt.get();
                    bidInfo.put("gemName", listing.getGemName());
                    bidInfo.put("gemSpecies", listing.getSpecies());
                    bidInfo.put("listingPrice", listing.getPrice());
                    bidInfo.put("sellerName", listing.getUserId()); // This should be username, but we only have userId
                    bidInfo.put("images", listing.getImages());
                    
                    // Get current highest bid for this listing
                    Optional<Bid> currentHighest = bidRepository
                        .findTopByListingIdAndStatusOrderByBidAmountDesc(bid.getListingId(), "ACTIVE");
                    
                    if (currentHighest.isPresent()) {
                        bidInfo.put("currentHighestBid", currentHighest.get().getBidAmount());
                        bidInfo.put("isCurrentlyWinning", currentHighest.get().getId().equals(bid.getId()));
                    } else {
                        bidInfo.put("currentHighestBid", listing.getPrice());
                        bidInfo.put("isCurrentlyWinning", false);
                    }
                }
                
                enhancedBids.add(bidInfo);
            }
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("bids", enhancedBids);
            response.put("totalElements", userBids.size());
            response.put("totalPages", (int) Math.ceil((double) userBids.size() / size));
            response.put("currentPage", page);
            response.put("pageSize", size);
            
            // Calculate statistics
            long activeBids = userBids.stream().filter(bid -> "ACTIVE".equals(bid.getStatus())).count();
            long winningBids = enhancedBids.stream()
                .filter(bid -> Boolean.TRUE.equals(bid.get("isCurrentlyWinning")))
                .count();
            
            response.put("activeBids", activeBids);
            response.put("winningBids", winningBids);
            
            return new ApiResponse<>(true, "User bids retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("Error getting user bids: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get user bids: " + e.getMessage(), null);
        }
    }
    
    /**
     * Handle all notifications for a new bid - covers all user scenarios
     */
    private void handleBidNotifications(Bid newBid, GemListing listing, Bid previousHighestBid) {
        try {
            String listingId = newBid.getListingId();
            String newBidderId = newBid.getBidderId();
            String newBidderName = newBid.getBidderName();
            String newBidAmount = formatAmount(newBid.getBidAmount());
            String gemName = listing.getGemName();
            String sellerId = listing.getUserId();
            
            // 1. Notify the new bidder about their successful bid
            createNotification(
                newBidderId,
                listingId,
                newBid.getId(),
                "BID_PLACED",
                "Bid placed successfully",
                "You have successfully bid LKR " + newBidAmount + " on " + gemName,
                newBidderId,
                newBidderName,
                newBidAmount,
                gemName
            );
            
            // 2. Handle previous highest bidder (if exists)
            if (previousHighestBid != null) {
                // Mark previous bid as OUTBID
                previousHighestBid.setStatus("OUTBID");
                bidRepository.save(previousHighestBid);
                
                // Notify previous highest bidder that they've been outbid
                createNotification(
                    previousHighestBid.getBidderId(),
                    listingId,
                    newBid.getId(),
                    "BID_OUTBID",
                    "Your bid has been outbid",
                    "Your bid of LKR " + formatAmount(previousHighestBid.getBidAmount()) + 
                    " on " + gemName + " has been outbid. New highest bid: LKR " + newBidAmount,
                    newBidderId,
                    newBidderName,
                    newBidAmount,
                    gemName
                );
            }
            
            // 3. Notify seller about the new bid with updated statistics
            long totalBids = bidRepository.countByListingId(listingId);
            String sellerMessage;
            
            if (previousHighestBid != null) {
                sellerMessage = newBidderName + " placed a new highest bid of LKR " + newBidAmount + 
                               " on your " + gemName + " (Total bids: " + totalBids + ")";
            } else {
                sellerMessage = newBidderName + " placed the first bid of LKR " + newBidAmount + 
                               " on your " + gemName;
            }
            
            createNotification(
                sellerId,
                listingId,
                newBid.getId(),
                "NEW_BID",
                "New bid received",
                sellerMessage,
                newBidderId,
                newBidderName,
                newBidAmount,
                gemName
            );
            
            // 4. Notify other bidders (not the current highest or the new bidder) about increased activity
            List<Bid> otherActiveBids = bidRepository.findByListingIdAndStatusAndBidderIdNotIn(
                listingId, 
                "ACTIVE", 
                List.of(newBidderId, previousHighestBid != null ? previousHighestBid.getBidderId() : "")
            );
            
            for (Bid otherBid : otherActiveBids) {
                // Only notify if this bidder hasn't been outbid yet
                if (!otherBid.getBidderId().equals(newBidderId)) {
                    createNotification(
                        otherBid.getBidderId(),
                        listingId,
                        newBid.getId(),
                        "BID_ACTIVITY",
                        "Bidding activity on " + gemName,
                        "New bid activity on " + gemName + ". Current highest bid: LKR " + newBidAmount + 
                        " (Total bids: " + totalBids + ")",
                        newBidderId,
                        newBidderName,
                        newBidAmount,
                        gemName
                    );
                }
            }
            
            System.out.println("✅ All notifications created for bid: " + newBid.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error handling bid notifications: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Delete a notification
     */
    public ApiResponse<String> deleteNotification(String notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isEmpty()) {
                return new ApiResponse<>(false, "Notification not found", null);
            }
            
            notificationRepository.deleteById(notificationId);
            
            return new ApiResponse<>(true, "Notification deleted successfully", "Success");
            
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to delete notification: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get countdown status for a listing
     */
    public ApiResponse<Map<String, Object>> getCountdownStatus(String listingId) {
        try {
            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found", null);
            }
            
            GemListing listing = listingOpt.get();
            Map<String, Object> countdownData = new HashMap<>();
            
            // Always include the listing status in the response
            countdownData.put("listingStatus", listing.getListingStatus());
            
            // ONLY skip countdown for DEFINITIVELY sold or expired items
            if ("sold".equals(listing.getListingStatus())) {
                System.out.println("🛑 Listing " + listingId + " is SOLD - returning no countdown");
                countdownData.put("biddingActive", false);
                countdownData.put("remainingTimeSeconds", 0);
                countdownData.put("isExpired", true);
                return new ApiResponse<>(true, "Listing is sold", countdownData);
            }
            
            if ("expired_no_bids".equals(listing.getListingStatus())) {
                System.out.println("⏰ Listing " + listingId + " is EXPIRED_NO_BIDS - returning no countdown");
                countdownData.put("biddingActive", false);
                countdownData.put("remainingTimeSeconds", 0);
                countdownData.put("isExpired", true);
                return new ApiResponse<>(true, "Listing expired with no bids", countdownData);
            }
            
            // For ALL OTHER CASES (APPROVED, ACTIVE, etc.), process countdown normally
            if (Boolean.TRUE.equals(listing.getBiddingActive())) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime endTime = listing.getBiddingEndTime();
                
                countdownData.put("biddingActive", true);
                countdownData.put("biddingStartTime", listing.getBiddingStartTime());
                countdownData.put("biddingEndTime", endTime);
                
                if (endTime != null && endTime.isAfter(now)) {
                    long remainingSeconds = java.time.Duration.between(now, endTime).getSeconds();
                    countdownData.put("remainingTimeSeconds", remainingSeconds);
                    
                    // Calculate days, hours, minutes, seconds
                    long days = remainingSeconds / (24 * 3600);
                    long hours = (remainingSeconds % (24 * 3600)) / 3600;
                    long minutes = (remainingSeconds % 3600) / 60;
                    long seconds = remainingSeconds % 60;
                    
                    countdownData.put("remainingDays", days);
                    countdownData.put("remainingHours", hours);
                    countdownData.put("remainingMinutes", minutes);
                    countdownData.put("remainingSeconds", seconds);
                    countdownData.put("isExpired", false);
                } else {
                    // Countdown has expired - complete the bidding process
                    countdownData.put("remainingTimeSeconds", 0);
                    countdownData.put("remainingDays", 0);
                    countdownData.put("remainingHours", 0);
                    countdownData.put("remainingMinutes", 0);
                    countdownData.put("remainingSeconds", 0);
                    countdownData.put("isExpired", true);
                    
                    // Complete the bidding process if not already completed
                    if (Boolean.TRUE.equals(listing.getBiddingActive())) {
                        System.out.println("⏰ Countdown expired for listing: " + listingId + " - completing bidding process");
                        
                        // Find the highest bid
                        Optional<Bid> winningBidOpt = bidRepository.findTopByListingIdOrderByBidAmountDesc(listing.getId());
                        
                        if (winningBidOpt.isPresent()) {
                            Bid winningBid = winningBidOpt.get();
                            System.out.println("👑 Found winning bid: " + winningBid.getBidAmount() + " by user: " + winningBid.getBidderId());
                            
                            // Complete the bidding process
                            boolean completed = completeBidding(listing, winningBid);
                            if (completed) {
                                System.out.println("✅ Successfully completed bidding for listing: " + listingId);
                            }
                        } else {
                            // No bids - mark as expired
                            System.out.println("⏳ No bids found for expired listing: " + listingId + " - marking as expired_no_bids");
                            listing.setBiddingActive(false);
                            listing.setListingStatus("expired_no_bids");
                            listing.setBiddingCompletedAt(LocalDateTime.now());
                            gemListingRepository.save(listing);
                        }
                    }
                }
            } else {
                countdownData.put("biddingActive", false);
                countdownData.put("remainingTimeSeconds", 0);
                countdownData.put("isExpired", false);
            }
            
            // Always include the listing status in the response
            countdownData.put("listingStatus", listing.getListingStatus());
            
            return new ApiResponse<>(true, "Countdown status retrieved successfully", countdownData);
            
        } catch (Exception e) {
            System.err.println("Error getting countdown status: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get countdown status: " + e.getMessage(), null);
        }
    }
    
    /**
     * Utility method to activate countdown for all listings that have bids but no active countdown
     */
    public ApiResponse<Map<String, Object>> activateCountdownForExistingListings() {
        try {
            System.out.println("🛠️ [UTILITY] Starting countdown activation for existing listings");
            
            // Get all gem listings
            List<GemListing> allListings = gemListingRepository.findAll();
            int activatedCount = 0;
            int processedCount = 0;
            
            for (GemListing listing : allListings) {
                processedCount++;
                
                // Check if listing has bids but no active countdown
                long bidCount = bidRepository.countByListingId(listing.getId());
                
                if (bidCount > 0 && !Boolean.TRUE.equals(listing.getBiddingActive())) {
                    // Activate countdown
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime endTime = now.plusDays(4); // 4 days from now
                    
                    listing.setBiddingStartTime(now);
                    listing.setBiddingEndTime(endTime);
                    listing.setBiddingActive(true);
                    
                    gemListingRepository.save(listing);
                    activatedCount++;
                    
                    System.out.println("🕒 Activated 4-day countdown for listing: " + listing.getId() + 
                                     " (has " + bidCount + " bids)");
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("processedListings", processedCount);
            result.put("activatedCountdowns", activatedCount);
            result.put("message", "Activated countdown for " + activatedCount + " listings out of " + processedCount + " processed");
            
            System.out.println("✅ [UTILITY] Countdown activation completed: " + activatedCount + "/" + processedCount);
            
            return new ApiResponse<>(true, "Countdown activation completed successfully", result);
            
        } catch (Exception e) {
            System.err.println("Error activating countdown for existing listings: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to activate countdown: " + e.getMessage(), null);
        }
    }

    /**
     * Process expired bids and complete transactions
     */
    public ApiResponse<Map<String, Object>> processExpiredBids() {
        try {
            System.out.println("🔄 Processing expired bids...");
            
            LocalDateTime now = LocalDateTime.now();
            List<GemListing> expiredListings = gemListingRepository.findByBiddingActiveTrueAndBiddingEndTimeBefore(now);
            
            int processedCount = 0;
            int completedCount = 0;
            List<String> completedListingIds = new ArrayList<>();
            
            for (GemListing listing : expiredListings) {
                processedCount++;
                System.out.println("🕒 Processing expired listing: " + listing.getId());
                
                // Find the highest bid for this listing
                Optional<Bid> highestBidOpt = bidRepository.findTopByListingIdOrderByBidAmountDesc(listing.getId());
                
                if (highestBidOpt.isPresent()) {
                    Bid winningBid = highestBidOpt.get();
                    
                    // Complete the bidding process
                    boolean completed = completeBidding(listing, winningBid);
                    if (completed) {
                        completedCount++;
                        completedListingIds.add(listing.getId());
                    }
                } else {
                    // No bids found, just deactivate the listing
                    listing.setBiddingActive(false);
                    listing.setListingStatus("expired_no_bids");
                    gemListingRepository.save(listing);
                    System.out.println("⚠️ No bids found for expired listing: " + listing.getId());
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("processedCount", processedCount);
            result.put("completedCount", completedCount);
            result.put("completedListings", completedListingIds);
            
            System.out.println("✅ Expired bids processing completed: " + completedCount + "/" + processedCount);
            return new ApiResponse<>(true, "Expired bids processed successfully", result);
            
        } catch (Exception e) {
            System.err.println("Error processing expired bids: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to process expired bids: " + e.getMessage(), null);
        }
    }

    /**
     * Complete a bidding transaction
     */
    private boolean completeBidding(GemListing listing, Bid winningBid) {
        try {
            System.out.println("🎯 Completing bidding for listing: " + listing.getId() + 
                             " Winner: " + winningBid.getBidderId() + 
                             " Amount: $" + winningBid.getBidAmount());

            // Update listing status
            listing.setBiddingActive(false);
            listing.setListingStatus("sold");
            listing.setBiddingCompletedAt(LocalDateTime.now());
            listing.setWinningBidderId(winningBid.getBidderId());
            listing.setFinalPrice(winningBid.getBidAmount());

            // Save the updated listing
            gemListingRepository.save(listing);

            // Create purchase history entry
            createPurchaseHistoryEntry(listing, winningBid);

            // Send notifications
            sendBiddingCompletionNotifications(listing, winningBid);

            System.out.println("✅ Bidding completed successfully for listing: " + listing.getId());
            return true;

        } catch (Exception e) {
            System.err.println("Error completing bidding for listing " + listing.getId() + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Create purchase history entry
     */
    private void createPurchaseHistoryEntry(GemListing listing, Bid winningBid) {
        try {
            // For now, we'll use the notification system to track purchases
            // Later this can be expanded to a dedicated PurchaseHistory entity
            
            System.out.println("📝 Creating purchase history entry for listing: " + listing.getId());
            
            // We can add purchase history logic here when the entity is created
            // For now, the completed listing with winner info serves as the record
            
        } catch (Exception e) {
            System.err.println("Error creating purchase history entry: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send notifications for completed bidding
     */
    private void sendBiddingCompletionNotifications(GemListing listing, Bid winningBid) {
        try {
            System.out.println("📤 Sending completion notifications for listing: " + listing.getId());
            
            String bidAmountFormatted = formatAmount(winningBid.getBidAmount());
            String gemName = listing.getGemName();
            String listingId = listing.getId();
            String winningBidderId = winningBid.getBidderId();
            String winningBidderName = winningBid.getBidderName();
            String sellerId = listing.getUserId();

            // Notification to the winner (buyer) - BID WON
            System.out.println("🎉 Creating winner notification for user: " + winningBidderId);
            createNotification(
                winningBidderId,
                listingId,
                winningBid.getId(),
                "BID_WON",
                "🎉 Congratulations! You won the bid!",
                "You successfully won the bid for " + gemName + 
                " with a winning bid of LKR " + bidAmountFormatted + 
                ". The item has been added to your Purchase History. Congratulations on your successful purchase!",
                winningBidderId,
                winningBidderName,
                bidAmountFormatted,
                gemName
            );

            // Notification to the seller - ITEM SOLD
            System.out.println("💰 Creating seller notification for user: " + sellerId);
            createNotification(
                sellerId,
                listingId,
                winningBid.getId(),
                "ITEM_SOLD",
                "💰 Your item has been sold!",
                "Your " + gemName + " has been sold for LKR " + bidAmountFormatted + 
                ". Buyer: " + winningBidderName + ". The bidding has completed successfully and the transaction is now complete.",
                winningBidderId,
                winningBidderName,
                bidAmountFormatted,
                gemName
            );

            // Also notify other bidders that the bidding has ended (if any)
            System.out.println("📢 Notifying other bidders about bidding completion...");
            List<Bid> otherBids = bidRepository.findByListingIdAndBidderIdNotAndStatus(
                listingId, 
                winningBidderId, 
                "ACTIVE"
            );
            
            for (Bid otherBid : otherBids) {
                createNotification(
                    otherBid.getBidderId(),
                    listingId,
                    winningBid.getId(),
                    "BIDDING_ENDED",
                    "⏰ Bidding has ended",
                    "The bidding for " + gemName + " has ended. The winning bid was LKR " + 
                    bidAmountFormatted + " by " + winningBidderName + ". Thank you for participating in the auction.",
                    winningBidderId,
                    winningBidderName,
                    bidAmountFormatted,
                    gemName
                );
            }

            System.out.println("✅ All completion notifications sent successfully");
            System.out.println("   - Winner notification sent to: " + winningBidderId);
            System.out.println("   - Seller notification sent to: " + sellerId);
            System.out.println("   - Other bidder notifications: " + otherBids.size());

        } catch (Exception e) {
            System.err.println("❌ Error sending completion notifications: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get completed/purchased items for a user (for Purchase History)
     */
    public ApiResponse<List<Map<String, Object>>> getPurchaseHistory(String userId) {
        try {
            System.out.println("📋 Getting purchase history for user: " + userId);

            // Find all listings where this user was the winning bidder and status is sold or expired_no_bids
            List<GemListing> soldListings = gemListingRepository
                .findByWinningBidderIdAndListingStatus(userId, "sold");
            
            List<GemListing> expiredListings = gemListingRepository
                .findByWinningBidderIdAndListingStatus(userId, "expired_no_bids");

            System.out.println("📋 Found " + soldListings.size() + " listings with status 'sold'");
            System.out.println("📋 Found " + expiredListings.size() + " listings with status 'expired_no_bids'");

            // Combine both lists
            List<GemListing> purchasedListings = new ArrayList<>();
            purchasedListings.addAll(soldListings);
            purchasedListings.addAll(expiredListings);

            System.out.println("📋 Total purchased listings: " + purchasedListings.size());

            // If no items found, also check for any listings with this user as winningBidderId regardless of status
            if (purchasedListings.isEmpty()) {
                System.out.println("📋 No purchased listings found, checking for any listings with winningBidderId...");
                List<GemListing> anyWinningListings = gemListingRepository.findByWinningBidderId(userId);
                System.out.println("📋 Found " + anyWinningListings.size() + " listings with winningBidderId: " + userId);
                
                // Log the status of each listing found
                for (GemListing listing : anyWinningListings) {
                    System.out.println("📋 Listing " + listing.getId() + " has status: '" + listing.getListingStatus() + 
                                     "', biddingCompleted: " + listing.getBiddingCompletedAt() + 
                                     ", finalPrice: " + listing.getFinalPrice());
                }
            }

            List<Map<String, Object>> purchaseHistory = new ArrayList<>();

            for (GemListing listing : purchasedListings) {
                Map<String, Object> purchaseItem = new HashMap<>();
                purchaseItem.put("id", listing.getId());
                purchaseItem.put("gemType", listing.getVariety()); // Using variety as gem type
                purchaseItem.put("gemName", listing.getGemName());
                purchaseItem.put("finalPrice", listing.getFinalPrice());
                purchaseItem.put("purchaseDate", listing.getBiddingCompletedAt());
                purchaseItem.put("sellerId", listing.getUserId()); // Use userId as sellerId
                purchaseItem.put("images", listing.getImages());
                purchaseItem.put("primaryImageUrl", listing.getPrimaryImageUrl());
                purchaseItem.put("weight", listing.getWeight());
                purchaseItem.put("clarity", listing.getClarity());
                purchaseItem.put("color", listing.getColor());
                purchaseItem.put("cut", listing.getCut());

                purchaseHistory.add(purchaseItem);
                System.out.println("📋 Added purchase item: " + listing.getGemName() + " for $" + listing.getFinalPrice());
            }

            System.out.println("✅ Found " + purchaseHistory.size() + " purchased items for user: " + userId);
            return new ApiResponse<>(true, "Purchase history retrieved successfully", purchaseHistory);

        } catch (Exception e) {
            System.err.println("Error getting purchase history: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get purchase history: " + e.getMessage(), null);
        }
    }

    /**
     * Reduce countdown time for testing purposes
     * @param listingId The listing ID to reduce countdown for
     * @param reduceByMinutes The number of minutes to reduce the countdown by
     */
    public ApiResponse<Map<String, Object>> reduceCountdownForTesting(String listingId, long reduceByMinutes) {
        try {
            System.out.println("🧪 [TESTING] Reducing countdown for listing: " + listingId + " by " + reduceByMinutes + " minutes");

            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found", null);
            }

            GemListing listing = listingOpt.get();
            
            if (!Boolean.TRUE.equals(listing.getBiddingActive())) {
                return new ApiResponse<>(false, "Bidding is not active for this listing", null);
            }

            LocalDateTime currentEndTime = listing.getBiddingEndTime();
            if (currentEndTime == null) {
                return new ApiResponse<>(false, "No countdown is set for this listing", null);
            }

            // Reduce the countdown by the specified minutes
            LocalDateTime newEndTime = currentEndTime.minusMinutes(reduceByMinutes);
            LocalDateTime now = LocalDateTime.now();

            // Ensure the new end time is not in the past (minimum 30 seconds from now)
            if (newEndTime.isBefore(now.plusSeconds(30))) {
                newEndTime = now.plusSeconds(30);
                System.out.println("⚠️ [TESTING] Adjusted minimum time to 30 seconds from now");
            }

            listing.setBiddingEndTime(newEndTime);
            gemListingRepository.save(listing);

            // Calculate remaining time
            long remainingSeconds = java.time.Duration.between(now, newEndTime).getSeconds();
            long days = remainingSeconds / (24 * 3600);
            long hours = (remainingSeconds % (24 * 3600)) / 3600;
            long minutes = (remainingSeconds % 3600) / 60;
            long seconds = remainingSeconds % 60;

            Map<String, Object> result = new HashMap<>();
            result.put("listingId", listingId);
            result.put("originalEndTime", currentEndTime);
            result.put("newEndTime", newEndTime);
            result.put("reducedByMinutes", reduceByMinutes);
            result.put("remainingTimeSeconds", remainingSeconds);
            result.put("remainingDays", days);
            result.put("remainingHours", hours);
            result.put("remainingMinutes", minutes);
            result.put("remainingSeconds", seconds);

            System.out.println("✅ [TESTING] Countdown reduced successfully");
            System.out.println("   Original end time: " + currentEndTime);
            System.out.println("   New end time: " + newEndTime);
            System.out.println("   Remaining time: " + days + "d " + hours + "h " + minutes + "m " + seconds + "s");

            return new ApiResponse<>(true, "Countdown reduced successfully for testing", result);

        } catch (Exception e) {
            System.err.println("Error reducing countdown: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to reduce countdown: " + e.getMessage(), null);
        }
    }

    /**
     * Create test purchase data for development/testing purposes
     * @param userId The user ID who will be the buyer
     * @param listingId The listing ID to mark as sold
     */
    public ApiResponse<String> createTestPurchase(String userId, String listingId) {
        try {
            System.out.println("🧪 [TESTING] Creating test purchase for user: " + userId + ", listing: " + listingId);

            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found", null);
            }

            GemListing listing = listingOpt.get();
            
            // Create a mock winning bid amount (10% higher than listing price)
            BigDecimal mockBidAmount = listing.getPrice().multiply(new BigDecimal("1.10"));
            
            // Update listing to mark as sold
            listing.setBiddingActive(false);
            listing.setListingStatus("sold");
            listing.setBiddingCompletedAt(LocalDateTime.now());
            listing.setWinningBidderId(userId);
            listing.setFinalPrice(mockBidAmount);

            // Save the updated listing
            gemListingRepository.save(listing);

            System.out.println("✅ [TESTING] Test purchase created successfully");
            System.out.println("   Listing: " + listing.getGemName() + " (ID: " + listingId + ")");
            System.out.println("   Buyer: " + userId);
            System.out.println("   Final Price: $" + mockBidAmount);
            System.out.println("   Status: " + listing.getListingStatus());

            return new ApiResponse<>(true, "Test purchase created successfully", "Purchase created for " + listing.getGemName());

        } catch (Exception e) {
            System.err.println("Error creating test purchase: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to create test purchase: " + e.getMessage(), null);
        }
    }
    
    /**
     * Complete bidding for a specific listing (for testing notifications)
     * @param listingId The listing ID to complete bidding for
     */
    public ApiResponse<String> completeBiddingForTesting(String listingId) {
        try {
            System.out.println("🧪 [TESTING] Completing bidding for listing: " + listingId);

            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found", null);
            }

            GemListing listing = listingOpt.get();
            
            // Find the highest bid for this listing
            Optional<Bid> highestBidOpt = bidRepository.findTopByListingIdOrderByBidAmountDesc(listingId);
            
            if (highestBidOpt.isEmpty()) {
                return new ApiResponse<>(false, "No bids found for this listing", null);
            }

            Bid winningBid = highestBidOpt.get();
            
            // Complete the bidding process with proper notifications
            boolean completed = completeBidding(listing, winningBid);
            
            if (completed) {
                System.out.println("✅ [TESTING] Bidding completed successfully with notifications");
                System.out.println("   Listing: " + listing.getGemName() + " (ID: " + listingId + ")");
                System.out.println("   Winner: " + winningBid.getBidderName() + " (ID: " + winningBid.getBidderId() + ")");
                System.out.println("   Winning Bid: LKR " + winningBid.getBidAmount());
                
                return new ApiResponse<>(true, "Bidding completed successfully with notifications", 
                    "Winner: " + winningBid.getBidderName() + " with bid of LKR " + winningBid.getBidAmount());
            } else {
                return new ApiResponse<>(false, "Failed to complete bidding process", null);
            }

        } catch (Exception e) {
            System.err.println("Error completing bidding for testing: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to complete bidding: " + e.getMessage(), null);
        }
    }

    /**
     * Complete bidding for any active listing (for testing only - no listingId needed)
     */
    public ApiResponse<String> completeAnyBiddingForTesting() {
        try {
            System.out.println("🧪 [TESTING] Finding active listings to complete...");

            // Find all active bidding listings
            List<GemListing> activeListings = gemListingRepository.findByBiddingActiveTrue();
            System.out.println("🧪 [TESTING] Found " + activeListings.size() + " active bidding listings");

            if (activeListings.isEmpty()) {
                return new ApiResponse<>(false, "No active bidding listings found to complete", null);
            }

            int completedCount = 0;
            for (GemListing listing : activeListings.subList(0, Math.min(3, activeListings.size()))) { // Complete max 3 for testing
                // Find the highest bid for this listing
                Optional<Bid> winningBidOpt = bidRepository.findTopByListingIdOrderByBidAmountDesc(listing.getId());
                
                if (winningBidOpt.isEmpty()) {
                    System.out.println("🧪 [TESTING] No bids found for listing: " + listing.getId());
                    continue;
                }

                Bid winningBid = winningBidOpt.get();
                System.out.println("🧪 [TESTING] Completing bidding for listing: " + listing.getId() + 
                                   " with winning bid from: " + winningBid.getBidderId() + 
                                   " Amount: $" + winningBid.getBidAmount());

                // Update listing status
                listing.setBiddingActive(false);
                listing.setListingStatus("sold");
                listing.setBiddingCompletedAt(LocalDateTime.now());
                listing.setWinningBidderId(winningBid.getBidderId());
                listing.setFinalPrice(winningBid.getBidAmount());

                // Save the updated listing
                gemListingRepository.save(listing);

                // Send notifications
                sendBiddingCompletionNotifications(listing, winningBid);

                completedCount++;
                System.out.println("🧪 [TESTING] ✅ Completed bidding for listing: " + listing.getId());
            }

            System.out.println("🧪 [TESTING] ✅ Completed " + completedCount + " bidding processes");
            return new ApiResponse<>(true, "Completed " + completedCount + " bidding processes for testing", 
                                   "Completed biddings: " + completedCount);

        } catch (Exception e) {
            System.err.println("🧪 [TESTING] Error completing bidding: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to complete bidding for testing: " + e.getMessage(), null);
        }
    }

    /**
     * Fix sold items that still have biddingActive=true
     */
    public ApiResponse<Map<String, Object>> fixSoldItemsWithActiveBidding() {
        try {
            System.out.println("🔧 [FIX] Starting to fix sold items with active bidding");

            // Find all listings with status 'sold' but biddingActive = true
            List<GemListing> problemListings = gemListingRepository.findAll().stream()
                .filter(listing -> "sold".equals(listing.getListingStatus()) && Boolean.TRUE.equals(listing.getBiddingActive()))
                .collect(java.util.stream.Collectors.toList());

            System.out.println("🔧 [FIX] Found " + problemListings.size() + " sold items with active bidding");

            int fixedCount = 0;
            for (GemListing listing : problemListings) {
                System.out.println("🔧 [FIX] Fixing listing: " + listing.getId() + " - " + listing.getGemName());
                
                // Set bidding to inactive
                listing.setBiddingActive(false);
                
                // Ensure bidding completed timestamp is set
                if (listing.getBiddingCompletedAt() == null) {
                    listing.setBiddingCompletedAt(LocalDateTime.now());
                }
                
                // Save the fix
                gemListingRepository.save(listing);
                fixedCount++;
                
                System.out.println("✅ [FIX] Fixed listing: " + listing.getId());
            }

            Map<String, Object> result = new HashMap<>();
            result.put("problemItemsFound", problemListings.size());
            result.put("itemsFixed", fixedCount);
            result.put("timestamp", LocalDateTime.now().toString());

            System.out.println("✅ [FIX] Completed fixing " + fixedCount + " sold items");
            return new ApiResponse<>(true, "Fixed " + fixedCount + " sold items with active bidding", result);

        } catch (Exception e) {
            System.err.println("🔧 [FIX] Error fixing sold items: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to fix sold items: " + e.getMessage(), null);
        }
    }

    /**
     * Create test purchase data for a user (for testing purposes)
     */
    public ApiResponse<Map<String, Object>> createTestPurchaseData(String userId) {
        try {
            System.out.println("🧪 [TEST] Creating test purchase data for user: " + userId);

            // Find some active listings to mark as sold to this user
            List<GemListing> activeListings = gemListingRepository.findByListingStatus("active");
            
            if (activeListings.isEmpty()) {
                return new ApiResponse<>(false, "No active listings found to create test purchases", null);
            }

            int created = 0;
            Map<String, Object> result = new HashMap<>();
            List<String> createdPurchases = new ArrayList<>();

            // Create up to 3 test purchases
            for (int i = 0; i < Math.min(3, activeListings.size()); i++) {
                GemListing listing = activeListings.get(i);
                
                // Mark as sold to the test user
                listing.setListingStatus("sold");
                listing.setWinningBidderId(userId);
                listing.setBiddingActive(false);
                listing.setBiddingCompletedAt(LocalDateTime.now());
                
                // Set a realistic final price (starting price + some amount)
                BigDecimal finalPrice = listing.getPrice() != null ? 
                    listing.getPrice().add(BigDecimal.valueOf((Math.random() * 50000) + 10000)) : 
                    BigDecimal.valueOf(50000.0 + (Math.random() * 100000));
                listing.setFinalPrice(finalPrice);

                gemListingRepository.save(listing);
                
                created++;
                createdPurchases.add(listing.getId() + " (" + listing.getGemName() + ") - LKR " + finalPrice.intValue());
                
                System.out.println("🧪 Created test purchase: " + listing.getGemName() + " for user " + userId + " at LKR " + finalPrice.intValue());
            }

            result.put("createdCount", created);
            result.put("purchases", createdPurchases);
            result.put("userId", userId);

            System.out.println("✅ [TEST] Created " + created + " test purchases for user: " + userId);
            return new ApiResponse<>(true, "Created " + created + " test purchases for user " + userId, result);

        } catch (Exception e) {
            System.err.println("🧪 [TEST] Error creating test purchase data: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to create test purchase data: " + e.getMessage(), null);
        }
    }

    /**
     * Reset purchase data for a user (for testing purposes)
     */
    public ApiResponse<Map<String, Object>> resetUserPurchases(String userId) {
        try {
            System.out.println("🧪 [TEST] Resetting purchases for user: " + userId);

            // Find all listings where this user is the winning bidder
            List<GemListing> userPurchases = gemListingRepository.findByWinningBidderId(userId);
            
            int resetCount = 0;
            for (GemListing listing : userPurchases) {
                // Reset to active status
                listing.setListingStatus("active");
                listing.setWinningBidderId(null);
                listing.setBiddingActive(true);
                listing.setBiddingCompletedAt(null);
                listing.setFinalPrice(null);
                
                gemListingRepository.save(listing);
                resetCount++;
                
                System.out.println("🧪 Reset listing: " + listing.getGemName() + " back to active");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("resetCount", resetCount);
            result.put("userId", userId);

            System.out.println("✅ [TEST] Reset " + resetCount + " purchases for user: " + userId);
            return new ApiResponse<>(true, "Reset " + resetCount + " purchases for user " + userId, result);

        } catch (Exception e) {
            System.err.println("🧪 [TEST] Error resetting user purchases: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to reset user purchases: " + e.getMessage(), null);
        }
    }

    /**
     * Link all SOLD items to a specific buyer to fix purchase history
     */
    public ApiResponse<Map<String, Object>> linkAllSoldItemsToBuyer(String userId, String userEmail) {
        System.out.println("🔗 [FIX] Starting to link all SOLD items to buyer: " + userId);
        
        try {
            // Find all SOLD listings
            List<GemListing> allListings = gemListingRepository.findAll();
            List<GemListing> soldListings = allListings.stream()
                .filter(listing -> 
                    "SOLD".equalsIgnoreCase(listing.getListingStatus()) || 
                    "sold".equalsIgnoreCase(listing.getListingStatus()) ||
                    (listing.getBiddingActive() != null && !listing.getBiddingActive() && listing.getBiddingCompletedAt() != null)
                )
                .collect(Collectors.toList());

            System.out.println("🔍 Found " + soldListings.size() + " SOLD listings to link to buyer");

            if (soldListings.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("linkedCount", 0);
                result.put("message", "No SOLD items found to link");
                return new ApiResponse<>(true, "No SOLD items found to link", result);
            }

            int linkedCount = 0;
            List<String> linkedItems = new ArrayList<>();

            for (GemListing listing : soldListings) {
                // Set the winning bidder to the current user
                listing.setWinningBidderId(userId);
                listing.setListingStatus("SOLD");
                listing.setListingStatus("sold");
                listing.setBiddingActive(false);
                
                // Set completion time if not already set
                if (listing.getBiddingCompletedAt() == null) {
                    listing.setBiddingCompletedAt(LocalDateTime.now());
                }
                
                // Set final price if not already set
                if (listing.getFinalPrice() == null) {
                    BigDecimal finalPrice = listing.getPrice() != null ? 
                        listing.getPrice() : BigDecimal.valueOf(50000);
                    listing.setFinalPrice(finalPrice);
                }

                // Save the updated listing
                gemListingRepository.save(listing);
                
                linkedCount++;
                linkedItems.add(listing.getGemName() + " (LKR " + listing.getFinalPrice() + ")");
                
                System.out.println("🔗 Linked: " + listing.getGemName() + " to buyer " + userId);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("linkedCount", linkedCount);
            result.put("userId", userId);
            result.put("userEmail", userEmail);
            result.put("linkedItems", linkedItems);
            result.put("message", "Successfully linked " + linkedCount + " SOLD items to buyer");

            System.out.println("✅ [FIX] Successfully linked " + linkedCount + " SOLD items to buyer: " + userId);
            return new ApiResponse<>(true, "Successfully linked " + linkedCount + " SOLD items to buyer", result);

        } catch (Exception e) {
            System.err.println("🔗 [FIX] Error linking SOLD items to buyer: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to link SOLD items to buyer: " + e.getMessage(), null);
        }
    }

    /**
     * Update the winning bidder for a specific listing
     */
    public ApiResponse<Map<String, Object>> updateWinningBidder(String listingId, String winningBidderId, Object finalPriceObj) {
        try {
            System.out.println("🔧 Updating winning bidder for listing: " + listingId);
            System.out.println("🔧 New winning bidder ID: " + winningBidderId);

            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (listingOpt.isEmpty()) {
                return new ApiResponse<>(false, "Listing not found with ID: " + listingId, null);
            }

            GemListing listing = listingOpt.get();
            
            // Update the winning bidder
            listing.setWinningBidderId(winningBidderId);
            
            // Ensure status is sold
            if (!"sold".equals(listing.getListingStatus())) {
                listing.setListingStatus("sold");
            }
            
            // Set bidding as inactive
            listing.setBiddingActive(false);
            
            // Set completion time if not already set
            if (listing.getBiddingCompletedAt() == null) {
                listing.setBiddingCompletedAt(LocalDateTime.now());
            }
            
            // Update final price if provided
            if (finalPriceObj != null) {
                BigDecimal finalPrice = null;
                if (finalPriceObj instanceof Number) {
                    finalPrice = BigDecimal.valueOf(((Number) finalPriceObj).doubleValue());
                } else if (finalPriceObj instanceof String) {
                    try {
                        finalPrice = new BigDecimal((String) finalPriceObj);
                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ Invalid final price format: " + finalPriceObj);
                    }
                }
                
                if (finalPrice != null) {
                    listing.setFinalPrice(finalPrice);
                }
            }
            
            // Ensure final price is set (use listing price as fallback)
            if (listing.getFinalPrice() == null) {
                listing.setFinalPrice(listing.getPrice());
            }

            // Save the updated listing
            GemListing savedListing = gemListingRepository.save(listing);

            Map<String, Object> result = new HashMap<>();
            result.put("listingId", savedListing.getId());
            result.put("gemName", savedListing.getGemName());
            result.put("winningBidderId", savedListing.getWinningBidderId());
            result.put("finalPrice", savedListing.getFinalPrice());
            result.put("listingStatus", savedListing.getListingStatus());
            result.put("biddingCompletedAt", savedListing.getBiddingCompletedAt());

            System.out.println("✅ Successfully updated winning bidder for: " + savedListing.getGemName());
            return new ApiResponse<>(true, "Winning bidder updated successfully", result);

        } catch (Exception e) {
            System.err.println("❌ Error updating winning bidder: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to update winning bidder: " + e.getMessage(), null);
        }
    }
}
