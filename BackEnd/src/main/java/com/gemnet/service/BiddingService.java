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
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notificationsPage = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);
            
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notificationsPage.getContent());
            response.put("totalElements", notificationsPage.getTotalElements());
            response.put("totalPages", notificationsPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("unreadCount", unreadCount);
            
            return new ApiResponse<>(true, "Notifications retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("Error getting notifications: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get notifications: " + e.getMessage(), null);
        }
    }
    
    /**
     * Mark notification as read
     */
    public ApiResponse<String> markNotificationAsRead(String notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isEmpty()) {
                return new ApiResponse<>(false, "Notification not found", null);
            }
            
            Notification notification = notificationOpt.get();
            notification.markAsRead();
            notificationRepository.save(notification);
            
            return new ApiResponse<>(true, "Notification marked as read", "success");
            
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to mark notification as read: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get unread notification count for a user
     */
    public ApiResponse<Long> getUnreadNotificationCount(String userId) {
        try {
            long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
            return new ApiResponse<>(true, "Count retrieved successfully", count);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
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
}
