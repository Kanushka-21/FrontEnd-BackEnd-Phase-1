package com.gemnet.service;

import com.gemnet.model.Meeting;
import com.gemnet.model.User;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoShowManagementService {
    
    private static final Logger logger = LoggerFactory.getLogger(NoShowManagementService.class);
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Admin marks attendance for a meeting
     */
    public Map<String, Object> markAttendance(String meetingId, String adminId, 
                                            Boolean buyerAttended, Boolean sellerAttended, 
                                            String adminNotes) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Admin {} marking attendance for meeting: {}", adminId, meetingId);
            
            // Find the meeting
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Check if meeting is confirmed
            if (!"CONFIRMED".equals(meeting.getStatus())) {
                response.put("success", false);
                response.put("message", "Only confirmed meetings can have attendance marked");
                return response;
            }
            
            // Update attendance
            meeting.setBuyerAttended(buyerAttended);
            meeting.setSellerAttended(sellerAttended);
            meeting.setAdminVerified(true);
            meeting.setVerifiedAt(LocalDateTime.now());
            meeting.setVerifiedBy(adminId);
            
            if (adminNotes != null && !adminNotes.trim().isEmpty()) {
                meeting.setAdminNotes(adminNotes);
            }
            
            // Determine meeting status based on attendance
            if (Boolean.TRUE.equals(buyerAttended) && Boolean.TRUE.equals(sellerAttended)) {
                meeting.setStatus("COMPLETED");
            } else {
                meeting.setStatus("NO_SHOW_RECORDED");
            }
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Process no-shows
            if (Boolean.FALSE.equals(buyerAttended)) {
                processNoShow(meeting.getBuyerId(), meetingId, "buyer");
            }
            
            if (Boolean.FALSE.equals(sellerAttended)) {
                processNoShow(meeting.getSellerId(), meetingId, "seller");
            }
            
            // Send notifications to both parties
            sendAttendanceNotifications(savedMeeting, buyerAttended, sellerAttended);
            
            response.put("success", true);
            response.put("message", "Attendance marked successfully");
            response.put("meeting", savedMeeting);
            
            logger.info("✅ Attendance marked successfully for meeting: {}", meetingId);
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Error marking attendance for meeting {}: {}", meetingId, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to mark attendance: " + e.getMessage());
            return response;
        }
    }
    
    /**
     * Process no-show for a user
     */
    private void processNoShow(String userId, String meetingId, String userRole) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                logger.warn("User not found for no-show processing: {}", userId);
                return;
            }
            
            User user = userOpt.get();
            
            // Check if user has submitted a valid reason
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (meetingOpt.isPresent()) {
                Meeting meeting = meetingOpt.get();
                boolean hasValidReason = false;
                
                if ("buyer".equals(userRole)) {
                    hasValidReason = Boolean.TRUE.equals(meeting.getBuyerReasonAccepted());
                } else if ("seller".equals(userRole)) {
                    hasValidReason = Boolean.TRUE.equals(meeting.getSellerReasonAccepted());
                }
                
                if (hasValidReason) {
                    logger.info("User {} has valid reason for absence, no-show not counted", userId);
                    return;
                }
            }
            
            // Increment no-show count
            int currentCount = user.getNoShowCount() != null ? user.getNoShowCount() : 0;
            currentCount++;
            
            user.setNoShowCount(currentCount);
            user.setLastNoShowDate(LocalDateTime.now());
            
            // Determine action based on no-show count
            if (currentCount == 1) {
                // First no-show - warning
                user.setAccountStatus("WARNED");
                sendWarningNotification(user, meetingId);
                logger.info("User {} received first warning for no-show", userId);
                
            } else if (currentCount >= 2) {
                // Second+ no-show - block user
                user.setAccountStatus("BLOCKED");
                user.setIsActive(false);
                user.setBlockingReason("Repeated no-shows in meetings (" + currentCount + " times)");
                user.setBlockedAt(LocalDateTime.now());
                sendBlockingNotification(user, meetingId);
                logger.info("User {} blocked due to {} no-shows", userId, currentCount);
            }
            
            userRepository.save(user);
            
        } catch (Exception e) {
            logger.error("Error processing no-show for user {}: {}", userId, e.getMessage(), e);
        }
    }
    
    /**
     * Send warning notification for first no-show
     */
    private void sendWarningNotification(User user, String meetingId) {
        try {
            String title = "⚠️ Meeting No-Show Warning";
            String message = String.format(
                "Dear %s,\n\n" +
                "You were marked as a no-show for meeting ID: %s\n\n" +
                "This is your FIRST WARNING. Please note that:\n" +
                "• If you fail to attend another confirmed meeting, your account will be BLOCKED\n" +
                "• Always submit a valid reason if you cannot attend a meeting\n" +
                "• Contact support if you believe this is an error\n\n" +
                "Please ensure you attend all future confirmed meetings on time.\n\n" +
                "Best regards,\nGemNet Team",
                user.getFirstName(),
                meetingId.substring(0, 8).toUpperCase()
            );
            
            // Send system notification
            try {
                notificationService.sendNotification(
                    user.getId(),
                    "NO_SHOW_WARNING",
                    title,
                    message,
                    "Meeting ID: " + meetingId + " | No-Show Count: " + user.getNoShowCount() + "/2"
                );
            } catch (Exception e) {
                logger.error("Error sending warning notification: {}", e.getMessage());
            }
            
            // Send email
            try {
                emailService.sendWarningEmail(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    user.getNoShowCount()
                );
            } catch (Exception e) {
                logger.error("Error sending warning email: {}", e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error sending warning notification to user {}: {}", user.getId(), e.getMessage());
        }
    }
    
    /**
     * Send blocking notification for second+ no-show
     */
    private void sendBlockingNotification(User user, String meetingId) {
        try {
            String title = "🚫 Account Blocked - No-Show Policy";
            String message = String.format(
                "Dear %s,\n\n" +
                "Your account has been BLOCKED due to repeated no-shows in confirmed meetings.\n\n" +
                "Details:\n" +
                "• Total no-shows: %d\n" +
                "• Latest meeting: %s\n" +
                "• Blocked on: %s\n\n" +
                "Your account is now deactivated and you cannot:\n" +
                "• Log into the system\n" +
                "• Access GemNet services\n" +
                "• Participate in any transactions\n\n" +
                "To appeal this decision, please contact support with valid documentation.\n\n" +
                "Best regards,\nGemNet Team",
                user.getFirstName(),
                user.getNoShowCount(),
                meetingId.substring(0, 8).toUpperCase(),
                LocalDateTime.now().toString()
            );
            
            // Send system notification
            try {
                notificationService.sendNotification(
                    user.getId(),
                    "ACCOUNT_BLOCKED",
                    title,
                    message,
                    "Account blocked due to repeated no-shows. No-Show Count: " + user.getNoShowCount()
                );
            } catch (Exception e) {
                logger.error("Error sending blocking notification: {}", e.getMessage());
            }
            
            // Send email
            try {
                emailService.sendBlockingEmail(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    "Multiple no-shows: " + user.getNoShowCount() + " meetings missed"
                );
            } catch (Exception e) {
                logger.error("Error sending blocking email: {}", e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error sending blocking notification to user {}: {}", user.getId(), e.getMessage());
        }
    }
    
    /**
     * Send attendance notifications to both parties
     */
    private void sendAttendanceNotifications(Meeting meeting, Boolean buyerAttended, Boolean sellerAttended) {
        try {
            // Get users
            Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
            Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
            
            if (!buyerOpt.isPresent() || !sellerOpt.isPresent()) {
                logger.warn("Missing user details for attendance notifications");
                return;
            }
            
            User buyer = buyerOpt.get();
            User seller = sellerOpt.get();
            
            String meetingDisplayId = meeting.getMeetingDisplayId() != null ? 
                meeting.getMeetingDisplayId() : meeting.getId().substring(0, 8).toUpperCase();
            
            // Send notification to buyer
            sendAttendanceNotificationToUser(buyer, meeting, buyerAttended, "buyer", meetingDisplayId);
            
            // Send notification to seller
            sendAttendanceNotificationToUser(seller, meeting, sellerAttended, "seller", meetingDisplayId);
            
        } catch (Exception e) {
            logger.error("Error sending attendance notifications: {}", e.getMessage());
        }
    }
    
    /**
     * Send attendance notification to specific user
     */
    private void sendAttendanceNotificationToUser(User user, Meeting meeting, Boolean attended, 
                                                String userRole, String meetingDisplayId) {
        try {
            String title;
            String message;
            
            if (Boolean.TRUE.equals(attended)) {
                title = "✅ Meeting Completed Successfully";
                message = String.format(
                    "Dear %s,\n\n" +
                    "Your meeting for %s has been completed successfully!\n\n" +
                    "📅 Meeting ID: %s\n" +
                    "💎 Gemstone: %s\n" +
                    "📍 Location: %s\n" +
                    "⏰ Date: %s\n\n" +
                    "Thank you for your punctuality and professionalism.\n\n" +
                    "Best regards,\nGemNet Team",
                    user.getFirstName(),
                    meeting.getGemName(),
                    meetingDisplayId,
                    meeting.getGemName(),
                    meeting.getLocation(),
                    meeting.getConfirmedDateTime()
                );
            } else {
                title = "❌ Meeting No-Show Recorded";
                message = String.format(
                    "Dear %s,\n\n" +
                    "You were marked as a no-show for meeting ID: %s\n\n" +
                    "💎 Gemstone: %s\n" +
                    "📍 Location: %s\n" +
                    "⏰ Scheduled Date: %s\n\n" +
                    "Please check your account status and contact support if you believe this is an error.\n\n" +
                    "Best regards,\nGemNet Team",
                    user.getFirstName(),
                    meetingDisplayId,
                    meeting.getGemName(),
                    meeting.getLocation(),
                    meeting.getConfirmedDateTime()
                );
            }
            
            // Send notification
            try {
                notificationService.sendNotification(
                    user.getId(),
                    attended ? "MEETING_COMPLETED" : "NO_SHOW_RECORDED",
                    title,
                    message,
                    "Meeting attendance status: " + (attended ? "Attended" : "No Show")
                );
            } catch (Exception e) {
                logger.error("Error sending attendance notification: {}", e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error creating attendance notification for user {}: {}", user.getId(), e.getMessage());
        }
    }
    
    /**
     * Submit reason for absence
     */
    public Map<String, Object> submitAbsenceReason(String meetingId, String userId, String reason) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 User {} submitting absence reason for meeting: {}", userId, meetingId);
            
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify user is part of this meeting
            if (!meeting.getBuyerId().equals(userId) && !meeting.getSellerId().equals(userId)) {
                response.put("success", false);
                response.put("message", "You are not authorized to submit reason for this meeting");
                return response;
            }
            
            // Update reason based on user role
            if (meeting.getBuyerId().equals(userId)) {
                meeting.setBuyerReasonSubmission(reason);
            } else {
                meeting.setSellerReasonSubmission(reason);
            }
            
            meetingRepository.save(meeting);
            
            // Notify admin about reason submission
            notifyAdminOfReasonSubmission(meeting, userId, reason);
            
            response.put("success", true);
            response.put("message", "Absence reason submitted successfully");
            response.put("meeting", meeting);
            
            logger.info("✅ Absence reason submitted successfully for meeting: {}", meetingId);
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Error submitting absence reason: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to submit reason: " + e.getMessage());
            return response;
        }
    }
    
    /**
     * Admin accept/reject absence reason
     */
    public Map<String, Object> reviewAbsenceReason(String meetingId, String userId, boolean accepted, String adminNotes) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Admin reviewing absence reason for user {} in meeting: {}", userId, meetingId);
            
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Meeting not found");
                return response;
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Update reason acceptance based on user role
            if (meeting.getBuyerId().equals(userId)) {
                meeting.setBuyerReasonAccepted(accepted);
            } else if (meeting.getSellerId().equals(userId)) {
                meeting.setSellerReasonAccepted(accepted);
            } else {
                response.put("success", false);
                response.put("message", "User not found in this meeting");
                return response;
            }
            
            if (adminNotes != null && !adminNotes.trim().isEmpty()) {
                String currentNotes = meeting.getAdminNotes() != null ? meeting.getAdminNotes() : "";
                meeting.setAdminNotes(currentNotes + "\n[Reason Review] " + adminNotes);
            }
            
            meetingRepository.save(meeting);
            
            // Notify user about decision
            notifyUserOfReasonDecision(userId, meeting, accepted);
            
            response.put("success", true);
            response.put("message", "Reason " + (accepted ? "accepted" : "rejected") + " successfully");
            response.put("meeting", meeting);
            
            logger.info("✅ Absence reason {} for user {} in meeting: {}", 
                accepted ? "accepted" : "rejected", userId, meetingId);
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Error reviewing absence reason: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to review reason: " + e.getMessage());
            return response;
        }
    }
    
    /**
     * Notify admin about reason submission
     */
    private void notifyAdminOfReasonSubmission(Meeting meeting, String userId, String reason) {
        try {
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!userOpt.isPresent()) return;
            
            User user = userOpt.get();
            String userRole = meeting.getBuyerId().equals(userId) ? "Buyer" : "Seller";
            String meetingDisplayId = meeting.getMeetingDisplayId() != null ? 
                meeting.getMeetingDisplayId() : meeting.getId().substring(0, 8).toUpperCase();
            
            String title = "📝 Absence Reason Submitted";
            String message = String.format(
                "A user has submitted an absence reason for review:\n\n" +
                "📅 Meeting ID: %s\n" +
                "👤 User: %s (%s)\n" +
                "🔄 Role: %s\n" +
                "💎 Gemstone: %s\n" +
                "📍 Location: %s\n" +
                "⏰ Date: %s\n\n" +
                "📝 Reason: %s\n\n" +
                "Please review and accept/reject this reason in the admin dashboard.",
                meetingDisplayId,
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                userRole,
                meeting.getGemName(),
                meeting.getLocation(),
                meeting.getConfirmedDateTime(),
                reason
            );
            
            for (User admin : adminUsers) {
                try {
                    notificationService.sendNotification(
                        admin.getId(),
                        "ADMIN_REASON_REVIEW",
                        title,
                        message,
                        "User: " + user.getFirstName() + " " + user.getLastName() + " | Reason: " + reason
                    );
                } catch (Exception e) {
                    logger.error("Error sending admin notification: {}", e.getMessage());
                }
            }
            
        } catch (Exception e) {
            logger.error("Error notifying admin of reason submission: {}", e.getMessage());
        }
    }
    
    /**
     * Notify user about reason decision
     */
    private void notifyUserOfReasonDecision(String userId, Meeting meeting, boolean accepted) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) return;
            
            User user = userOpt.get();
            String meetingDisplayId = meeting.getMeetingDisplayId() != null ? 
                meeting.getMeetingDisplayId() : meeting.getId().substring(0, 8).toUpperCase();
            
            String title = accepted ? "✅ Absence Reason Accepted" : "❌ Absence Reason Rejected";
            String message = String.format(
                "Dear %s,\n\n" +
                "Your absence reason for meeting %s has been %s by admin.\n\n" +
                "💎 Gemstone: %s\n" +
                "📍 Location: %s\n" +
                "⏰ Date: %s\n\n" +
                "%s\n\n" +
                "Best regards,\nGemNet Team",
                user.getFirstName(),
                meetingDisplayId,
                accepted ? "ACCEPTED" : "REJECTED",
                meeting.getGemName(),
                meeting.getLocation(),
                meeting.getConfirmedDateTime(),
                accepted ? 
                    "No penalty will be applied to your account for this absence." :
                    "This absence will count as a no-show. Please contact support if you wish to appeal."
            );
            
            notificationService.sendNotification(
                userId,
                accepted ? "REASON_ACCEPTED" : "REASON_REJECTED",
                title,
                message,
                "Admin decision: " + (accepted ? "Reason accepted, no penalty" : "Reason rejected, penalty applied")
            );
            
        } catch (Exception e) {
            logger.error("Error notifying user of reason decision: {}", e.getMessage());
        }
    }
    
    /**
     * Get user no-show statistics
     */
    public Map<String, Object> getUserNoShowStats(String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                stats.put("success", false);
                stats.put("message", "User not found");
                return stats;
            }
            
            User user = userOpt.get();
            
            stats.put("success", true);
            stats.put("noShowCount", user.getNoShowCount() != null ? user.getNoShowCount() : 0);
            stats.put("accountStatus", user.getAccountStatus() != null ? user.getAccountStatus() : "ACTIVE");
            stats.put("lastNoShowDate", user.getLastNoShowDate());
            stats.put("isBlocked", "BLOCKED".equals(user.getAccountStatus()));
            stats.put("blockingReason", user.getBlockingReason());
            stats.put("blockedAt", user.getBlockedAt());
            
            return stats;
            
        } catch (Exception e) {
            logger.error("Error getting user no-show stats: {}", e.getMessage());
            stats.put("success", false);
            stats.put("message", "Error retrieving stats: " + e.getMessage());
            return stats;
        }
    }

    /**
     * Get all no-show records for admin dashboard
     */
    public List<Map<String, Object>> getNoShowRecords() {
        List<Map<String, Object>> records = new ArrayList<>();
        
        try {
            logger.info("🔄 Getting all no-show records for admin dashboard");
            
            // Get all users with no-show count > 0
            List<User> usersWithNoShows = userRepository.findAll().stream()
                .filter(user -> user.getNoShowCount() != null && user.getNoShowCount() > 0)
                .collect(Collectors.toList());
            
            for (User user : usersWithNoShows) {
                Map<String, Object> record = new HashMap<>();
                record.put("id", user.getId());
                record.put("userId", user.getId());
                record.put("userName", user.getFirstName() + " " + user.getLastName());
                record.put("userEmail", user.getEmail());
                record.put("userPhone", user.getPhoneNumber());
                record.put("noShowCount", user.getNoShowCount());
                record.put("lastNoShowDate", user.getLastNoShowDate());
                record.put("status", user.getAccountStatus() != null ? user.getAccountStatus() : "ACTIVE");
                record.put("userType", user.getUserRole() != null ? user.getUserRole().toUpperCase() : "USER");
                record.put("blockingReason", user.getBlockingReason());
                record.put("blockedAt", user.getBlockedAt());
                
                records.add(record);
            }
            
            logger.info("✅ Retrieved {} no-show records", records.size());
            return records;
            
        } catch (Exception e) {
            logger.error("❌ Error getting no-show records: {}", e.getMessage());
            return records; // Return empty list on error
        }
    }

    /**
     * Get no-show statistics for admin dashboard
     */
    public Map<String, Object> getNoShowStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            logger.info("🔄 Getting no-show statistics for admin dashboard");
            
            List<User> allUsers = userRepository.findAll();
            
            long totalUsers = allUsers.size();
            long activeUsers = allUsers.stream()
                .filter(user -> "ACTIVE".equals(user.getAccountStatus()) || user.getAccountStatus() == null)
                .count();
            long warningUsers = allUsers.stream()
                .filter(user -> "WARNING".equals(user.getAccountStatus()))
                .count();
            long blockedUsers = allUsers.stream()
                .filter(user -> "BLOCKED".equals(user.getAccountStatus()))
                .count();
            long usersWithNoShows = allUsers.stream()
                .filter(user -> user.getNoShowCount() != null && user.getNoShowCount() > 0)
                .count();
            
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("warningUsers", warningUsers);
            stats.put("blockedUsers", blockedUsers);
            stats.put("usersWithNoShows", usersWithNoShows);
            stats.put("totalNoShowRecords", usersWithNoShows);
            
            logger.info("✅ Retrieved no-show statistics");
            return stats;
            
        } catch (Exception e) {
            logger.error("❌ Error getting no-show statistics: {}", e.getMessage());
            stats.put("totalUsers", 0);
            stats.put("activeUsers", 0);
            stats.put("warningUsers", 0);
            stats.put("blockedUsers", 0);
            stats.put("usersWithNoShows", 0);
            stats.put("totalNoShowRecords", 0);
            return stats;
        }
    }

    /**
     * Get meetings requiring verification (confirmed meetings without attendance marked)
     */
    public List<Meeting> getMeetingsRequiringVerification() {
        try {
            logger.info("🔄 Getting meetings requiring verification");
            
            List<Meeting> confirmedMeetings = meetingRepository.findByStatus("CONFIRMED");
            List<Meeting> requiresVerification = confirmedMeetings.stream()
                .filter(meeting -> meeting.getAdminVerified() == null || !meeting.getAdminVerified())
                .collect(Collectors.toList());
            
            logger.info("✅ Found {} meetings requiring verification", requiresVerification.size());
            return requiresVerification;
            
        } catch (Exception e) {
            logger.error("❌ Error getting meetings requiring verification: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Admin unblock a blocked user
     */
    public Map<String, Object> unblockUser(String userId, String adminId, String reason) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔓 Admin {} unblocking user: {}", adminId, userId);
            
            // Find the user
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }
            
            User user = userOpt.get();
            
            // Check if user is actually blocked
            if (!"BLOCKED".equals(user.getAccountStatus())) {
                response.put("success", false);
                response.put("message", "User is not currently blocked");
                return response;
            }
            
            // Update user status
            user.setAccountStatus("ACTIVE");
            user.setBlockingReason(null);
            user.setBlockedAt(null);
            
            // Reduce no-show count by 1 as administrative grace when unblocking
            int currentNoShowCount = user.getNoShowCount();
            if (currentNoShowCount > 0) {
                user.setNoShowCount(currentNoShowCount - 1);
                logger.info("🔄 Reduced no-show count from {} to {} for unblocked user {}", 
                           currentNoShowCount, currentNoShowCount - 1, userId);
            }
            
            // Save user
            userRepository.save(user);
            
            // Send unblock notification email
            try {
                emailService.sendNotificationEmail(
                    userId,
                    "ACCOUNT_UNBLOCKED",
                    "Account Unblocked",
                    "Your account has been unblocked by an administrator. You can now access the system normally.",
                    reason != null && !reason.trim().isEmpty() ? "Admin note: " + reason : "No additional notes provided"
                );
                logger.info("✅ Unblock notification email sent to: {}", user.getEmail());
            } catch (Exception emailError) {
                logger.warn("⚠️ Failed to send unblock email to {}: {}", user.getEmail(), emailError.getMessage());
            }
            
            // Create notification
            try {
                notificationService.createNotification(
                    userId,
                    "ACCOUNT_UNBLOCKED",
                    "Account Unblocked",
                    "Your account has been unblocked by an administrator. You can now access the system normally.",
                    "Unblocked by admin: " + adminId
                );
                logger.info("✅ Unblock notification created for user: {}", userId);
            } catch (Exception notifError) {
                logger.warn("⚠️ Failed to create unblock notification for {}: {}", userId, notifError.getMessage());
            }
            
            response.put("success", true);
            response.put("message", "User successfully unblocked");
            response.put("userId", userId);
            response.put("newStatus", "ACTIVE");
            response.put("newNoShowCount", user.getNoShowCount());
            response.put("unblockedBy", adminId);
            response.put("unblockedAt", LocalDateTime.now().toString());
            
            logger.info("✅ User {} successfully unblocked by admin {} (no-show count reduced to {})", userId, adminId, user.getNoShowCount());
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Error unblocking user {}: {}", userId, e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to unblock user: " + e.getMessage());
            return response;
        }
    }

    /**
     * Get list of blocked users for admin management
     */
    public Map<String, Object> getBlockedUsers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting blocked users");
            
            List<User> allUsers = userRepository.findAll();
            List<Map<String, Object>> blockedUsers = allUsers.stream()
                .filter(user -> "BLOCKED".equals(user.getAccountStatus()))
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("firstName", user.getFirstName());
                    userInfo.put("lastName", user.getLastName());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("userRole", user.getUserRole());
                    userInfo.put("noShowCount", user.getNoShowCount());
                    userInfo.put("blockingReason", user.getBlockingReason());
                    userInfo.put("blockedAt", user.getBlockedAt());
                    userInfo.put("lastNoShowDate", user.getLastNoShowDate());
                    return userInfo;
                })
                .collect(Collectors.toList());
            
            response.put("success", true);
            response.put("blockedUsers", blockedUsers);
            response.put("totalBlocked", blockedUsers.size());
            response.put("message", "Blocked users retrieved successfully");
            
            logger.info("✅ Retrieved {} blocked users", blockedUsers.size());
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Error getting blocked users: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to retrieve blocked users: " + e.getMessage());
            response.put("blockedUsers", new ArrayList<>());
            response.put("totalBlocked", 0);
            return response;
        }
    }
    
}
