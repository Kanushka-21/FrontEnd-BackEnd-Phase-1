package com.gemnet.service;

import com.gemnet.model.Meeting;
import com.gemnet.model.GemListing;
import com.gemnet.model.User;
import com.gemnet.model.Notification;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.repository.UserRepository;
import com.gemnet.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class MeetingService {
    
    private static final Logger logger = LoggerFactory.getLogger(MeetingService.class);
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NoShowManagementService noShowManagementService;
    
    @Autowired
    private MeetingReminderService meetingReminderService;
    
    /**
     * Helper method to create meeting-related notifications for buyers and sellers
     */
    private void createMeetingNotification(String userId, String meetingId, String gemName, 
                                         String type, String title, String message, 
                                         String triggerUserId, String triggerUserName) {
        try {
            Notification notification = new Notification(
                userId,        // userId (recipient)
                meetingId,     // listingId (using meetingId as reference)
                null,          // bidId (not applicable for meetings)
                type,          // notification type
                title,         // notification title
                message,       // notification message
                triggerUserId, // user who triggered the event
                triggerUserName, // name of trigger user
                null,          // bidAmount (not applicable for meetings)
                gemName        // gemName
            );
            notificationRepository.save(notification);
            System.out.println("✅ Meeting notification created: " + type + " for user " + userId);
            
            // Send meeting email notification
            try {
                String details = "Gem: " + gemName + " | From: " + triggerUserName;
                emailService.sendMeetingNotificationEmail(
                    userId, 
                    type, 
                    title, 
                    message, 
                    null, // meetingLocation - will be added when available
                    null, // meetingTime - will be added when available
                    details
                );
                System.out.println("📧 Meeting email notification sent for: " + type + " to user " + userId);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send meeting email notification: " + e.getMessage());
                // Don't fail the notification creation if email fails
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error creating meeting notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Map test user IDs to real database user IDs
     */
    private String mapTestIdsToReal(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return null;
        }
        
        // Map various test IDs to the real user ID in the database
        if ("123".equals(userId) || "seller123".equals(userId) || "user123".equals(userId) || 
            "test-buyer-001".equals(userId) || "testbuyer".equals(userId) || "buyer123".equals(userId)) {
            return "68658de4291e0b6166646d97"; // Real user ID from database
        }
        
        // Current user ID from frontend logs
        if ("68ade03256c2ce307892eda2".equals(userId)) {
            return "68ade03256c2ce307892eda2"; // This is already a real user ID
        }
        
        return userId; // Return as-is if not a test ID
    }
    
    /**
     * Create a new meeting for a purchase
     */
    public Map<String, Object> createMeeting(String purchaseId, String buyerId, LocalDateTime proposedDateTime, 
                                           String location, String meetingType, String buyerNotes) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Validate input parameters
            if (purchaseId == null || purchaseId.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "Purchase ID is required");
                return result;
            }
            
            if (buyerId == null || buyerId.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "Buyer ID is required");
                return result;
            }
            
            // Map test IDs to real IDs for frontend testing
            String realBuyerId = mapTestIdsToReal(buyerId);
            String realPurchaseId = mapTestIdsToReal(purchaseId);
            
            // Additional validation after mapping
            if (realBuyerId == null || realBuyerId.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "Invalid buyer ID provided");
                return result;
            }
            
            if (realPurchaseId == null || realPurchaseId.trim().isEmpty()) {
                result.put("success", false);
                result.put("message", "Invalid purchase ID provided");
                return result;
            }
            
            // Check if meeting already exists for this purchase
            Optional<Meeting> existingMeeting = meetingRepository.findByPurchaseId(realPurchaseId);
            if (existingMeeting.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting already exists for this purchase");
                return result;
            }
            
            // Get purchase/gem listing details
            Optional<GemListing> gemListingOpt = gemListingRepository.findById(realPurchaseId);
            if (!gemListingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Purchase not found");
                return result;
            }
            
            GemListing gemListing = gemListingOpt.get();
            
            // Get buyer and seller details
            Optional<User> buyerOpt = userRepository.findById(realBuyerId);
            Optional<User> sellerOpt = userRepository.findById(gemListing.getUserId());
            
            if (!buyerOpt.isPresent() || !sellerOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Buyer or seller not found");
                return result;
            }
            
            User buyer = buyerOpt.get();
            User seller = sellerOpt.get();
            
            // Create meeting
            Meeting meeting = new Meeting();
            meeting.setBuyerId(realBuyerId);
            meeting.setSellerId(gemListing.getUserId());
            meeting.setPurchaseId(realPurchaseId);
            meeting.setGemName(gemListing.getGemName());
            meeting.setGemType(gemListing.getVariety());
            
            // Use finalPrice if available, otherwise use the base price
            double meetingPrice = (gemListing.getFinalPrice() != null) 
                ? gemListing.getFinalPrice().doubleValue() 
                : gemListing.getPrice().doubleValue();
            meeting.setFinalPrice(meetingPrice);
            
            meeting.setProposedDateTime(proposedDateTime);
            meeting.setLocation(location);
            meeting.setMeetingType(meetingType);
            meeting.setBuyerNotes(buyerNotes);
            meeting.setBuyerEmail(buyer.getEmail());
            meeting.setSellerEmail(seller.getEmail());
            meeting.setBuyerPhone(buyer.getPhoneNumber());
            meeting.setSellerPhone(seller.getPhoneNumber());
            
            // Generate human-readable meeting ID
            String displayId = meetingReminderService.generateMeetingDisplayId(meeting);
            meeting.setMeetingDisplayId(displayId);
            meeting.setStatus("PENDING");
            
            // Calculate commission (6% by default)
            double commissionRate = 0.06; // 6%
            meeting.setCommissionRate(commissionRate);
            meeting.setCommissionAmount(meetingPrice * commissionRate);
            meeting.setPaymentStatus("PENDING");
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Notify admin of new meeting request
            try {
                notificationService.notifyAdminOfNewMeetingRequest(
                    savedMeeting.getId(),
                    buyer.getFirstName() + " " + buyer.getLastName(),
                    seller.getFirstName() + " " + seller.getLastName(),
                    buyer.getId(),
                    seller.getId(),
                    gemListing.getGemName()
                );
            } catch (Exception e) {
                logger.error("⚠️ Failed to notify admin of new meeting request: " + e.getMessage());
                // Don't fail the meeting creation if notification fails
            }
            
            // Send notification to seller about new meeting request
            try {
                String sellerNotificationMessage = String.format(
                    "New meeting request for your %s (%s) from buyer %s. Proposed time: %s at %s",
                    gemListing.getGemName(),
                    gemListing.getVariety(),
                    buyer.getFirstName() + " " + buyer.getLastName(),
                    proposedDateTime.toString(),
                    location
                );
                
                createMeetingNotification(
                    gemListing.getUserId(),  // seller ID
                    savedMeeting.getId(),    // meeting ID
                    gemListing.getGemName(), // gem name
                    "MEETING_REQUEST_RECEIVED", // notification type
                    "New Meeting Request",   // title
                    sellerNotificationMessage, // message
                    realBuyerId,            // trigger user (buyer)
                    buyer.getFirstName() + " " + buyer.getLastName() // trigger user name
                );
                
                logger.info("✅ Meeting request notification sent to seller: {}", gemListing.getUserId());
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting request notification to seller: " + e.getMessage());
            }
            
            // Send confirmation notification to buyer
            try {
                String buyerNotificationMessage = String.format(
                    "Your meeting request for %s (%s) has been sent to seller %s. Proposed time: %s at %s. Awaiting seller confirmation.",
                    gemListing.getGemName(),
                    gemListing.getVariety(),
                    seller.getFirstName() + " " + seller.getLastName(),
                    proposedDateTime.toString(),
                    location
                );
                
                createMeetingNotification(
                    realBuyerId,             // buyer ID
                    savedMeeting.getId(),    // meeting ID
                    gemListing.getGemName(), // gem name
                    "MEETING_REQUEST_SENT",  // notification type
                    "Meeting Request Sent",  // title
                    buyerNotificationMessage, // message
                    realBuyerId,            // trigger user (self)
                    buyer.getFirstName() + " " + buyer.getLastName() // trigger user name
                );
                
                logger.info("✅ Meeting request confirmation sent to buyer: {}", realBuyerId);
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting request confirmation to buyer: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("message", "Meeting request created successfully");
            result.put("meetingId", savedMeeting.getId());
            result.put("meeting", savedMeeting);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error creating meeting: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get meetings for a user (buyer or seller)
     */
    public List<Meeting> getMeetingsForUser(String userId) {
        return meetingRepository.findMeetingsByUserId(userId);
    }
    
    /**
     * Get enriched meetings for a user with gem listing details including images
     */
    public List<Map<String, Object>> getEnrichedMeetingsForUser(String userId) {
        try {
            List<Meeting> meetings = meetingRepository.findMeetingsByUserId(userId);
            List<Map<String, Object>> enrichedMeetings = new ArrayList<>();
            
            for (Meeting meeting : meetings) {
                Map<String, Object> meetingDetail = new HashMap<>();
                
                try {
                    // Basic meeting information
                    meetingDetail.put("id", meeting.getId());
                    meetingDetail.put("purchaseId", meeting.getPurchaseId());
                    meetingDetail.put("buyerId", meeting.getBuyerId());
                    meetingDetail.put("sellerId", meeting.getSellerId());
                    meetingDetail.put("gemName", meeting.getGemName());
                    meetingDetail.put("gemType", meeting.getGemType());
                    meetingDetail.put("finalPrice", meeting.getFinalPrice());
                    
                    // Add commission information
                    meetingDetail.put("commissionRate", meeting.getCommissionRate() != null ? meeting.getCommissionRate() : 0.06);
                    meetingDetail.put("commissionAmount", meeting.getCommissionAmount());
                    
                    // Fetch gem listing details to get the primary image
                    String primaryImageUrl = null;
                    try {
                        if (meeting.getPurchaseId() != null) {
                            Optional<GemListing> gemListingOpt = gemListingRepository.findById(meeting.getPurchaseId());
                            if (gemListingOpt.isPresent()) {
                                GemListing gemListing = gemListingOpt.get();
                                if (gemListing.getImages() != null && !gemListing.getImages().isEmpty()) {
                                    primaryImageUrl = gemListing.getImages().get(0).getImageUrl(); // Get first image URL as primary
                                    logger.debug("✅ [MeetingService] Found primary image for meeting {}: {}", meeting.getId(), primaryImageUrl);
                                } else {
                                    logger.debug("⚠️ [MeetingService] No images found for gem listing {}", meeting.getPurchaseId());
                                }
                            } else {
                                logger.warn("⚠️ [MeetingService] Gem listing not found for purchase ID: {}", meeting.getPurchaseId());
                            }
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error fetching gem listing image for meeting {}: {}", meeting.getId(), e.getMessage());
                    }
                    
                    meetingDetail.put("primaryImageUrl", primaryImageUrl);
                    meetingDetail.put("proposedDateTime", meeting.getProposedDateTime());
                    meetingDetail.put("confirmedDateTime", meeting.getConfirmedDateTime());
                    meetingDetail.put("location", meeting.getLocation());
                    meetingDetail.put("meetingType", meeting.getMeetingType());
                    meetingDetail.put("status", meeting.getStatus());
                    meetingDetail.put("buyerNotes", meeting.getBuyerNotes());
                    meetingDetail.put("sellerNotes", meeting.getSellerNotes());
                    meetingDetail.put("createdAt", meeting.getCreatedAt());
                    meetingDetail.put("updatedAt", meeting.getUpdatedAt());
                    
                    // Get buyer details
                    try {
                        Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                        if (buyerOpt.isPresent()) {
                            User buyer = buyerOpt.get();
                            meetingDetail.put("buyerName", buyer.getFirstName() + " " + buyer.getLastName());
                            meetingDetail.put("buyerEmail", buyer.getEmail());
                            meetingDetail.put("buyerPhone", buyer.getPhoneNumber());
                            
                            Map<String, Object> buyerContact = new HashMap<>();
                            buyerContact.put("fullName", buyer.getFirstName() + " " + buyer.getLastName());
                            buyerContact.put("email", buyer.getEmail());
                            buyerContact.put("phoneNumber", buyer.getPhoneNumber());
                            meetingDetail.put("buyerContact", buyerContact);
                        } else {
                            logger.warn("⚠️ [MeetingService] Buyer not found for ID: {}", meeting.getBuyerId());
                            meetingDetail.put("buyerName", "Unknown Buyer");
                            meetingDetail.put("buyerEmail", "N/A");
                            meetingDetail.put("buyerPhone", "N/A");
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error getting buyer details for meeting {}: {}", meeting.getId(), e.getMessage());
                        meetingDetail.put("buyerName", "Unknown Buyer");
                        meetingDetail.put("buyerEmail", "N/A");
                        meetingDetail.put("buyerPhone", "N/A");
                    }
                    
                    // Get seller details
                    try {
                        Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                        if (sellerOpt.isPresent()) {
                            User seller = sellerOpt.get();
                            meetingDetail.put("sellerName", seller.getFirstName() + " " + seller.getLastName());
                            meetingDetail.put("sellerEmail", seller.getEmail());
                            meetingDetail.put("sellerPhone", seller.getPhoneNumber());
                            
                            Map<String, Object> sellerContact = new HashMap<>();
                            sellerContact.put("fullName", seller.getFirstName() + " " + seller.getLastName());
                            sellerContact.put("email", seller.getEmail());
                            sellerContact.put("phoneNumber", seller.getPhoneNumber());
                            meetingDetail.put("sellerContact", sellerContact);
                        } else {
                            logger.warn("⚠️ [MeetingService] Seller not found for ID: {}", meeting.getSellerId());
                            meetingDetail.put("sellerName", "Unknown Seller");
                            meetingDetail.put("sellerEmail", "N/A");
                            meetingDetail.put("sellerPhone", "N/A");
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error getting seller details for meeting {}: {}", meeting.getId(), e.getMessage());
                        meetingDetail.put("sellerName", "Unknown Seller");
                        meetingDetail.put("sellerEmail", "N/A");
                        meetingDetail.put("sellerPhone", "N/A");
                    }
                    
                    enrichedMeetings.add(meetingDetail);
                    logger.debug("✅ [MeetingService] Successfully processed meeting: {}", meeting.getId());
                    
                } catch (Exception e) {
                    logger.error("❌ [MeetingService] Error processing meeting {}: {}", meeting.getId(), e.getMessage(), e);
                    // Continue processing other meetings
                }
            }
            
            logger.info("✅ [MeetingService] Successfully processed {} enriched meetings for user {}", enrichedMeetings.size(), userId);
            return enrichedMeetings;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error in getEnrichedMeetingsForUser(): {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get meeting by ID
     */
    public Optional<Meeting> getMeetingById(String meetingId) {
        return meetingRepository.findById(meetingId);
    }
    
    /**
     * Get meeting by display ID
     */
    public Optional<Meeting> getMeetingByDisplayId(String displayId) {
        return meetingRepository.findByMeetingDisplayId(displayId);
    }
    
    /**
     * Confirm a meeting (seller confirms the proposed time)
     */
    public Map<String, Object> confirmMeeting(String meetingId, String sellerId, String sellerNotes) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting not found");
                return result;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify seller is authorized to confirm
            if (!meeting.getSellerId().equals(sellerId)) {
                result.put("success", false);
                result.put("message", "Not authorized to confirm this meeting");
                return result;
            }
            
            // Update meeting
            meeting.setStatus("CONFIRMED");
            meeting.setConfirmedDateTime(meeting.getProposedDateTime());
            meeting.setSellerNotes(sellerNotes);
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Send notification to buyer about confirmation
            try {
                Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                
                if (buyerOpt.isPresent() && sellerOpt.isPresent()) {
                    User buyer = buyerOpt.get();
                    User seller = sellerOpt.get();
                    
                    String buyerNotificationMessage = String.format(
                        "Your meeting for %s has been confirmed by seller %s for %s at %s",
                        meeting.getGemName(),
                        seller.getFirstName() + " " + seller.getLastName(),
                        meeting.getConfirmedDateTime().toString(),
                        meeting.getLocation()
                    );
                    
                    createMeetingNotification(
                        meeting.getBuyerId(),     // buyer ID
                        meeting.getId(),          // meeting ID
                        meeting.getGemName(),     // gem name
                        "MEETING_CONFIRMED",      // notification type
                        "Meeting Confirmed",      // title
                        buyerNotificationMessage, // message
                        sellerId,                 // trigger user (seller)
                        seller.getFirstName() + " " + seller.getLastName() // trigger user name
                    );
                    
                    logger.info("✅ Meeting confirmation notification sent to buyer: {}", meeting.getBuyerId());
                }
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting confirmation notification to buyer: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("message", "Meeting confirmed successfully");
            result.put("meeting", savedMeeting);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error confirming meeting: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Reschedule a meeting
     */
    public Map<String, Object> rescheduleMeeting(String meetingId, String userId, LocalDateTime newDateTime, String notes) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting not found");
                return result;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify user is authorized (buyer or seller)
            if (!meeting.getBuyerId().equals(userId) && !meeting.getSellerId().equals(userId)) {
                result.put("success", false);
                result.put("message", "Not authorized to reschedule this meeting");
                return result;
            }
            
            // Update meeting
            meeting.setProposedDateTime(newDateTime);
            meeting.setStatus("PENDING");
            meeting.setConfirmedDateTime(null);
            
            if (meeting.getBuyerId().equals(userId)) {
                meeting.setBuyerNotes(notes);
            } else {
                meeting.setSellerNotes(notes);
            }
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Send notification to the other party about rescheduling
            try {
                String otherUserId = meeting.getBuyerId().equals(userId) ? meeting.getSellerId() : meeting.getBuyerId();
                String userRole = meeting.getBuyerId().equals(userId) ? "buyer" : "seller";
                
                Optional<User> triggerUserOpt = userRepository.findById(userId);
                Optional<User> otherUserOpt = userRepository.findById(otherUserId);
                
                if (triggerUserOpt.isPresent() && otherUserOpt.isPresent()) {
                    User triggerUser = triggerUserOpt.get();
                    
                    String notificationMessage = String.format(
                        "Meeting for %s has been rescheduled by the %s %s. New proposed time: %s at %s. Please confirm or suggest alternative time.",
                        meeting.getGemName(),
                        userRole,
                        triggerUser.getFirstName() + " " + triggerUser.getLastName(),
                        newDateTime.toString(),
                        meeting.getLocation()
                    );
                    
                    createMeetingNotification(
                        otherUserId,              // recipient ID
                        meeting.getId(),          // meeting ID
                        meeting.getGemName(),     // gem name
                        "MEETING_RESCHEDULED",    // notification type
                        "Meeting Rescheduled",    // title
                        notificationMessage,      // message
                        userId,                   // trigger user
                        triggerUser.getFirstName() + " " + triggerUser.getLastName() // trigger user name
                    );
                    
                    logger.info("✅ Meeting reschedule notification sent to: {}", otherUserId);
                }
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting reschedule notification: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("message", "Meeting rescheduled successfully");
            result.put("meeting", savedMeeting);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error rescheduling meeting: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Complete a meeting
     */
    public Map<String, Object> completeMeeting(String meetingId, String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting not found");
                return result;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify user is authorized
            if (!meeting.getBuyerId().equals(userId) && !meeting.getSellerId().equals(userId)) {
                result.put("success", false);
                result.put("message", "Not authorized to complete this meeting");
                return result;
            }
            
            // Update meeting
            meeting.setStatus("COMPLETED");
            meeting.setPaymentStatus("COMMISSION_DEDUCTED");
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Send completion notifications to both parties
            try {
                Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                Optional<User> triggerUserOpt = userRepository.findById(userId);
                
                if (buyerOpt.isPresent() && sellerOpt.isPresent() && triggerUserOpt.isPresent()) {
                    User buyer = buyerOpt.get();
                    User seller = sellerOpt.get();
                    User triggerUser = triggerUserOpt.get();
                    
                    String userRole = meeting.getBuyerId().equals(userId) ? "buyer" : "seller";
                    
                    // Notification to buyer
                    String buyerMessage = String.format(
                        "Meeting for %s has been marked as completed by the %s. Transaction finalized. Commission has been deducted.",
                        meeting.getGemName(),
                        userRole
                    );
                    
                    createMeetingNotification(
                        meeting.getBuyerId(),     // buyer ID
                        meeting.getId(),          // meeting ID
                        meeting.getGemName(),     // gem name
                        "MEETING_COMPLETED",      // notification type
                        "Meeting Completed",      // title
                        buyerMessage,             // message
                        userId,                   // trigger user
                        triggerUser.getFirstName() + " " + triggerUser.getLastName() // trigger user name
                    );
                    
                    // Notification to seller
                    String sellerMessage = String.format(
                        "Meeting for %s has been marked as completed by the %s. Transaction finalized. Commission has been deducted from final amount.",
                        meeting.getGemName(),
                        userRole
                    );
                    
                    createMeetingNotification(
                        meeting.getSellerId(),    // seller ID
                        meeting.getId(),          // meeting ID
                        meeting.getGemName(),     // gem name
                        "MEETING_COMPLETED",      // notification type
                        "Meeting Completed",      // title
                        sellerMessage,            // message
                        userId,                   // trigger user
                        triggerUser.getFirstName() + " " + triggerUser.getLastName() // trigger user name
                    );
                    
                    logger.info("✅ Meeting completion notifications sent to both buyer and seller");
                }
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting completion notifications: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("message", "Meeting completed successfully");
            result.put("meeting", savedMeeting);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error completing meeting: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Cancel a meeting
     */
    public Map<String, Object> cancelMeeting(String meetingId, String userId, String reason) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting not found");
                return result;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify user is authorized
            if (!meeting.getBuyerId().equals(userId) && !meeting.getSellerId().equals(userId)) {
                result.put("success", false);
                result.put("message", "Not authorized to cancel this meeting");
                return result;
            }
            
            // Update meeting
            meeting.setStatus("CANCELLED");
            
            if (meeting.getBuyerId().equals(userId)) {
                meeting.setBuyerNotes(meeting.getBuyerNotes() + "\nCancellation reason: " + reason);
            } else {
                meeting.setSellerNotes(meeting.getSellerNotes() + "\nCancellation reason: " + reason);
            }
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Send notification to the other party about cancellation
            try {
                String otherUserId = meeting.getBuyerId().equals(userId) ? meeting.getSellerId() : meeting.getBuyerId();
                String userRole = meeting.getBuyerId().equals(userId) ? "buyer" : "seller";
                
                Optional<User> triggerUserOpt = userRepository.findById(userId);
                Optional<User> otherUserOpt = userRepository.findById(otherUserId);
                
                if (triggerUserOpt.isPresent() && otherUserOpt.isPresent()) {
                    User triggerUser = triggerUserOpt.get();
                    
                    String notificationMessage = String.format(
                        "Meeting for %s has been cancelled by the %s %s. Reason: %s",
                        meeting.getGemName(),
                        userRole,
                        triggerUser.getFirstName() + " " + triggerUser.getLastName(),
                        reason
                    );
                    
                    createMeetingNotification(
                        otherUserId,              // recipient ID
                        meeting.getId(),          // meeting ID
                        meeting.getGemName(),     // gem name
                        "MEETING_CANCELLED",      // notification type
                        "Meeting Cancelled",      // title
                        notificationMessage,      // message
                        userId,                   // trigger user
                        triggerUser.getFirstName() + " " + triggerUser.getLastName() // trigger user name
                    );
                    
                    logger.info("✅ Meeting cancellation notification sent to: {}", otherUserId);
                }
            } catch (Exception e) {
                logger.error("⚠️ Failed to send meeting cancellation notification: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("message", "Meeting cancelled successfully");
            result.put("meeting", savedMeeting);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Error cancelling meeting: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get all meetings for admin dashboard with detailed information
     */
    public List<Map<String, Object>> getAllMeetingsWithDetails() {
        logger.info("🔄 [MeetingService] Starting getAllMeetingsWithDetails()");
        
        try {
            List<Meeting> meetings = meetingRepository.findAllByOrderByCreatedAtDesc();
            logger.info("✅ [MeetingService] Retrieved {} meetings from database", meetings.size());
            
            List<Map<String, Object>> detailedMeetings = new ArrayList<>();
            
            for (Meeting meeting : meetings) {
                logger.debug("🔧 [MeetingService] Processing meeting: {}", meeting.getId());
                
                Map<String, Object> meetingDetail = new HashMap<>();
                
                try {
                    // Basic meeting information
                    meetingDetail.put("id", meeting.getId());
                    meetingDetail.put("purchaseId", meeting.getPurchaseId());
                    meetingDetail.put("buyerId", meeting.getBuyerId());
                    meetingDetail.put("sellerId", meeting.getSellerId());
                    meetingDetail.put("gemName", meeting.getGemName());
                    meetingDetail.put("gemType", meeting.getGemType());
                    meetingDetail.put("finalPrice", meeting.getFinalPrice());
                    
                    // Fetch gem listing details to get the primary image
                    String primaryImageUrl = null;
                    try {
                        if (meeting.getPurchaseId() != null) {
                            Optional<GemListing> gemListingOpt = gemListingRepository.findById(meeting.getPurchaseId());
                            if (gemListingOpt.isPresent()) {
                                GemListing gemListing = gemListingOpt.get();
                                if (gemListing.getImages() != null && !gemListing.getImages().isEmpty()) {
                                    primaryImageUrl = gemListing.getImages().get(0).getImageUrl(); // Get first image URL as primary
                                    logger.debug("✅ [MeetingService] Found primary image for meeting {}: {}", meeting.getId(), primaryImageUrl);
                                } else {
                                    logger.debug("⚠️ [MeetingService] No images found for gem listing {}", meeting.getPurchaseId());
                                }
                            } else {
                                logger.warn("⚠️ [MeetingService] Gem listing not found for purchase ID: {}", meeting.getPurchaseId());
                            }
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error fetching gem listing image for meeting {}: {}", meeting.getId(), e.getMessage());
                    }
                    
                    meetingDetail.put("primaryImageUrl", primaryImageUrl);
                    meetingDetail.put("proposedDateTime", meeting.getProposedDateTime());
                    meetingDetail.put("confirmedDateTime", meeting.getConfirmedDateTime());
                    meetingDetail.put("location", meeting.getLocation());
                    meetingDetail.put("meetingType", meeting.getMeetingType());
                    meetingDetail.put("status", meeting.getStatus());
                    meetingDetail.put("buyerNotes", meeting.getBuyerNotes());
                    meetingDetail.put("sellerNotes", meeting.getSellerNotes());
                    meetingDetail.put("createdAt", meeting.getCreatedAt());
                    meetingDetail.put("updatedAt", meeting.getUpdatedAt());
                    
                    // Get buyer details
                    try {
                        Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                        if (buyerOpt.isPresent()) {
                            User buyer = buyerOpt.get();
                            meetingDetail.put("buyerName", buyer.getFirstName() + " " + buyer.getLastName());
                            meetingDetail.put("buyerEmail", buyer.getEmail());
                            meetingDetail.put("buyerPhone", buyer.getPhoneNumber());
                            
                            Map<String, Object> buyerContact = new HashMap<>();
                            buyerContact.put("fullName", buyer.getFirstName() + " " + buyer.getLastName());
                            buyerContact.put("email", buyer.getEmail());
                            buyerContact.put("phoneNumber", buyer.getPhoneNumber());
                            meetingDetail.put("buyerContact", buyerContact);
                        } else {
                            logger.warn("⚠️ [MeetingService] Buyer not found for ID: {}", meeting.getBuyerId());
                            meetingDetail.put("buyerName", "Unknown Buyer");
                            meetingDetail.put("buyerEmail", "N/A");
                            meetingDetail.put("buyerPhone", "N/A");
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error getting buyer details for meeting {}: {}", meeting.getId(), e.getMessage());
                        meetingDetail.put("buyerName", "Unknown Buyer");
                        meetingDetail.put("buyerEmail", "N/A");
                        meetingDetail.put("buyerPhone", "N/A");
                    }
                    
                    // Get seller details
                    try {
                        Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                        if (sellerOpt.isPresent()) {
                            User seller = sellerOpt.get();
                            meetingDetail.put("sellerName", seller.getFirstName() + " " + seller.getLastName());
                            meetingDetail.put("sellerEmail", seller.getEmail());
                            meetingDetail.put("sellerPhone", seller.getPhoneNumber());
                            
                            Map<String, Object> sellerContact = new HashMap<>();
                            sellerContact.put("fullName", seller.getFirstName() + " " + seller.getLastName());
                            sellerContact.put("email", seller.getEmail());
                            sellerContact.put("phoneNumber", seller.getPhoneNumber());
                            meetingDetail.put("sellerContact", sellerContact);
                        } else {
                            logger.warn("⚠️ [MeetingService] Seller not found for ID: {}", meeting.getSellerId());
                            meetingDetail.put("sellerName", "Unknown Seller");
                            meetingDetail.put("sellerEmail", "N/A");
                            meetingDetail.put("sellerPhone", "N/A");
                        }
                    } catch (Exception e) {
                        logger.error("❌ [MeetingService] Error getting seller details for meeting {}: {}", meeting.getId(), e.getMessage());
                        meetingDetail.put("sellerName", "Unknown Seller");
                        meetingDetail.put("sellerEmail", "N/A");
                        meetingDetail.put("sellerPhone", "N/A");
                    }
                    
                    detailedMeetings.add(meetingDetail);
                    logger.debug("✅ [MeetingService] Successfully processed meeting: {}", meeting.getId());
                    
                } catch (Exception e) {
                    logger.error("❌ [MeetingService] Error processing meeting {}: {}", meeting.getId(), e.getMessage(), e);
                    // Continue processing other meetings
                }
            }
            
            logger.info("✅ [MeetingService] Successfully processed {} meetings with details", detailedMeetings.size());
            return detailedMeetings;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error in getAllMeetingsWithDetails(): {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get all meetings for admin dashboard (legacy method)
     */
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * Get upcoming meetings
     */
    public List<Meeting> getUpcomingMeetings() {
        return meetingRepository.findUpcomingMeetings(LocalDateTime.now());
    }
    
    /**
     * Get meetings by status
     */
    public List<Meeting> getMeetingsByStatus(String status) {
        return meetingRepository.findByStatus(status);
    }
    
    /**
     * Admin completes a meeting and sends notifications to both parties
     */
    public Map<String, Object> adminCompleteMeeting(String meetingId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 [MeetingService] Admin completing meeting: {}", meetingId);
            
            // Find the meeting
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                logger.warn("⚠️ [MeetingService] Meeting not found: {}", meetingId);
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Check if meeting is confirmed (only confirmed meetings can be completed by admin)
            if (!"CONFIRMED".equals(meeting.getStatus())) {
                logger.warn("⚠️ [MeetingService] Meeting is not confirmed, cannot complete: {} (status: {})", 
                           meetingId, meeting.getStatus());
                response.put("success", false);
                response.put("message", "Only confirmed meetings can be marked as completed");
                return response;
            }
            
            // Calculate commission (6% of final price, can be negotiated later)
            Double finalPrice = meeting.getFinalPrice();
            Double commissionRate = 0.06; // 6% commission rate
            Double commissionAmount = 0.0;
            
            if (finalPrice != null && finalPrice > 0) {
                commissionAmount = finalPrice * commissionRate;
                meeting.setCommissionAmount(commissionAmount);
                logger.info("💰 [MeetingService] Commission calculated: LKR {} (6% of LKR {})", 
                           commissionAmount, finalPrice);
            }
            
            // Update meeting status to COMPLETED
            meeting.setStatus("COMPLETED");
            meeting.setUpdatedAt(LocalDateTime.now());
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            logger.info("✅ [MeetingService] Meeting status updated to COMPLETED: {}", meetingId);
            
            // Get buyer and seller information for notifications
            String buyerId = meeting.getBuyerId();
            String sellerId = meeting.getSellerId();
            String gemName = meeting.getGemName() != null ? meeting.getGemName() : "Gemstone";
            
            // Get buyer and seller details
            Optional<User> buyerOpt = userRepository.findById(buyerId);
            Optional<User> sellerOpt = userRepository.findById(sellerId);
            
            String buyerName = buyerOpt.isPresent() ? 
                              buyerOpt.get().getFirstName() + " " + buyerOpt.get().getLastName() : "Buyer";
            String sellerName = sellerOpt.isPresent() ? 
                               sellerOpt.get().getFirstName() + " " + sellerOpt.get().getLastName() : "Seller";
            
            // Get meeting details for notification
            String meetingLocation = meeting.getLocation() != null ? meeting.getLocation() : "GemNet Office";
            LocalDateTime meetingTime = meeting.getConfirmedDateTime() != null ? 
                                       meeting.getConfirmedDateTime() : meeting.getProposedDateTime();
            
            // Create notification message
            String notificationTitle = "Meeting Completed - Trade Approved";
            String notificationMessage = String.format(
                "Admin has reviewed your meeting for %s and marked it as completed. " +
                "Both parties are now ready to meet physically and complete the business transaction " +
                "at %s on %s. Please ensure you arrive on time with all necessary documentation.",
                gemName,
                meetingLocation,
                meetingTime != null ? meetingTime.toString() : "scheduled time"
            );
            
            // Send notification to buyer
            try {
                createMeetingNotification(
                    buyerId,
                    meetingId,
                    gemName,
                    "MEETING_COMPLETED",
                    notificationTitle,
                    notificationMessage,
                    "admin",
                    "Admin"
                );
                logger.info("✅ [MeetingService] Notification sent to buyer: {}", buyerId);
            } catch (Exception e) {
                logger.error("❌ [MeetingService] Failed to send notification to buyer {}: {}", buyerId, e.getMessage());
            }
            
            // Send notification to seller
            try {
                createMeetingNotification(
                    sellerId,
                    meetingId,
                    gemName,
                    "MEETING_COMPLETED",
                    notificationTitle,
                    notificationMessage,
                    "admin",
                    "Admin"
                );
                logger.info("✅ [MeetingService] Notification sent to seller: {}", sellerId);
            } catch (Exception e) {
                logger.error("❌ [MeetingService] Failed to send notification to seller {}: {}", sellerId, e.getMessage());
            }
            
            // Send commission notification to buyer (after both parties have confirmed and admin completed the meeting)
            if (commissionAmount > 0) {
                try {
                    String commissionTitle = "💰 Commission Details - " + gemName;
                    String commissionMessage = String.format(
                        "Dear %s,\n\n" +
                        "Your meeting for %s has been completed and approved by administration. " +
                        "Please note the following commission details:\n\n" +
                        "📊 Transaction Summary:\n" +
                        "• Item: %s\n" +
                        "• Final Price: LKR %,.2f\n" +
                        "• Commission Rate: 6%% (negotiable)\n" +
                        "• Commission Amount: LKR %,.2f\n\n" +
                        "The commission is applied as per GemNet's standard terms and conditions. " +
                        "If you wish to discuss or negotiate the commission rate, please contact our administration team.\n\n" +
                        "Thank you for choosing GemNet for your gemstone transactions!",
                        buyerName,
                        gemName,
                        gemName,
                        finalPrice,
                        commissionAmount
                    );
                    
                    createMeetingNotification(
                        buyerId,
                        meetingId,
                        gemName,
                        "COMMISSION_NOTIFICATION",
                        commissionTitle,
                        commissionMessage,
                        "admin",
                        "Admin"
                    );
                    
                    logger.info("💰 [MeetingService] Commission notification sent to buyer: {} (LKR {})", 
                               buyerId, commissionAmount);
                } catch (Exception e) {
                    logger.error("❌ [MeetingService] Failed to send commission notification to buyer {}: {}", 
                                buyerId, e.getMessage());
                }
            }
            
            response.put("success", true);
            response.put("message", "Meeting marked as completed successfully. Notifications sent to both parties.");
            response.put("meeting", savedMeeting);
            
            logger.info("✅ [MeetingService] Admin successfully completed meeting: {}", meetingId);
            return response;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error in adminCompleteMeeting(): {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to complete meeting: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return response;
        }
    }
    
    /**
     * Delete a meeting (only allowed for buyers and only for pending meetings)
     */
    public Map<String, Object> deleteMeeting(String meetingId, String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🗑️ [MeetingService] Delete meeting request: meetingId={}, userId={}", meetingId, userId);
            
            // Get the meeting
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Check if user is the buyer (only buyers can delete meetings)
            if (!meeting.getBuyerId().equals(userId)) {
                response.put("success", false);
                response.put("message", "Only the meeting requester (buyer) can delete this meeting");
                return response;
            }
            
            // Check if meeting is still pending (only pending meetings can be deleted)
            if (!"PENDING".equals(meeting.getStatus())) {
                response.put("success", false);
                response.put("message", "Only pending meetings can be deleted. This meeting is " + meeting.getStatus());
                return response;
            }
            
            // Get seller information for notification
            String sellerName = "Unknown Seller";
            try {
                Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                if (sellerOpt.isPresent()) {
                    User seller = sellerOpt.get();
                    sellerName = seller.getFirstName() + " " + seller.getLastName();
                }
            } catch (Exception e) {
                logger.warn("⚠️ [MeetingService] Could not get seller details for notification: {}", e.getMessage());
            }
            
            // Get buyer information for notification
            String buyerName = "Unknown Buyer";
            try {
                Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                if (buyerOpt.isPresent()) {
                    User buyer = buyerOpt.get();
                    buyerName = buyer.getFirstName() + " " + buyer.getLastName();
                }
            } catch (Exception e) {
                logger.warn("⚠️ [MeetingService] Could not get buyer details for notification: {}", e.getMessage());
            }
            
            // Delete the meeting
            meetingRepository.delete(meeting);
            
            // Send notification to seller about meeting deletion
            try {
                String notificationMessage = String.format(
                    "The meeting request for %s has been deleted by buyer %s. " +
                    "The meeting was scheduled for %s at %s.",
                    meeting.getGemName(),
                    buyerName,
                    meeting.getProposedDateTime().toString(),
                    meeting.getLocation()
                );
                
                createMeetingNotification(
                    meeting.getSellerId(),
                    meetingId,
                    meeting.getGemName(),
                    "MEETING_DELETED",
                    "Meeting Request Deleted",
                    notificationMessage,
                    userId,
                    buyerName
                );
                logger.info("✅ [MeetingService] Deletion notification sent to seller: {}", meeting.getSellerId());
            } catch (Exception e) {
                logger.error("❌ [MeetingService] Failed to send deletion notification to seller: {}", e.getMessage());
            }
            
            response.put("success", true);
            response.put("message", "Meeting deleted successfully. The seller has been notified.");
            
            logger.info("✅ [MeetingService] Meeting deleted successfully: {}", meetingId);
            return response;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error in deleteMeeting(): {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to delete meeting: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return response;
        }
    }

    /**
     * Admin delete a meeting (allows deletion of completed and no-show meetings)
     */
    public Map<String, Object> adminDeleteMeeting(String meetingId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🗑️ [MeetingService] Admin delete meeting request: meetingId={}", meetingId);
            
            // Get the meeting
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Admin can delete completed and no-show meetings
            if (!"COMPLETED".equals(meeting.getStatus()) && !"NO_SHOW_RECORDED".equals(meeting.getStatus())) {
                response.put("success", false);
                response.put("message", "Only completed or no-show meetings can be deleted by admin. This meeting is " + meeting.getStatus());
                return response;
            }
            
            logger.info("🗑️ [MeetingService] Admin deleting {} meeting: {}", meeting.getStatus(), meetingId);
            
            // Get user information for logging
            String buyerName = "Unknown Buyer";
            String sellerName = "Unknown Seller";
            try {
                Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
                if (buyerOpt.isPresent()) {
                    User buyer = buyerOpt.get();
                    buyerName = buyer.getFirstName() + " " + buyer.getLastName();
                }
                
                Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
                if (sellerOpt.isPresent()) {
                    User seller = sellerOpt.get();
                    sellerName = seller.getFirstName() + " " + seller.getLastName();
                }
            } catch (Exception e) {
                logger.warn("⚠️ [MeetingService] Could not get user details for logging: {}", e.getMessage());
            }
            
            // Delete the meeting
            meetingRepository.delete(meeting);
            
            logger.info("✅ [MeetingService] Admin successfully deleted {} meeting: {} (Buyer: {}, Seller: {})", 
                       meeting.getStatus(), meetingId, buyerName, sellerName);
            
            response.put("success", true);
            response.put("message", "Meeting deleted successfully by admin");
            response.put("meetingId", meetingId);
            response.put("status", meeting.getStatus());
            
            return response;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error in adminDeleteMeeting(): {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to delete meeting: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return response;
        }
    }
    
    /**
     * Update commission rate for a meeting (Admin only)
     */
    public Map<String, Object> updateMeetingCommission(String meetingId, Double newCommissionRate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 [MeetingService] Updating commission rate for meeting: {} to {}%", 
                       meetingId, newCommissionRate * 100);
            
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            Double oldCommissionRate = meeting.getCommissionRate();
            Double oldCommissionAmount = meeting.getCommissionAmount();
            
            // Update commission rate and amount
            meeting.setCommissionRate(newCommissionRate);
            // The setCommissionRate method automatically recalculates the commission amount
            
            // Save the updated meeting
            Meeting updatedMeeting = meetingRepository.save(meeting);
            
            logger.info("✅ [MeetingService] Successfully updated commission for meeting: {}", meetingId);
            logger.info("   - Old rate: {}%, Old amount: LKR {}", 
                       oldCommissionRate != null ? oldCommissionRate * 100 : "N/A", 
                       oldCommissionAmount != null ? oldCommissionAmount : "N/A");
            logger.info("   - New rate: {}%, New amount: LKR {}", 
                       newCommissionRate * 100, updatedMeeting.getCommissionAmount());
            
            // Prepare response with updated meeting details
            response.put("success", true);
            response.put("message", "Commission rate updated successfully");
            response.put("meetingId", meetingId);
            response.put("oldCommissionRate", oldCommissionRate);
            response.put("newCommissionRate", newCommissionRate);
            response.put("oldCommissionAmount", oldCommissionAmount);
            response.put("newCommissionAmount", updatedMeeting.getCommissionAmount());
            response.put("finalPrice", updatedMeeting.getFinalPrice());
            
            // Send notification to buyer and seller about commission update
            try {
                // Fetch buyer and seller details from User repository
                Optional<User> buyerOpt = userRepository.findById(updatedMeeting.getBuyerId());
                Optional<User> sellerOpt = userRepository.findById(updatedMeeting.getSellerId());
                
                if (buyerOpt.isPresent() && sellerOpt.isPresent()) {
                    User buyer = buyerOpt.get();
                    User seller = sellerOpt.get();
                    
                    String notificationTitle = "Commission Rate Updated";
                    String meetingDisplayId = updatedMeeting.getMeetingDisplayId() != null ? 
                        updatedMeeting.getMeetingDisplayId() : updatedMeeting.getId().substring(0, 8);
                    
                    String message = String.format(
                        "The commission rate for Meeting #%s has been updated by admin.",
                        meetingDisplayId
                    );
                    
                    String details = String.format(
                        "Meeting Details:\n" +
                        "- Gem: %s (%s)\n" +
                        "- Final Price: LKR %,.2f\n" +
                        "- Previous Commission: %s (LKR %s)\n" +
                        "- New Commission: %.1f%% (LKR %,.2f)\n\n" +
                        "This change has been made based on admin review and negotiation.",
                        updatedMeeting.getGemName(), updatedMeeting.getGemType(),
                        updatedMeeting.getFinalPrice(),
                        oldCommissionRate != null ? String.format("%.1f%%", oldCommissionRate * 100) : "N/A",
                        oldCommissionAmount != null ? String.format("%,.2f", oldCommissionAmount) : "N/A",
                        newCommissionRate * 100, updatedMeeting.getCommissionAmount()
                    );
                    
                    // Try to send email notifications, but don't fail the operation if email fails
                    try {
                        emailService.sendNotificationEmail(buyer.getId(), "COMMISSION_UPDATE", notificationTitle, message, details);
                        emailService.sendNotificationEmail(seller.getId(), "COMMISSION_UPDATE", notificationTitle, message, details);
                        logger.info("✅ [MeetingService] Commission update notifications sent to buyer and seller");
                    } catch (Exception emailError) {
                        logger.warn("⚠️ [MeetingService] Failed to send commission update notifications: {}", emailError.getMessage());
                        // Don't fail the whole operation due to email issues
                    }
                } else {
                    logger.warn("⚠️ [MeetingService] Could not find buyer or seller users for email notifications");
                }
            } catch (Exception emailError) {
                logger.error("⚠️ [MeetingService] Failed to send commission update notifications: {}", emailError.getMessage());
                // Don't fail the whole operation due to email issues
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("❌ [MeetingService] Error updating commission for meeting {}: {}", meetingId, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to update commission: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return response;
        }
    }
}
