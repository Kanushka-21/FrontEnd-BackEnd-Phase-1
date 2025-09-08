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
