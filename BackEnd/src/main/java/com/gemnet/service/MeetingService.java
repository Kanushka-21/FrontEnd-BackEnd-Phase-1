package com.gemnet.service;

import com.gemnet.model.Meeting;
import com.gemnet.model.GemListing;
import com.gemnet.model.User;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.repository.UserRepository;
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
    
    /**
     * Create a new meeting for a purchase
     */
    public Map<String, Object> createMeeting(String purchaseId, String buyerId, LocalDateTime proposedDateTime, 
                                           String location, String meetingType, String buyerNotes) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Check if meeting already exists for this purchase
            Optional<Meeting> existingMeeting = meetingRepository.findByPurchaseId(purchaseId);
            if (existingMeeting.isPresent()) {
                result.put("success", false);
                result.put("message", "Meeting already exists for this purchase");
                return result;
            }
            
            // Get purchase/gem listing details
            Optional<GemListing> gemListingOpt = gemListingRepository.findById(purchaseId);
            if (!gemListingOpt.isPresent()) {
                result.put("success", false);
                result.put("message", "Purchase not found");
                return result;
            }
            
            GemListing gemListing = gemListingOpt.get();
            
            // Get buyer and seller details
            Optional<User> buyerOpt = userRepository.findById(buyerId);
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
            meeting.setBuyerId(buyerId);
            meeting.setSellerId(gemListing.getUserId());
            meeting.setPurchaseId(purchaseId);
            meeting.setGemName(gemListing.getGemName());
            meeting.setGemType(gemListing.getVariety());
            meeting.setFinalPrice(gemListing.getFinalPrice().doubleValue());
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
            meeting.setCommissionAmount(gemListing.getFinalPrice().doubleValue() * commissionRate);
            meeting.setPaymentStatus("PENDING");
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Send notification to seller
            String notificationMessage = String.format(
                "New meeting request for your %s (%s) from buyer %s. Proposed time: %s",
                gemListing.getGemName(),
                gemListing.getVariety(),
                buyer.getFirstName() + " " + buyer.getLastName(),
                proposedDateTime.toString()
            );
            
            // TODO: Implement notification service integration
            logger.info("Meeting request notification would be sent to seller: {}", gemListing.getUserId());
            logger.info("Notification message: {}", notificationMessage);
            
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
            
            // Send notification to buyer
            String notificationMessage = String.format(
                "Your meeting for %s has been confirmed for %s at %s",
                meeting.getGemName(),
                meeting.getConfirmedDateTime().toString(),
                meeting.getLocation()
            );
            
            // TODO: Implement notification service integration
            logger.info("Meeting confirmation notification would be sent to buyer: {}", meeting.getBuyerId());
            logger.info("Notification message: {}", notificationMessage);
            
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
            
            // Send notification to other party
            String otherUserId = meeting.getBuyerId().equals(userId) ? meeting.getSellerId() : meeting.getBuyerId();
            String userRole = meeting.getBuyerId().equals(userId) ? "buyer" : "seller";
            
            String notificationMessage = String.format(
                "Meeting for %s has been rescheduled by the %s. New proposed time: %s",
                meeting.getGemName(),
                userRole,
                newDateTime.toString()
            );
            
            // TODO: Implement notification service integration
            logger.info("Meeting reschedule notification would be sent to user: {}", otherUserId);
            logger.info("Notification message: {}", notificationMessage);
            
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
            
            // Send notification to both parties
            String completionMessage = String.format(
                "Meeting for %s has been marked as completed. Transaction finalized.",
                meeting.getGemName()
            );
            
            // TODO: Implement notification service integration
            logger.info("Meeting completion notification would be sent to buyer: {}", meeting.getBuyerId());
            logger.info("Meeting completion notification would be sent to seller: {}", meeting.getSellerId());
            logger.info("Notification message: {}", completionMessage);
            
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
            
            // Send notification to other party
            String otherUserId = meeting.getBuyerId().equals(userId) ? meeting.getSellerId() : meeting.getBuyerId();
            String userRole = meeting.getBuyerId().equals(userId) ? "buyer" : "seller";
            
            String notificationMessage = String.format(
                "Meeting for %s has been cancelled by the %s. Reason: %s",
                meeting.getGemName(),
                userRole,
                reason
            );
            
            // TODO: Implement notification service integration
            logger.info("Meeting cancellation notification would be sent to user: {}", otherUserId);
            logger.info("Notification message: {}", notificationMessage);
            
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
