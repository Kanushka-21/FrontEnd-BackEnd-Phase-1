package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.model.Notification;
import com.gemnet.model.User;
import com.gemnet.model.Feedback;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.repository.NotificationRepository;
import com.gemnet.repository.UserRepository;
import com.gemnet.repository.AdvertisementRepository;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.BidRepository;
import com.gemnet.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for admin operations
 */
@Service
public class AdminService {

    @Autowired
    private GemListingRepository gemListingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    /**
     * Get pending gemstone listings for admin approval
     */
    public ApiResponse<Map<String, Object>> getPendingListings(Pageable pageable) {
        try {
            System.out.println("🔍 AdminService - Getting pending listings");
            
            // Fetch pending listings from database
            Page<GemListing> pendingListingsPage = gemListingRepository.findPendingApprovalListings(pageable);
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listings", pendingListingsPage.getContent());
            responseData.put("currentPage", pendingListingsPage.getNumber());
            responseData.put("totalPages", pendingListingsPage.getTotalPages());
            responseData.put("totalElements", pendingListingsPage.getTotalElements());
            responseData.put("pageSize", pendingListingsPage.getSize());
            responseData.put("hasNext", pendingListingsPage.hasNext());
            responseData.put("hasPrevious", pendingListingsPage.hasPrevious());
            
            System.out.println("✅ Retrieved " + pendingListingsPage.getNumberOfElements() + 
                             " pending listings out of " + pendingListingsPage.getTotalElements() + " total");
            
            return ApiResponse.success("Pending listings retrieved successfully", responseData);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting pending listings: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve pending listings: " + e.getMessage());
        }
    }

    /**
     * Update listing status (approve or reject)
     */
    public ApiResponse<Map<String, Object>> updateListingStatus(String listingId, String newStatus, String adminComment) {
        try {
            System.out.println("📝 AdminService - Updating listing status");
            System.out.println("🆔 Listing ID: " + listingId);
            System.out.println("📊 New Status: " + newStatus);
            
            // Find the listing
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                System.err.println("❌ Listing not found with ID: " + listingId);
                return ApiResponse.error("Listing not found with ID: " + listingId);
            }
            
            GemListing listing = optionalListing.get();
            
            // Check if listing is in PENDING status
            if (!"PENDING".equals(listing.getListingStatus())) {
                System.err.println("❌ Listing is not in PENDING status. Current status: " + listing.getListingStatus());
                return ApiResponse.error("Only pending listings can be approved or rejected. Current status: " + listing.getListingStatus());
            }
            
            // Update the listing status
            String oldStatus = listing.getListingStatus();
            listing.setListingStatus(newStatus);
            listing.setUpdatedAt(LocalDateTime.now());
            
            // Save updated listing
            GemListing updatedListing = gemListingRepository.save(listing);
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listingId", listingId);
            responseData.put("oldStatus", oldStatus);
            responseData.put("newStatus", newStatus);
            responseData.put("updatedAt", updatedListing.getUpdatedAt());
            responseData.put("gemName", updatedListing.getGemName());
            responseData.put("seller", updatedListing.getUserName());
            
            if (adminComment != null && !adminComment.trim().isEmpty()) {
                responseData.put("adminComment", adminComment);
            }
            
            System.out.println("✅ Listing status updated successfully from " + oldStatus + " to " + newStatus);
            
            String successMessage = "APPROVED".equals(newStatus) ? 
                "Listing approved successfully" : "Listing rejected successfully";
            
            return ApiResponse.success(successMessage, responseData);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error updating listing status: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to update listing status: " + e.getMessage());
        }
    }

    /**
     * Get homepage statistics (public-facing simplified stats)
     */
    public ApiResponse<Map<String, Object>> getHomepageStats() {
        try {
            System.out.println("🏠 AdminService - Getting homepage statistics");
            
            // ===== BASIC STATISTICS FOR HOMEPAGE =====
            // Get ALL listings (not just approved) to count certified vs uncertified
            List<GemListing> allListings = gemListingRepository.findAll();
            
            // Count certified gems (listings with certificates)
            long certifiedGems = allListings.stream()
                .filter(listing -> listing.getIsCertified() != null && listing.getIsCertified())
                .count();
                
            // Count uncertified gems (listings without certificates)  
            long uncertifiedGems = allListings.stream()
                .filter(listing -> listing.getIsCertified() == null || !listing.getIsCertified())
                .count();
            
            // Get total count of all listings in database
            long totalListings = gemListingRepository.count();
            long activeTraders = userRepository.countByIsVerified(true);
            long successfulSales = gemListingRepository.countByListingStatus("SOLD");
            
            // ===== PREPARE HOMEPAGE RESPONSE =====
            Map<String, Object> homepageStats = new HashMap<>();
            
            // Core homepage statistics
            homepageStats.put("verifiedGems", certifiedGems);
            homepageStats.put("uncertifiedGems", uncertifiedGems);
            homepageStats.put("totalListings", totalListings);
            homepageStats.put("activeTraders", activeTraders);
            homepageStats.put("successfulSales", successfulSales);
            
            homepageStats.put("lastUpdated", LocalDateTime.now());
            
            System.out.println("✅ Homepage stats retrieved: " + 
                             "Certified Gems=" + certifiedGems + 
                             ", Uncertified Gems=" + uncertifiedGems + 
                             ", Total Listings=" + totalListings +
                             ", Active Traders=" + activeTraders + 
                             ", Successful Sales=" + successfulSales);
            
            return ApiResponse.success("Homepage statistics retrieved successfully", homepageStats);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting homepage stats: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve homepage statistics: " + e.getMessage());
        }
    }

    /**
     * Get admin dashboard statistics
     */
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        try {
            System.out.println("📊 AdminService - Getting comprehensive dashboard statistics");
            
            // ===== USER STATISTICS =====
            long totalUsers = userRepository.count();
            long verifiedUsers = userRepository.countByIsVerified(true);
            long activeUsers = userRepository.countByIsActive(true);
            long pendingVerificationUsers = userRepository.countPendingVerificationUsers();
            
            // ===== LISTING STATISTICS =====
            long totalListings = gemListingRepository.count();
            long pendingListings = gemListingRepository.countByListingStatus("PENDING");
            long approvedListings = gemListingRepository.countByListingStatus("APPROVED");
            long rejectedListings = gemListingRepository.countByListingStatus("REJECTED");
            long activeListings = gemListingRepository.countByListingStatus("ACTIVE");
            long soldListings = gemListingRepository.countByListingStatus("SOLD");
            
            // ===== ADVERTISEMENT STATISTICS =====
            long totalAdvertisements = advertisementRepository.count();
            long pendingAds = advertisementRepository.findByApproved("pending").size();
            long approvedAds = advertisementRepository.findByApproved("approved").size();
            long rejectedAds = advertisementRepository.findByApproved("rejected").size();
            
            // Add null/undefined approved status as pending
            try {
                pendingAds += advertisementRepository.findAll().stream()
                    .mapToLong(ad -> (ad.getApproved() == null || ad.getApproved().isEmpty()) ? 1 : 0)
                    .sum();
            } catch (Exception e) {
                System.out.println("⚠️  Warning: Could not count null/undefined advertisement approvals: " + e.getMessage());
            }
            
            // ===== MEETING STATISTICS =====
            long totalMeetings = meetingRepository.count();
            long pendingMeetings = meetingRepository.countByStatus("PENDING");
            long confirmedMeetings = meetingRepository.countByStatus("CONFIRMED");
            long completedMeetings = meetingRepository.countByStatus("COMPLETED");
            
            // ===== BID STATISTICS =====
            long totalBids = bidRepository.count();
            long activeBids = bidRepository.findByStatus("ACTIVE").size();
            
            // ===== REVENUE CALCULATIONS =====
            // Calculate estimated revenue based on sold listings (10% commission)
            List<GemListing> soldListingsList = gemListingRepository.findByListingStatus("SOLD");
            BigDecimal totalRevenue = BigDecimal.ZERO;
            
            for (GemListing listing : soldListingsList) {
                if (listing.getPrice() != null) {
                    totalRevenue = totalRevenue.add(listing.getPrice());
                }
            }
            
            BigDecimal commissionRate = BigDecimal.valueOf(10); // 10% commission
            BigDecimal totalCommission = totalRevenue.multiply(commissionRate).divide(BigDecimal.valueOf(100));
            
            // ===== PREPARE RESPONSE DATA =====
            Map<String, Object> stats = new HashMap<>();
            
            // User statistics
            stats.put("totalUsers", totalUsers);
            stats.put("verifiedUsers", verifiedUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("pendingVerificationUsers", pendingVerificationUsers);
            
            // Listing statistics
            stats.put("totalListings", totalListings);
            stats.put("pendingListings", pendingListings);
            stats.put("approvedListings", approvedListings);
            stats.put("rejectedListings", rejectedListings);
            stats.put("activeListings", activeListings);
            stats.put("soldListings", soldListings);
            
            // Advertisement statistics
            stats.put("totalAdvertisements", totalAdvertisements);
            stats.put("activeAdvertisements", approvedAds);
            stats.put("pendingAdvertisements", pendingAds);
            stats.put("rejectedAdvertisements", rejectedAds);
            
            // Meeting statistics
            stats.put("totalMeetings", totalMeetings);
            stats.put("pendingMeetings", pendingMeetings);
            stats.put("confirmedMeetings", confirmedMeetings);
            stats.put("completedMeetings", completedMeetings);
            
            // Bid statistics
            stats.put("totalBids", totalBids);
            stats.put("activeBids", activeBids);
            
            // Revenue statistics
            stats.put("totalRevenue", totalRevenue.doubleValue());
            stats.put("commissionRate", commissionRate.doubleValue());
            stats.put("totalCommission", totalCommission.doubleValue());
            
            // Calculate percentages for listings
            if (totalListings > 0) {
                stats.put("pendingPercentage", Math.round((pendingListings * 100.0) / totalListings));
                stats.put("approvedPercentage", Math.round((approvedListings * 100.0) / totalListings));
                stats.put("rejectedPercentage", Math.round((rejectedListings * 100.0) / totalListings));
            } else {
                stats.put("pendingPercentage", 0);
                stats.put("approvedPercentage", 0);
                stats.put("rejectedPercentage", 0);
            }
            
            // Additional aggregated statistics
            stats.put("pendingApprovals", pendingListings + pendingMeetings + pendingVerificationUsers + pendingAds);
            stats.put("lastUpdated", LocalDateTime.now());
            
            System.out.println("✅ Dashboard stats retrieved: " + 
                             "Users=" + totalUsers + 
                             ", Listings=" + totalListings + 
                             ", Ads=" + totalAdvertisements + 
                             ", Revenue=" + totalRevenue.doubleValue());
            
            return ApiResponse.success("Dashboard statistics retrieved successfully", stats);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve dashboard statistics: " + e.getMessage());
        }
    }

    /**
     * Get listing details by ID
     */
    public ApiResponse<GemListing> getListingDetails(String listingId) {
        try {
            System.out.println("🔍 AdminService - Getting listing details for ID: " + listingId);
            
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                System.err.println("❌ Listing not found with ID: " + listingId);
                return ApiResponse.error("Listing not found with ID: " + listingId);
            }
            
            GemListing listing = optionalListing.get();
            
            System.out.println("✅ Listing details retrieved: " + listing.getGemName() + 
                             " by " + listing.getUserName());
            
            return ApiResponse.success("Listing details retrieved successfully", listing);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting listing details: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve listing details: " + e.getMessage());
        }
    }

    /**
     * Create admin notification for system events
     */
    private void createAdminNotification(String type, String title, String message, 
                                       String relatedId, String relatedName, String triggerUserId) {
        try {
            // Get all admin users
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            
            for (User admin : adminUsers) {
                Notification notification = new Notification(
                    admin.getId(), // userId (admin)
                    relatedId,     // listingId or related entity ID
                    null,          // bidId (not applicable for admin notifications)
                    type,          // notification type
                    title,         // notification title
                    message,       // notification message
                    triggerUserId, // user who triggered the event
                    relatedName,   // related entity name
                    null,          // bidAmount (not applicable)
                    null           // gemName (can be null for non-gem related notifications)
                );
                
                notificationRepository.save(notification);
                System.out.println("✅ Admin notification created: " + type + " for admin " + admin.getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating admin notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Trigger notification when new user registers (unverified)
     */
    public void notifyAdminOfNewUserRegistration(String userId, String userEmail, String userName) {
        createAdminNotification(
            "USER_REGISTRATION",
            "New User Registration",
            "A new user '" + userName + "' (" + userEmail + ") has registered and requires verification.",
            userId,
            userName,
            userId
        );
        System.out.println("📧 Admin notified of new user registration: " + userEmail);
    }

    /**
     * Trigger notification when new listing is submitted for approval
     */
    public void notifyAdminOfNewListing(String listingId, String gemName, String sellerName, String sellerId) {
        createAdminNotification(
            "LISTING_PENDING",
            "New Listing Approval Required",
            "A new gemstone listing '" + gemName + "' by " + sellerName + " is pending approval.",
            listingId,
            sellerName,
            sellerId
        );
        System.out.println("💎 Admin notified of new listing: " + gemName);
    }

    /**
     * Trigger notification when new advertisement is submitted
     */
    public void notifyAdminOfNewAdvertisement(String adId, String adTitle, String advertiserName, String advertiserId) {
        createAdminNotification(
            "ADVERTISEMENT_PENDING",
            "New Advertisement Approval Required", 
            "A new advertisement '" + adTitle + "' by " + advertiserName + " requires approval.",
            adId,
            advertiserName,
            advertiserId
        );
        System.out.println("📺 Admin notified of new advertisement: " + adTitle);
    }

    /**
     * Trigger notification when new meeting request is created
     */
    public void notifyAdminOfNewMeetingRequest(String meetingId, String buyerName, String sellerName, 
                                             String buyerId, String sellerId, String gemName) {
        createAdminNotification(
            "MEETING_REQUEST",
            "New Meeting Request",
            "A new meeting request between buyer '" + buyerName + "' and seller '" + sellerName + 
            "' for gemstone '" + gemName + "' requires attention.",
            meetingId,
            buyerName + " & " + sellerName,
            buyerId
        );
        System.out.println("🤝 Admin notified of new meeting request: " + buyerName + " & " + sellerName);
    }

    /**
     * Get all feedbacks for admin management
     */
    public ApiResponse<Map<String, Object>> getAllFeedbacks(int page, int size) {
        try {
            System.out.println("💬 AdminService - Getting all feedbacks with pagination");
            
            // Create pageable with sorting by creation date (newest first)
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Get paginated feedbacks
            Page<Feedback> feedbackPage = feedbackRepository.findAll(pageable);
            
            // Convert to response format with user details
            List<Map<String, Object>> feedbackList = feedbackPage.getContent().stream()
                .map(feedback -> {
                    Map<String, Object> feedbackMap = new HashMap<>();
                    feedbackMap.put("id", feedback.getId());
                    feedbackMap.put("name", feedback.getName());
                    feedbackMap.put("title", feedback.getTitle());
                    feedbackMap.put("message", feedback.getMessage());
                    feedbackMap.put("rating", feedback.getRating());
                    feedbackMap.put("fromRole", feedback.getFromRole());
                    feedbackMap.put("toRole", feedback.getToRole());
                    feedbackMap.put("createdAt", feedback.getCreatedAt());
                    feedbackMap.put("isApproved", feedback.getIsApproved());
                    feedbackMap.put("transactionId", feedback.getTransactionId());
                    
                    // Get user details for fromUserId and toUserId
                    try {
                        Optional<User> fromUser = userRepository.findById(feedback.getFromUserId());
                        Optional<User> toUser = userRepository.findById(feedback.getToUserId());
                        
                        if (fromUser.isPresent()) {
                            feedbackMap.put("fromUserName", fromUser.get().getFirstName() + " " + fromUser.get().getLastName());
                            feedbackMap.put("fromUserEmail", fromUser.get().getEmail());
                        }
                        
                        if (toUser.isPresent()) {
                            feedbackMap.put("toUserName", toUser.get().getFirstName() + " " + toUser.get().getLastName());
                            feedbackMap.put("toUserEmail", toUser.get().getEmail());
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Warning: Could not fetch user details for feedback " + feedback.getId());
                    }
                    
                    return feedbackMap;
                })
                .collect(Collectors.toList());
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("feedbacks", feedbackList);
            response.put("totalElements", feedbackPage.getTotalElements());
            response.put("totalPages", feedbackPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("hasNext", feedbackPage.hasNext());
            response.put("hasPrevious", feedbackPage.hasPrevious());
            
            System.out.println("✅ Successfully retrieved " + feedbackList.size() + " feedbacks for admin");
            return ApiResponse.success("Feedbacks retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting all feedbacks: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve feedbacks: " + e.getMessage());
        }
    }

    /**
     * Delete feedback by ID
     */
    public ApiResponse<String> deleteFeedback(String feedbackId) {
        try {
            System.out.println("🗑️ AdminService - Deleting feedback: " + feedbackId);
            
            // Check if feedback exists
            Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
            if (!feedbackOpt.isPresent()) {
                System.err.println("❌ Feedback not found: " + feedbackId);
                return ApiResponse.error("Feedback not found");
            }
            
            Feedback feedback = feedbackOpt.get();
            String feedbackInfo = feedback.getName() + " (Rating: " + feedback.getRating() + "/5)";
            
            // Delete the feedback
            feedbackRepository.deleteById(feedbackId);
            
            System.out.println("✅ Feedback deleted successfully: " + feedbackInfo);
            return ApiResponse.success("Feedback deleted successfully", 
                "Deleted feedback: " + feedbackInfo);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error deleting feedback: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to delete feedback: " + e.getMessage());
        }
    }
}
