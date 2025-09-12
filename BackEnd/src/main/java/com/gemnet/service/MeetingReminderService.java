package com.gemnet.service;

import com.gemnet.model.Meeting;
import com.gemnet.model.User;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingReminderService {
    
    private static final Logger logger = LoggerFactory.getLogger(MeetingReminderService.class);
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Send 12-hour reminders for confirmed meetings
     * Runs every hour to check for meetings
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void send12HourReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reminderTime = now.plusHours(12);
            
            // Find confirmed meetings scheduled for 12 hours from now
            List<Meeting> meetings = meetingRepository.findByStatusAndConfirmedDateTimeBetween(
                "CONFIRMED", 
                reminderTime.minusMinutes(30), 
                reminderTime.plusMinutes(30)
            );
            
            for (Meeting meeting : meetings) {
                if (!hasReminderBeenSent(meeting, 12)) {
                    sendMeetingReminder(meeting, "12-hour");
                    updateReminderSent(meeting);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error sending 12-hour reminders: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send 6-hour reminders for confirmed meetings
     * Runs every 30 minutes to check for meetings
     */
    @Scheduled(fixedRate = 1800000) // Every 30 minutes
    public void send6HourReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reminderTime = now.plusHours(6);
            
            // Find confirmed meetings scheduled for 6 hours from now
            List<Meeting> meetings = meetingRepository.findByStatusAndConfirmedDateTimeBetween(
                "CONFIRMED", 
                reminderTime.minusMinutes(15), 
                reminderTime.plusMinutes(15)
            );
            
            for (Meeting meeting : meetings) {
                if (!hasReminderBeenSent(meeting, 6)) {
                    sendMeetingReminder(meeting, "6-hour");
                    updateReminderSent(meeting);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error sending 6-hour reminders: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send meeting reminder to both buyer and seller + admin
     */
    private void sendMeetingReminder(Meeting meeting, String reminderType) {
        try {
            logger.info("Sending {} reminder for meeting: {}", reminderType, meeting.getId());
            
            // Get buyer and seller details
            Optional<User> buyerOpt = userRepository.findById(meeting.getBuyerId());
            Optional<User> sellerOpt = userRepository.findById(meeting.getSellerId());
            
            if (!buyerOpt.isPresent() || !sellerOpt.isPresent()) {
                logger.warn("Missing user details for meeting: {}", meeting.getId());
                return;
            }
            
            User buyer = buyerOpt.get();
            User seller = sellerOpt.get();
            
            String meetingDisplayId = meeting.getMeetingDisplayId() != null ? 
                meeting.getMeetingDisplayId() : meeting.getId().substring(0, 8).toUpperCase();
            
            // Send notifications to buyer
            sendReminderNotification(buyer, meeting, reminderType, "BUYER", meetingDisplayId);
            
            // Send notifications to seller
            sendReminderNotification(seller, meeting, reminderType, "SELLER", meetingDisplayId);
            
            // Send notification to admin
            sendAdminReminderNotification(meeting, reminderType, buyer, seller, meetingDisplayId);
            
            logger.info("✅ {} reminder sent successfully for meeting: {}", reminderType, meeting.getId());
            
        } catch (Exception e) {
            logger.error("❌ Error sending {} reminder for meeting {}: {}", 
                reminderType, meeting.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Send reminder notification to user (buyer or seller)
     */
    private void sendReminderNotification(User user, Meeting meeting, String reminderType, 
                                        String userRole, String meetingDisplayId) {
        try {
            String title = String.format("Meeting Reminder - %s", reminderType);
            String message = String.format(
                "🔔 REMINDER: Your meeting for %s is scheduled in %s!\n\n" +
                "📅 Meeting ID: %s\n" +
                "💎 Gemstone: %s\n" +
                "📍 Location: %s\n" +
                "⏰ Date & Time: %s\n" +
                "💰 Final Price: $%.2f\n\n" +
                "Please ensure you arrive on time. Contact details will be shared closer to the meeting time.",
                meeting.getGemName(),
                reminderType.replace("-", " "),
                meetingDisplayId,
                meeting.getGemName(),
                meeting.getLocation(),
                meeting.getConfirmedDateTime().toString(),
                meeting.getFinalPrice()
            );
            
            // Send system notification
            notificationService.createNotification(
                user.getId(),
                "MEETING_REMINDER",
                title,
                message,
                "Meeting: " + meeting.getMeetingDisplayId() + " | Reminder sent"
            );
            
            // Send email notification
            emailService.sendMeetingReminderEmail(
                user.getId(),
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                meetingDisplayId,
                meeting.getGemName(),
                meeting.getConfirmedDateTime().toString(),
                meeting.getLocation(),
                getOtherPartyName(meeting, user.getId()),
                reminderType.equals("12_HOUR") ? "12" : "6"
            );
            
        } catch (Exception e) {
            logger.error("Error sending reminder to user {}: {}", user.getId(), e.getMessage());
        }
    }
    
    /**
     * Send reminder notification to admin
     */
    private void sendAdminReminderNotification(Meeting meeting, String reminderType, 
                                             User buyer, User seller, String meetingDisplayId) {
        try {
            // Find all admin users
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            
            String title = String.format("Admin Meeting Reminder - %s", reminderType);
            String message = String.format(
                "🔔 ADMIN REMINDER: Meeting scheduled in %s\n\n" +
                "📅 Meeting ID: %s\n" +
                "💎 Gemstone: %s\n" +
                "🛒 Buyer: %s (%s)\n" +
                "🏪 Seller: %s (%s)\n" +
                "📍 Location: %s\n" +
                "⏰ Date & Time: %s\n" +
                "💰 Final Price: $%.2f\n\n" +
                "Please prepare for attendance verification after the meeting.",
                reminderType.replace("-", " "),
                meetingDisplayId,
                meeting.getGemName(),
                buyer.getFirstName() + " " + buyer.getLastName(),
                buyer.getPhoneNumber(),
                seller.getFirstName() + " " + seller.getLastName(),
                seller.getPhoneNumber(),
                meeting.getLocation(),
                meeting.getConfirmedDateTime().toString(),
                meeting.getFinalPrice()
            );
            
            for (User admin : adminUsers) {
                notificationService.createNotification(
                    admin.getId(),
                    "ADMIN_MEETING_REMINDER",
                    title,
                    message,
                    "Meeting: " + meeting.getMeetingDisplayId() + " | Verification Required"
                );
                
                // Send email to admin
                emailService.sendAdminMeetingReminderEmail(
                    meetingDisplayId,
                    meeting.getGemName(),
                    meeting.getConfirmedDateTime().toString(),
                    meeting.getLocation(),
                    buyer.getFirstName() + " " + buyer.getLastName(),
                    seller.getFirstName() + " " + seller.getLastName()
                );
            }
            
        } catch (Exception e) {
            logger.error("Error sending admin reminder: {}", e.getMessage());
        }
    }
    
    /**
     * Check if reminder has already been sent for this meeting
     */
    private boolean hasReminderBeenSent(Meeting meeting, int hours) {
        if (meeting.getRemindersSent() == null || meeting.getRemindersSent().isEmpty()) {
            return false;
        }
        
        LocalDateTime cutoff = LocalDateTime.now().minusHours(hours + 1);
        return meeting.getRemindersSent().stream()
            .anyMatch(reminderTime -> reminderTime.isAfter(cutoff));
    }
    
    /**
     * Update meeting with reminder sent timestamp
     */
    private void updateReminderSent(Meeting meeting) {
        try {
            if (meeting.getRemindersSent() == null) {
                meeting.setRemindersSent(List.of(LocalDateTime.now()));
            } else {
                meeting.getRemindersSent().add(LocalDateTime.now());
            }
            meetingRepository.save(meeting);
        } catch (Exception e) {
            logger.error("Error updating reminder sent for meeting {}: {}", meeting.getId(), e.getMessage());
        }
    }
    
    /**
     * Generate human-readable meeting ID
     */
    public String generateMeetingDisplayId(Meeting meeting) {
        try {
            LocalDateTime now = LocalDateTime.now();
            String year = String.valueOf(now.getYear());
            
            // Count meetings created today
            LocalDateTime startOfDay = now.truncatedTo(ChronoUnit.DAYS);
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            
            long todayMeetingCount = meetingRepository.countByCreatedAtBetween(startOfDay, endOfDay);
            
            return String.format("GEM-%s-%03d", year, todayMeetingCount + 1);
            
        } catch (Exception e) {
            logger.error("Error generating meeting display ID: {}", e.getMessage());
            return "GEM-" + meeting.getId().substring(0, 8).toUpperCase();
        }
    }

    /**
     * Get the name of the other party in the meeting
     */
    private String getOtherPartyName(Meeting meeting, String currentUserId) {
        try {
            String otherUserId = meeting.getBuyerId().equals(currentUserId) ? 
                                meeting.getSellerId() : meeting.getBuyerId();
            
            Optional<User> otherUserOpt = userRepository.findById(otherUserId);
            if (otherUserOpt.isPresent()) {
                User otherUser = otherUserOpt.get();
                return otherUser.getFirstName() + " " + otherUser.getLastName();
            }
            return "Other Party";
        } catch (Exception e) {
            return "Other Party";
        }
    }
}
