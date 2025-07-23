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
                    
                    System.out.println("🕒 Activated countdown for existing listing with bids: " + listing.getId());
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
                    // Countdown has expired
                    countdownData.put("remainingTimeSeconds", 0);
                    countdownData.put("remainingDays", 0);
                    countdownData.put("remainingHours", 0);
                    countdownData.put("remainingMinutes", 0);
                    countdownData.put("remainingSeconds", 0);
                    countdownData.put("isExpired", true);
                    
                    // Mark bidding as inactive if expired
                    listing.setBiddingActive(false);
                    gemListingRepository.save(listing);
                }
            } else {
                countdownData.put("biddingActive", false);
                countdownData.put("remainingTimeSeconds", 0);
                countdownData.put("isExpired", false);
            }
            
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
                    
                    System.out.println("🕒 Activated countdown for listing: " + listing.getId() + 
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
}
