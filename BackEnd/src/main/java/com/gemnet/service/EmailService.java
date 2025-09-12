package com.gemnet.service;

import com.gemnet.model.User;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.fromName:GemNet System}")
    private String fromName;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    /**
     * Send notification email to specific user (buyer/seller)
     */
    @Async
    public void sendNotificationEmail(String userId, String type, String title, String message, String details) {
        sendNotificationEmail(userId, type, title, message, details, null, null);
    }

    /**
     * Send notification email with bidding countdown information
     */
    @Async
    public void sendNotificationEmail(String userId, String type, String title, String message, String details, 
                                    String biddingEndTime, String gemName) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send {} notification to user {}", type, userId);
            return;
        }

        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    String subject = "🔔 " + title + " - GemNet";
                    String htmlContent = createNotificationEmailTemplate(getUserName(user), type, title, message, details, biddingEndTime, gemName);
                    sendHtmlEmail(user.getEmail(), subject, htmlContent);
                    logger.info("📧 Notification email sent to user {}: {} ({})", getUserName(user), type, user.getEmail());
                } else {
                    logger.warn("⚠️ User {} has no email address for notification: {}", userId, type);
                }
            } else {
                logger.warn("⚠️ User not found for email notification: {}", userId);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send notification email for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send admin notification email
     */
    @Async
    public void sendAdminNotificationEmail(String type, String title, String message, String details) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send {} admin notification", type);
            return;
        }

        try {
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            if (adminUsers.isEmpty()) {
                logger.warn("⚠️ No admin users found for email notification: {}", type);
                return;
            }

            for (User admin : adminUsers) {
                if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                    String subject = "🔔 Admin Alert: " + title + " - GemNet";
                    String htmlContent = createAdminNotificationEmailTemplate(getUserName(admin), type, title, message, details);
                    sendHtmlEmail(admin.getEmail(), subject, htmlContent);
                    logger.info("📧 Admin notification email sent to {}: {} ({})", getUserName(admin), type, admin.getEmail());
                } else {
                    logger.warn("⚠️ Admin user {} has no email address", admin.getId());
                }
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send admin notification emails: {}", e.getMessage());
        }
    }

    /**
     * Send meeting notification email
     */
    @Async
    public void sendMeetingNotificationEmail(String userId, String type, String title, String message, 
                                           String meetingLocation, String meetingTime, String details) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send {} meeting notification to user {}", type, userId);
            return;
        }

        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                    String subject = "🤝 " + title + " - GemNet";
                    String htmlContent = createMeetingNotificationEmailTemplate(getUserName(user), type, title, message, 
                                                                               meetingLocation, meetingTime, details);
                    sendHtmlEmail(user.getEmail(), subject, htmlContent);
                    logger.info("📧 Meeting notification email sent to user {}: {} ({})", getUserName(user), type, user.getEmail());
                } else {
                    logger.warn("⚠️ User {} has no email address for meeting notification: {}", userId, type);
                }
            } else {
                logger.warn("⚠️ User not found for meeting email notification: {}", userId);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send meeting notification email for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send welcome email to newly registered users
     */
    @Async
    public void sendWelcomeEmail(String userEmail, String userName, String userFirstName) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send welcome email to {}", userEmail);
            return;
        }

        try {
            String subject = "🎉 Welcome to GemNet - Your Gemstone Journey Begins!";
            String htmlContent = createWelcomeEmailTemplate(userName, userFirstName, userEmail);
            sendHtmlEmail(userEmail, subject, htmlContent);
            logger.info("📧 Welcome email sent to new user: {} ({})", userName, userEmail);
        } catch (Exception e) {
            logger.error("❌ Failed to send welcome email to {}: {}", userEmail, e.getMessage());
        }
    }

    /**
     * Send welcome email using User object
     */
    @Async
    public void sendWelcomeEmail(User user) {
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            sendWelcomeEmail(user.getEmail(), getUserName(user), user.getFirstName());
        } else {
            logger.warn("⚠️ Cannot send welcome email - user has no email address: {}", user.getId());
        }
    }

    /**
     * Send HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Encoding error while sending email to {}: {}", to, e.getMessage());
            throw new MessagingException("Failed to send email due to encoding error", e);
        }
    }

    /**
     * Create notification email template (buyer/seller notifications)
     */
    private String createNotificationEmailTemplate(String userName, String type, String title, String message, String details) {
        return createNotificationEmailTemplate(userName, type, title, message, details, null, null);
    }

    /**
     * Create enhanced notification email template with countdown and formatted details
     */
    private String createNotificationEmailTemplate(String userName, String type, String title, String message, String details, 
                                                  String biddingEndTime, String gemName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        String notificationIcon = getNotificationIcon(type);
        String notificationColor = getNotificationColor(type);
        String userRole = getUserRole(type);

        // Parse details into structured format
        String formattedDetails = formatDetailsAsPoints(details, type);
        
        // Create countdown section if bidding end time is available
        String countdownSection = "";
        if (biddingEndTime != null && !biddingEndTime.isEmpty()) {
            countdownSection = createCountdownSection(biddingEndTime, gemName);
        }

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>GemNet Notification</title>" +
               "<style>" +
               "  .countdown-timer { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }" +
               "  .countdown-digits { font-size: 24px; font-weight: bold; letter-spacing: 2px; }" +
               "  .countdown-labels { font-size: 12px; opacity: 0.9; margin-top: 5px; }" +
               "  .details-list { background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 5px; }" +
               "  .detail-item { margin: 8px 0; font-size: 14px; }" +
               "  .detail-label { color: #6c757d; font-weight: normal; }" +
               "  .detail-value { color: #333; font-weight: bold; }" +
               "</style>" +
               "</head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>🔔 GemNet Notification</h1>" +
               "<p>" + userRole + " Update</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello <strong>" + userName + "</strong>,</h2>" +
               "<p>You have a new notification from GemNet:</p>" +
               
               "<div style='background: " + notificationColor + "; border-left: 4px solid #007bff; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='margin-top: 0;'>" + notificationIcon + " " + title + "</h3>" +
               "<p><strong>Message:</strong> " + message + "</p>" +
               "</div>" +
               
               formattedDetails +
               countdownSection +
               
               "<div style='background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<p style='margin: 0; font-size: 14px;'><strong>Notification Time:</strong> " + timestamp + "</p>" +
               "</div>" +
               
               "<p>Visit your GemNet dashboard to view all your notifications and take action.</p>" +
               "</div>" +
               
               "<div style='background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px;'>" +
               "<p>This is an automated email from GemNet. Please do not reply to this email.</p>" +
               "<p>&copy; 2025 GemNet. All rights reserved.</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create admin notification email template
     */
    private String createAdminNotificationEmailTemplate(String adminName, String type, String title, String message, String details) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        String adminIcon = getAdminNotificationIcon(type);
        String adminPriority = getAdminPriority(type);

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>GemNet Admin Alert</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>⚠️ GemNet Admin Alert</h1>" +
               "<p>Administrative Action Required</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello " + adminName + ",</h2>" +
               "<p>You have a new administrative alert that requires your attention:</p>" +
               
               "<div style='background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3>" + adminIcon + " " + title + "</h3>" +
               "<p><strong>Message:</strong> " + message + "</p>" +
               (details != null && !details.isEmpty() ? "<p><strong>Details:</strong> " + details + "</p>" : "") +
               "<p><strong>Priority:</strong> " + adminPriority + "</p>" +
               "<p><strong>Time:</strong> " + timestamp + "</p>" +
               "</div>" +
               
               "<p>Please log in to the admin dashboard to review and take appropriate action.</p>" +
               "</div>" +
               
               "<div style='background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px;'>" +
               "<p>This is an automated admin alert from GemNet. Please do not reply to this email.</p>" +
               "<p>&copy; 2025 GemNet. All rights reserved.</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create meeting notification email template
     */
    private String createMeetingNotificationEmailTemplate(String userName, String type, String title, String message, 
                                                         String meetingLocation, String meetingTime, String details) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        String meetingStatus = getMeetingStatus(type);

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>GemNet Meeting Notification</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>🤝 GemNet Meeting Update</h1>" +
               "<p>Meeting Status: " + meetingStatus + "</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello " + userName + ",</h2>" +
               "<p>You have a meeting notification from GemNet:</p>" +
               
               "<div style='background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3>🤝 " + title + "</h3>" +
               "<p><strong>Message:</strong> " + message + "</p>" +
               (meetingLocation != null && !meetingLocation.isEmpty() ? "<p><strong>📍 Location:</strong> " + meetingLocation + "</p>" : "") +
               (meetingTime != null && !meetingTime.isEmpty() ? "<p><strong>🕐 Time:</strong> " + meetingTime + "</p>" : "") +
               (details != null && !details.isEmpty() ? "<p><strong>Details:</strong> " + details + "</p>" : "") +
               "<p><strong>Status:</strong> " + meetingStatus + "</p>" +
               "<p><strong>Notification Time:</strong> " + timestamp + "</p>" +
               "</div>" +
               
               "<p>Please check your meeting schedule in the GemNet dashboard for more details.</p>" +
               "</div>" +
               
               "<div style='background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px;'>" +
               "<p>This is an automated meeting notification from GemNet. Please do not reply to this email.</p>" +
               "<p>&copy; 2025 GemNet. All rights reserved.</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create welcome email template for new users
     */
    private String createWelcomeEmailTemplate(String userName, String userFirstName, String userEmail) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        String displayName = userFirstName != null && !userFirstName.trim().isEmpty() ? userFirstName : userName;

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Welcome to GemNet</title>" +
               "<style>" +
               "  .welcome-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }" +
               "  .welcome-content { padding: 40px 30px; }" +
               "  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }" +
               "  .feature-card { background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center; }" +
               "  .feature-icon { font-size: 48px; margin-bottom: 15px; }" +
               "  .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: bold; margin: 20px 0; }" +
               "  .welcome-stats { background: #e9ecef; border-radius: 10px; padding: 20px; margin: 20px 0; }" +
               "  .stat-item { display: inline-block; margin: 0 15px; text-align: center; }" +
               "</style>" +
               "</head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 15px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div class='welcome-hero'>" +
               "<h1 style='margin: 0; font-size: 36px;'>🎉 Welcome to GemNet!</h1>" +
               "<p style='font-size: 18px; margin: 15px 0 0 0; opacity: 0.9;'>Your Gateway to Precious Gemstones</p>" +
               "</div>" +
               
               "<div class='welcome-content'>" +
               "<h2 style='color: #333; margin-top: 0;'>Hello <strong style='color: #667eea;'>" + displayName + "</strong>!</h2>" +
               "<p style='font-size: 16px; line-height: 1.6; color: #555;'>Congratulations on joining GemNet, Sri Lanka's premier gemstone marketplace! We're thrilled to have you as part of our community of gemstone enthusiasts, collectors, and traders.</p>" +
               
               "<div class='welcome-stats'>" +
               "<h3 style='text-align: center; color: #333; margin-top: 0;'>🌟 Join Our Growing Community</h3>" +
               "<div style='text-align: center;'>" +
               "<div class='stat-item'>" +
               "<div style='font-size: 24px; font-weight: bold; color: #667eea;'>1000+</div>" +
               "<div style='font-size: 14px; color: #6c757d;'>Premium Gemstones</div>" +
               "</div>" +
               "<div class='stat-item'>" +
               "<div style='font-size: 24px; font-weight: bold; color: #28a745;'>500+</div>" +
               "<div style='font-size: 14px; color: #6c757d;'>Verified Sellers</div>" +
               "</div>" +
               "<div class='stat-item'>" +
               "<div style='font-size: 24px; font-weight: bold; color: #dc3545;'>2000+</div>" +
               "<div style='font-size: 14px; color: #6c757d;'>Happy Buyers</div>" +
               "</div>" +
               "</div>" +
               "</div>" +
               
               "<h3 style='color: #333; margin: 30px 0 20px 0;'>🚀 What You Can Do on GemNet:</h3>" +
               
               "<div class='feature-grid'>" +
               "<div class='feature-card'>" +
               "<div class='feature-icon'>💎</div>" +
               "<h4 style='margin: 0 0 10px 0; color: #333;'>Buy Premium Gemstones</h4>" +
               "<p style='margin: 0; font-size: 14px; color: #6c757d;'>Discover authenticated gemstones with certificates from trusted sellers.</p>" +
               "</div>" +
               
               "<div class='feature-card'>" +
               "<div class='feature-icon'>🏆</div>" +
               "<h4 style='margin: 0 0 10px 0; color: #333;'>Participate in Auctions</h4>" +
               "<p style='margin: 0; font-size: 14px; color: #6c757d;'>Join live bidding sessions and compete for rare gemstones.</p>" +
               "</div>" +
               
               "<div class='feature-card'>" +
               "<div class='feature-icon'>🤝</div>" +
               "<h4 style='margin: 0 0 10px 0; color: #333;'>Secure Meetings</h4>" +
               "<p style='margin: 0; font-size: 14px; color: #6c757d;'>Arrange safe, verified meetings with sellers for inspections.</p>" +
               "</div>" +
               
               "<div class='feature-card'>" +
               "<div class='feature-icon'>🔐</div>" +
               "<h4 style='margin: 0 0 10px 0; color: #333;'>Verified Identity</h4>" +
               "<p style='margin: 0; font-size: 14px; color: #6c757d;'>Advanced face recognition ensures all users are verified and trustworthy.</p>" +
               "</div>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 40px 0;'>" +
               "<a href='#' class='cta-button' style='color: white; text-decoration: none;'>🌟 Explore Gemstones Now</a>" +
               "</div>" +
               
               "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;'>" +
               "<h4 style='margin: 0 0 10px 0; color: #856404;'>📋 Next Steps:</h4>" +
               "<ul style='margin: 10px 0; padding-left: 20px; color: #856404;'>" +
               "<li><strong>Complete Your Profile:</strong> Add your details and preferences</li>" +
               "<li><strong>Verify Your Identity:</strong> Complete face recognition verification for full access</li>" +
               "<li><strong>Browse Gemstones:</strong> Explore our extensive collection</li>" +
               "<li><strong>Start Bidding:</strong> Participate in live auctions</li>" +
               "</ul>" +
               "</div>" +
               
               "<div style='background: #d1ecf1; border-radius: 8px; padding: 20px; margin: 30px 0;'>" +
               "<h4 style='margin: 0 0 15px 0; color: #0c5460;'>📞 Need Help? We're Here for You!</h4>" +
               "<p style='margin: 0; color: #0c5460; font-size: 14px;'>" +
               "<strong>Email:</strong> support@gemnet.com<br>" +
               "<strong>Phone:</strong> +94 11 234 5678<br>" +
               "<strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (IST)" +
               "</p>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<h4 style='color: #333;'>🎯 Account Details</h4>" +
               "<div style='background: #f8f9fa; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 14px;'>" +
               "<p style='margin: 5px 0;'><strong>Email:</strong> " + userEmail + "</p>" +
               "<p style='margin: 5px 0;'><strong>Registration Date:</strong> " + timestamp + "</p>" +
               "<p style='margin: 5px 0;'><strong>Account Status:</strong> <span style='color: #28a745;'>Active</span></p>" +
               "</div>" +
               "</div>" +
               
               "<p style='text-align: center; font-size: 16px; color: #333;'>Welcome to the GemNet family! 💎✨</p>" +
               "</div>" +
               
               "<div style='background: #343a40; color: white; padding: 30px; text-align: center;'>" +
               "<h3 style='margin: 0 0 15px 0;'>Stay Connected</h3>" +
               "<p style='margin: 0 0 15px 0; opacity: 0.8;'>Follow us for the latest gemstone discoveries and exclusive offers</p>" +
               "<div style='margin: 15px 0;'>" +
               "<span style='margin: 0 10px; font-size: 24px;'>📧</span>" +
               "<span style='margin: 0 10px; font-size: 24px;'>📱</span>" +
               "<span style='margin: 0 10px; font-size: 24px;'>🌐</span>" +
               "</div>" +
               "<p style='margin: 20px 0 0 0; font-size: 14px; opacity: 0.7;'>" +
               "This is an automated welcome email from GemNet. Please do not reply to this email.<br>" +
               "&copy; 2025 GemNet - Sri Lankan Gemstone Marketplace. All rights reserved." +
               "</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    // Helper methods
    private String getUserName(User user) {
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        } else if (user.getFirstName() != null) {
            return user.getFirstName();
        } else if (user.getUsername() != null) {
            return user.getUsername();
        } else {
            return "User";
        }
    }

    /**
     * Format details string into point-wise HTML list with bold dynamic information
     */
    private String formatDetailsAsPoints(String details, String type) {
        if (details == null || details.isEmpty()) {
            return "";
        }

        StringBuilder formattedDetails = new StringBuilder();
        formattedDetails.append("<div class='details-list'>");
        formattedDetails.append("<h4 style='margin-top: 0; color: #007bff;'>📋 Transaction Details</h4>");

        // Parse different detail formats
        if (details.contains(" | ")) {
            // Format: "Gem: test 3 | Amount: 247.86 | From: pasindu Perera"
            String[] parts = details.split(" \\| ");
            for (String part : parts) {
                if (part.contains(":")) {
                    String[] keyValue = part.split(":", 2);
                    if (keyValue.length == 2) {
                        String key = keyValue[0].trim();
                        String value = keyValue[1].trim();
                        
                        // Add appropriate icons and format values
                        String icon = getDetailIcon(key);
                        String formattedValue = formatDetailValue(value, key);
                        
                        formattedDetails.append("<div class='detail-item'>");
                        formattedDetails.append("<span class='detail-label'>").append(icon).append(" ").append(key).append(":</span> ");
                        formattedDetails.append("<span class='detail-value'>").append(formattedValue).append("</span>");
                        formattedDetails.append("</div>");
                    }
                }
            }
        } else if (details.contains(":")) {
            // Single key-value pair
            String[] keyValue = details.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim();
                String value = keyValue[1].trim();
                String icon = getDetailIcon(key);
                String formattedValue = formatDetailValue(value, key);
                
                formattedDetails.append("<div class='detail-item'>");
                formattedDetails.append("<span class='detail-label'>").append(icon).append(" ").append(key).append(":</span> ");
                formattedDetails.append("<span class='detail-value'>").append(formattedValue).append("</span>");
                formattedDetails.append("</div>");
            }
        } else {
            // Plain text details
            formattedDetails.append("<div class='detail-item'>");
            formattedDetails.append("<span class='detail-value'>").append(details).append("</span>");
            formattedDetails.append("</div>");
        }

        formattedDetails.append("</div>");
        return formattedDetails.toString();
    }

    /**
     * Get appropriate icon for detail keys
     */
    private String getDetailIcon(String key) {
        switch (key.toLowerCase()) {
            case "gem":
            case "gemstone": return "💎";
            case "amount":
            case "price":
            case "bid": return "💰";
            case "from":
            case "user":
            case "buyer":
            case "seller": return "👤";
            case "time":
            case "date": return "🕐";
            case "location": return "📍";
            case "status": return "📊";
            default: return "•";
        }
    }

    /**
     * Format detail values with appropriate styling
     */
    private String formatDetailValue(String value, String key) {
        if (key.toLowerCase().contains("amount") || key.toLowerCase().contains("price") || key.toLowerCase().contains("bid")) {
            // Format currency values
            try {
                double amount = Double.parseDouble(value.replaceAll("[^0-9.]", ""));
                return String.format("$%.2f", amount);
            } catch (NumberFormatException e) {
                return value;
            }
        }
        return value;
    }

    /**
     * Create countdown timer section for bidding end time
     */
    private String createCountdownSection(String biddingEndTime, String gemName) {
        if (biddingEndTime == null || biddingEndTime.isEmpty()) {
            return "";
        }

        try {
            // Parse the bidding end time (assuming it's in a parseable format)
            LocalDateTime endTime;
            if (biddingEndTime.contains("T")) {
                endTime = LocalDateTime.parse(biddingEndTime.substring(0, 19));
            } else {
                // Handle different date formats if needed
                endTime = LocalDateTime.parse(biddingEndTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }
            
            LocalDateTime now = LocalDateTime.now();
            
            if (endTime.isAfter(now)) {
                // Calculate time remaining
                long totalSeconds = java.time.Duration.between(now, endTime).getSeconds();
                long days = totalSeconds / (24 * 3600);
                long hours = (totalSeconds % (24 * 3600)) / 3600;
                long minutes = (totalSeconds % 3600) / 60;
                long seconds = totalSeconds % 60;

                return "<div class='countdown-timer'>" +
                       "<h3 style='margin-top: 0;'>⏰ Bidding Countdown" + (gemName != null ? " - " + gemName : "") + "</h3>" +
                       "<div class='countdown-digits'>" +
                       "<span>" + String.format("%02d", days) + "d</span> : " +
                       "<span>" + String.format("%02d", hours) + "h</span> : " +
                       "<span>" + String.format("%02d", minutes) + "m</span> : " +
                       "<span>" + String.format("%02d", seconds) + "s</span>" +
                       "</div>" +
                       "<div class='countdown-labels'>DAYS : HOURS : MINUTES : SECONDS</div>" +
                       "<p style='margin-bottom: 0; font-size: 14px; opacity: 0.9;'>⚡ Bidding ends on " + 
                       endTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")) + "</p>" +
                       "</div>";
            } else {
                // Bidding has ended
                return "<div style='background: #dc3545; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;'>" +
                       "<h3 style='margin-top: 0;'>⏱️ Bidding Ended" + (gemName != null ? " - " + gemName : "") + "</h3>" +
                       "<p style='margin-bottom: 0; font-size: 16px; font-weight: bold;'>🔚 Bidding closed on " + 
                       endTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")) + "</p>" +
                       "</div>";
            }
        } catch (Exception e) {
            // Fallback if date parsing fails
            return "<div style='background: #ffc107; color: #333; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>" +
                   "<p style='margin: 0;'>⏰ Bidding deadline: " + biddingEndTime + "</p>" +
                   "</div>";
        }
    }
    
    private String getUserRole(String type) {
        if (type.startsWith("NEW_BID") || type.equals("ITEM_SOLD")) return "Seller";
        if (type.startsWith("BID_") || type.contains("WON") || type.contains("OUTBID")) return "Buyer";
        if (type.startsWith("MEETING_")) return "Meeting";
        return "System";
    }
    
    private String getNotificationIcon(String type) {
        switch (type) {
            case "NEW_BID": return "💎";
            case "BID_PLACED": return "✅";
            case "BID_OUTBID": return "🔄";
            case "BID_WON": return "🎉";
            case "ITEM_SOLD": return "💰";
            case "MEETING_REQUEST_RECEIVED":
            case "MEETING_REQUEST_SENT": return "📋";
            case "MEETING_CONFIRMED": return "✅";
            case "MEETING_COMPLETED": return "🎯";
            default: return "🔔";
        }
    }
    
    private String getNotificationColor(String type) {
        switch (type) {
            case "NEW_BID":
            case "BID_PLACED": return "#d1ecf1";
            case "BID_OUTBID": return "#f8d7da";
            case "BID_WON":
            case "ITEM_SOLD": return "#d4edda";
            case "MEETING_CONFIRMED":
            case "MEETING_COMPLETED": return "#d1ecf1";
            default: return "#e2e3e5";
        }
    }
    
    private String getAdminNotificationIcon(String type) {
        switch (type) {
            case "USER_REGISTRATION": return "👤";
            case "LISTING_PENDING": return "💎";
            case "ADVERTISEMENT_PENDING": return "📺";
            case "MEETING_REQUEST": return "🤝";
            default: return "⚠️";
        }
    }
    
    private String getAdminPriority(String type) {
        switch (type) {
            case "USER_REGISTRATION": return "Medium";
            case "LISTING_PENDING": 
            case "ADVERTISEMENT_PENDING": return "High";
            case "MEETING_REQUEST": return "Medium";
            default: return "Normal";
        }
    }
    
    private String getMeetingStatus(String type) {
        switch (type) {
            case "MEETING_REQUEST_SENT":
            case "MEETING_REQUEST_RECEIVED": return "PENDING";
            case "MEETING_CONFIRMED": return "CONFIRMED";
            case "MEETING_COMPLETED": return "COMPLETED";
            case "MEETING_CANCELLED": return "CANCELLED";
            case "MEETING_RESCHEDULED": return "RESCHEDULED";
            default: return "ACTIVE";
        }
    }

    /**
     * Send warning email to user with no-show count
     */
    @Async
    public void sendWarningEmail(String userId, String userEmail, String userName, int noShowCount) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send warning email to user {}", userId);
            return;
        }

        try {
            String subject = "⚠️ Account Warning - No-Show Alert - GemNet";
            String htmlContent = createWarningEmailTemplate(userName, noShowCount);
            sendHtmlEmail(userEmail, subject, htmlContent);
            logger.info("📧 Warning email sent to user {}: {} ({})", userName, userId, userEmail);
        } catch (Exception e) {
            logger.error("❌ Failed to send warning email to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send blocking email to user
     */
    @Async
    public void sendBlockingEmail(String userId, String userEmail, String userName, String reason) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send blocking email to user {}", userId);
            return;
        }

        try {
            String subject = "🚫 Account Blocked - GemNet";
            String htmlContent = createBlockingEmailTemplate(userName, reason);
            sendHtmlEmail(userEmail, subject, htmlContent);
            logger.info("📧 Blocking email sent to user {}: {} ({})", userName, userId, userEmail);
        } catch (Exception e) {
            logger.error("❌ Failed to send blocking email to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send meeting reminder email
     */
    @Async
    public void sendMeetingReminderEmail(String userId, String userEmail, String userName, 
                                       String meetingDisplayId, String gemName, String dateTime, 
                                       String location, String otherPartyName, String hoursUntil) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send meeting reminder to user {}", userId);
            return;
        }

        try {
            String subject = "⏰ Meeting Reminder - " + hoursUntil + " Hours Until Meeting - GemNet";
            String htmlContent = createMeetingReminderEmailTemplate(userName, meetingDisplayId, gemName, 
                                                                   dateTime, location, otherPartyName, hoursUntil);
            sendHtmlEmail(userEmail, subject, htmlContent);
            logger.info("📧 Meeting reminder ({} hours) sent to user {}: {} ({})", hoursUntil, userName, userId, userEmail);
        } catch (Exception e) {
            logger.error("❌ Failed to send meeting reminder to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send admin meeting reminder email
     */
    @Async
    public void sendAdminMeetingReminderEmail(String meetingDisplayId, String gemName, String dateTime, 
                                            String location, String buyerName, String sellerName) {
        if (!emailEnabled) {
            logger.info("📧 Email service disabled - would send admin meeting reminder for {}", meetingDisplayId);
            return;
        }

        try {
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            if (adminUsers.isEmpty()) {
                logger.warn("⚠️ No admin users found for meeting reminder: {}", meetingDisplayId);
                return;
            }

            String subject = "🤝 Meeting Verification Required - " + meetingDisplayId + " - GemNet";
            
            for (User admin : adminUsers) {
                if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                    String htmlContent = createAdminMeetingReminderTemplate(getUserName(admin), meetingDisplayId, 
                                                                           gemName, dateTime, location, buyerName, sellerName);
                    sendHtmlEmail(admin.getEmail(), subject, htmlContent);
                    logger.info("📧 Admin meeting reminder sent to {}: {} ({})", getUserName(admin), admin.getId(), admin.getEmail());
                }
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send admin meeting reminder for {}: {}", meetingDisplayId, e.getMessage());
        }
    }

    /**
     * Create warning email template
     */
    private String createWarningEmailTemplate(String userName, int noShowCount) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        String warningLevel = noShowCount == 1 ? "First Warning" : "Final Warning";
        String warningColor = noShowCount == 1 ? "#ffc107" : "#dc3545";

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Account Warning - GemNet</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, " + warningColor + " 0%, #ffc107 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>⚠️ Account Warning</h1>" +
               "<p>" + warningLevel + " - Attendance Issue</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello <strong>" + userName + "</strong>,</h2>" +
               "<p>We're writing to inform you about an attendance issue with your GemNet account.</p>" +
               
               "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h3 style='margin-top: 0; color: #856404;'>📊 Account Status Update</h3>" +
               "<p style='color: #856404;'><strong>No-Show Count:</strong> " + noShowCount + " out of 2 allowed</p>" +
               "<p style='color: #856404;'><strong>Warning Level:</strong> " + warningLevel + "</p>" +
               "<p style='color: #856404;'><strong>Date:</strong> " + timestamp + "</p>" +
               "</div>" +
               
               "<div style='background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #721c24;'>🚨 Important Notice</h4>" +
               "<p style='color: #721c24;'>You have missed a confirmed meeting without providing adequate notice. " +
               (noShowCount == 1 ? 
                   "This is your first warning. One more no-show will result in account blocking." :
                   "This is your final warning. Any additional no-shows will result in permanent account suspension.") +
               "</p>" +
               "</div>" +
               
               "<h3>🎯 What You Need to Do:</h3>" +
               "<ul style='color: #333; line-height: 1.6;'>" +
               "<li><strong>Be Punctual:</strong> Always attend confirmed meetings on time</li>" +
               "<li><strong>Communicate:</strong> Contact the other party if you need to reschedule</li>" +
               "<li><strong>Submit Reasons:</strong> If you miss a meeting due to an emergency, submit a valid reason through the platform</li>" +
               "<li><strong>Check Schedule:</strong> Regularly review your meeting schedule and set reminders</li>" +
               "</ul>" +
               
               "<div style='background: #d1ecf1; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #0c5460;'>📝 How to Avoid Future No-Shows</h4>" +
               "<ul style='color: #0c5460; margin: 10px 0;'>" +
               "<li>Set calendar reminders for all confirmed meetings</li>" +
               "<li>Enable email and SMS notifications in your account settings</li>" +
               "<li>Plan your schedule carefully before confirming meetings</li>" +
               "<li>Communicate early if you anticipate any conflicts</li>" +
               "</ul>" +
               "</div>" +
               
               "<div style='background: #fff2cc; border: 2px solid #d6b656; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>" +
               "<h4 style='margin-top: 0; color: #996515;'>⚡ Next No-Show Consequence</h4>" +
               "<p style='color: #996515; font-size: 16px; font-weight: bold; margin-bottom: 0;'>" + 
               "Account " + (noShowCount == 1 ? "Blocking" : "Permanent Suspension") + "</p>" +
               "</div>" +
               
               "<p>We value your participation in the GemNet community and want to ensure a reliable experience for all users. " +
               "Please take this warning seriously and make every effort to attend your confirmed meetings.</p>" +
               
               "<p>If you have any questions or concerns, please contact our support team immediately.</p>" +
               "</div>" +
               
               "<div style='background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px;'>" +
               "<p><strong>Support Contact:</strong></p>" +
               "<p>Email: support@gemnet.com | Phone: +94 11 234 5678</p>" +
               "<p>This is an automated warning from GemNet. Please do not reply to this email.</p>" +
               "<p>&copy; 2025 GemNet. All rights reserved.</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create blocking email template
     */
    private String createBlockingEmailTemplate(String userName, String reason) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Account Blocked - GemNet</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>🚫 Account Blocked</h1>" +
               "<p>Access Suspended Due to Policy Violation</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Dear <strong>" + userName + "</strong>,</h2>" +
               "<p>We regret to inform you that your GemNet account has been blocked due to repeated attendance issues.</p>" +
               
               "<div style='background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h3 style='margin-top: 0; color: #721c24;'>🚨 Account Status</h3>" +
               "<p style='color: #721c24;'><strong>Status:</strong> BLOCKED</p>" +
               "<p style='color: #721c24;'><strong>Reason:</strong> " + reason + "</p>" +
               "<p style='color: #721c24;'><strong>Blocked Date:</strong> " + timestamp + "</p>" +
               "</div>" +
               
               "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #856404;'>🔒 What This Means</h4>" +
               "<ul style='color: #856404; margin: 10px 0;'>" +
               "<li>You cannot log in to your GemNet account</li>" +
               "<li>All active bids and listings have been suspended</li>" +
               "<li>You cannot participate in new auctions or meetings</li>" +
               "<li>Your profile is no longer visible to other users</li>" +
               "</ul>" +
               "</div>" +
               
               "<h3>📞 Account Appeal Process</h3>" +
               "<p>If you believe this blocking was made in error, or if you have valid reasons for your absences, you may appeal this decision:</p>" +
               
               "<div style='background: #d1ecf1; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #0c5460;'>🔄 How to Appeal</h4>" +
               "<ol style='color: #0c5460; margin: 10px 0;'>" +
               "<li><strong>Contact Support:</strong> Email support@gemnet.com with your appeal</li>" +
               "<li><strong>Provide Documentation:</strong> Include any supporting evidence for your absences</li>" +
               "<li><strong>Explain Circumstances:</strong> Detail any extenuating circumstances</li>" +
               "<li><strong>Wait for Review:</strong> Appeals are typically reviewed within 5-7 business days</li>" +
               "</ol>" +
               "</div>" +
               
               "<div style='background: #ffe6e6; border: 2px solid #ff9999; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>" +
               "<h4 style='margin-top: 0; color: #cc0000;'>⚠️ Important Note</h4>" +
               "<p style='color: #cc0000; margin-bottom: 0;'>Creating new accounts to bypass this block is strictly prohibited and will result in permanent IP blocking.</p>" +
               "</div>" +
               
               "<h3>📋 For Future Reference</h3>" +
               "<p>If your account is reinstated, please note that our attendance policy requires:</p>" +
               "<ul style='color: #333; line-height: 1.6;'>" +
               "<li>Attendance at all confirmed meetings</li>" +
               "<li>24-hour advance notice for cancellations</li>" +
               "<li>Valid documentation for emergency absences</li>" +
               "<li>Respect for other users' time and commitments</li>" +
               "</ul>" +
               
               "<p>We appreciate your understanding and hope to resolve this matter promptly.</p>" +
               "</div>" +
               
               "<div style='background: #343a40; color: white; padding: 20px; text-align: center;'>" +
               "<h4 style='margin-top: 0;'>📞 Support Information</h4>" +
               "<p style='margin: 10px 0;'><strong>Email:</strong> support@gemnet.com</p>" +
               "<p style='margin: 10px 0;'><strong>Phone:</strong> +94 11 234 5678</p>" +
               "<p style='margin: 10px 0;'><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (IST)</p>" +
               "<p style='margin: 20px 0 0 0; font-size: 14px; opacity: 0.7;'>" +
               "This is an automated notification from GemNet. Please do not reply to this email.<br>" +
               "&copy; 2025 GemNet. All rights reserved." +
               "</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create meeting reminder email template
     */
    private String createMeetingReminderEmailTemplate(String userName, String meetingDisplayId, String gemName, 
                                                    String dateTime, String location, String otherPartyName, String hoursUntil) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        String urgencyColor = hoursUntil.equals("6") ? "#dc3545" : "#ffc107";
        String urgencyText = hoursUntil.equals("6") ? "URGENT" : "REMINDER";

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Meeting Reminder - GemNet</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, " + urgencyColor + " 0%, #ffc107 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>⏰ Meeting Reminder</h1>" +
               "<p>" + urgencyText + " - " + hoursUntil + " Hours Until Meeting</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello <strong>" + userName + "</strong>,</h2>" +
               "<p>This is a " + (hoursUntil.equals("6") ? "final" : "friendly") + " reminder about your upcoming meeting on GemNet.</p>" +
               
               "<div style='background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='margin-top: 0; color: #1976d2;'>🤝 Meeting Details</h3>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>📋 Meeting ID:</strong> " + meetingDisplayId + "</p>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>💎 Gemstone:</strong> " + gemName + "</p>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>🕐 Date & Time:</strong> " + dateTime + "</p>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>📍 Location:</strong> " + location + "</p>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>👤 Meeting With:</strong> " + otherPartyName + "</p>" +
               "</div>" +
               
               "<div style='background: " + (hoursUntil.equals("6") ? "#f8d7da" : "#fff3cd") + "; border: 1px solid " + 
               (hoursUntil.equals("6") ? "#f5c6cb" : "#ffeaa7") + "; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>" +
               "<h3 style='margin-top: 0; color: " + (hoursUntil.equals("6") ? "#721c24" : "#856404") + ";'>⏰ Time Remaining</h3>" +
               "<p style='font-size: 24px; font-weight: bold; color: " + urgencyColor + "; margin: 10px 0;'>" + hoursUntil + " HOURS</p>" +
               "<p style='color: " + (hoursUntil.equals("6") ? "#721c24" : "#856404") + "; margin-bottom: 0;'>" +
               (hoursUntil.equals("6") ? "⚠️ FINAL REMINDER - Please confirm your attendance!" : "📅 Don't forget to prepare for your meeting!") +
               "</p>" +
               "</div>" +
               
               "<h3>✅ Pre-Meeting Checklist</h3>" +
               "<ul style='color: #333; line-height: 1.8;'>" +
               "<li><strong>📍 Confirm Location:</strong> Double-check the meeting address and plan your route</li>" +
               "<li><strong>🚗 Plan Transportation:</strong> Account for traffic and arrive 10 minutes early</li>" +
               "<li><strong>📋 Prepare Questions:</strong> List any questions about the gemstone</li>" +
               "<li><strong>💰 Bring Payment:</strong> If purchasing, ensure you have the agreed payment method</li>" +
               "<li><strong>📱 Contact Information:</strong> Save the other party's contact details</li>" +
               "</ul>" +
               
               "<div style='background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #155724;'>📞 Need to Reschedule?</h4>" +
               "<p style='color: #155724; margin: 10px 0;'>If you need to reschedule or cancel this meeting:</p>" +
               "<ul style='color: #155724; margin: 10px 0;'>" +
               "<li>Contact the other party immediately through GemNet messaging</li>" +
               "<li>Provide at least 24 hours notice when possible</li>" +
               "<li>Suggest alternative meeting times</li>" +
               "<li>Be respectful of the other person's time</li>" +
               "</ul>" +
               "</div>" +
               
               (hoursUntil.equals("6") ? 
                   "<div style='background: #fff2cc; border: 2px solid #d6b656; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;'>" +
                   "<h4 style='margin-top: 0; color: #996515;'>⚠️ Attendance Policy Reminder</h4>" +
                   "<p style='color: #996515; margin-bottom: 0;'>Failure to attend confirmed meetings may result in account warnings or restrictions. " +
                   "If you cannot attend, please contact the other party and submit a valid reason through the platform.</p>" +
                   "</div>" : ""
               ) +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<p style='font-size: 16px; color: #333;'>We wish you a successful meeting! 🤝</p>" +
               "<p style='font-size: 14px; color: #6c757d;'>Reminder sent at: " + timestamp + "</p>" +
               "</div>" +
               "</div>" +
               
               "<div style='background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px;'>" +
               "<p>This is an automated meeting reminder from GemNet. Please do not reply to this email.</p>" +
               "<p>&copy; 2025 GemNet. All rights reserved.</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Create admin meeting reminder template
     */
    private String createAdminMeetingReminderTemplate(String adminName, String meetingDisplayId, String gemName, 
                                                    String dateTime, String location, String buyerName, String sellerName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));

        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Admin Meeting Verification - GemNet</title></head>" +
               "<body style='font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>" +
               
               "<div style='background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%); color: white; padding: 30px; text-align: center;'>" +
               "<h1>🛡️ Admin Meeting Verification</h1>" +
               "<p>Meeting Requires Administrative Oversight</p>" +
               "</div>" +
               
               "<div style='padding: 30px;'>" +
               "<h2>Hello " + adminName + ",</h2>" +
               "<p>A meeting is scheduled that requires administrative verification for attendance tracking:</p>" +
               
               "<div style='background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
               "<h3 style='margin-top: 0; color: #7b1fa2;'>🤝 Meeting Information</h3>" +
               "<p style='color: #7b1fa2; margin: 5px 0;'><strong>📋 Meeting ID:</strong> " + meetingDisplayId + "</p>" +
               "<p style='color: #7b1fa2; margin: 5px 0;'><strong>💎 Gemstone:</strong> " + gemName + "</p>" +
               "<p style='color: #7b1fa2; margin: 5px 0;'><strong>🕐 Scheduled Time:</strong> " + dateTime + "</p>" +
               "<p style='color: #7b1fa2; margin: 5px 0;'><strong>📍 Location:</strong> " + location + "</p>" +
               "</div>" +
               
               "<div style='background: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #1976d2;'>👥 Meeting Participants</h4>" +
               "<div style='display: flex; justify-content: space-between;'>" +
               "<div style='flex: 1; margin-right: 10px;'>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>🛒 Buyer:</strong></p>" +
               "<p style='color: #333; margin: 5px 0; background: white; padding: 10px; border-radius: 5px;'>" + buyerName + "</p>" +
               "</div>" +
               "<div style='flex: 1; margin-left: 10px;'>" +
               "<p style='color: #1976d2; margin: 5px 0;'><strong>🏪 Seller:</strong></p>" +
               "<p style='color: #333; margin: 5px 0; background: white; padding: 10px; border-radius: 5px;'>" + sellerName + "</p>" +
               "</div>" +
               "</div>" +
               "</div>" +
               
               "<h3>📋 Required Actions</h3>" +
               "<ul style='color: #333; line-height: 1.8;'>" +
               "<li><strong>📝 Verify Attendance:</strong> Confirm whether both parties attended the meeting</li>" +
               "<li><strong>🔍 Review Circumstances:</strong> Investigate any no-shows or disputes</li>" +
               "<li><strong>📄 Document Results:</strong> Record attendance and any relevant notes</li>" +
               "<li><strong>⚖️ Apply Policies:</strong> Process any no-show penalties if applicable</li>" +
               "</ul>" +
               
               "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>" +
               "<h4 style='margin-top: 0; color: #856404;'>⏰ Post-Meeting Timeline</h4>" +
               "<ul style='color: #856404; margin: 10px 0;'>" +
               "<li><strong>Within 24 hours:</strong> Verify attendance status</li>" +
               "<li><strong>Within 48 hours:</strong> Process any absence reasons submitted</li>" +
               "<li><strong>Within 72 hours:</strong> Apply no-show penalties if applicable</li>" +
               "</ul>" +
               "</div>" +
               
               "<div style='text-align: center; margin: 30px 0;'>" +
               "<div style='background: linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;'>" +
               "<strong>🛡️ Access Admin Dashboard</strong>" +
               "</div>" +
               "</div>" +
               
               "<p style='font-size: 14px; color: #6c757d; text-align: center;'>Reminder sent at: " + timestamp + "</p>" +
               "</div>" +
               
               "<div style='background: #343a40; color: white; padding: 20px; text-align: center;'>" +
               "<h4 style='margin-top: 0;'>🎯 Admin Responsibilities</h4>" +
               "<p style='margin: 10px 0; font-size: 14px;'>Maintain fair and consistent enforcement of attendance policies</p>" +
               "<p style='margin: 10px 0; font-size: 14px;'>Provide timely verification to maintain user trust</p>" +
               "<p style='margin: 20px 0 0 0; font-size: 12px; opacity: 0.7;'>" +
               "This is an automated admin alert from GemNet. Please do not reply to this email.<br>" +
               "&copy; 2025 GemNet. All rights reserved." +
               "</p>" +
               "</div>" +
               "</div>" +
               "</body></html>";
    }

    /**
     * Test email functionality
     */
    public void sendTestEmail(String toEmail) throws MessagingException {
        String subject = "🔔 GemNet Email System Test";
        String htmlContent = createTestEmailTemplate();
        sendHtmlEmail(toEmail, subject, htmlContent);
        logger.info("✅ Test email sent to: {}", toEmail);
    }
    
    private String createTestEmailTemplate() {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
               "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
               "<div style='background: #007bff; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;'>" +
               "<h1>🔔 GemNet Email System</h1><p>Email Configuration Test</p></div>" +
               "<div style='background: white; padding: 30px; border: 1px solid #ddd;'>" +
               "<h2>✅ Email System Working!</h2>" +
               "<p>This is a test email to verify that the GemNet email notification system is working properly.</p>" +
               "<p><strong>Timestamp:</strong> " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")) + "</p>" +
               "</div></body></html>";
    }
}
