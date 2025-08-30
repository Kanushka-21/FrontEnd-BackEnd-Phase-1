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
            meeting.setStatus("PENDING");
            
            // Calculate commission (5% by default)
            double commissionRate = 0.05; // 5%
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
     * Get meeting by ID
     */
    public Optional<Meeting> getMeetingById(String meetingId) {
        return meetingRepository.findById(meetingId);
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
     * Get all meetings for admin dashboard
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
}
