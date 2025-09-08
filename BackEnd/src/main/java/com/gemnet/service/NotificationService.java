package com.gemnet.service;

import com.gemnet.model.Notification;
import com.gemnet.model.User;
import com.gemnet.repository.NotificationRepository;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for creating and managing system notifications to admins
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;

    /**
     * Create admin notification for system events
     */
    public void createAdminNotification(String type, String title, String message, 
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
            
            // Send admin email notifications
            try {
                String details = "Related: " + relatedName + " | Triggered by: " + getTriggeredByUserName(triggerUserId);
                emailService.sendAdminNotificationEmail(type, title, message, details);
                System.out.println("📧 Admin email notifications sent for: " + type);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send admin email notifications: " + e.getMessage());
                // Don't fail the notification creation if email fails
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error creating admin notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Helper method to get user name by ID
     */
    private String getTriggeredByUserName(String userId) {
        try {
            if (userId != null) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    return user.getFirstName() + " " + user.getLastName();
                }
            }
            return "System";
        } catch (Exception e) {
            return "Unknown User";
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
}
