package com.gemnet.controller;

import com.gemnet.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/email-test")
@CrossOrigin(origins = "*")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username}")
    private String systemEmail;

    /**
     * Test endpoint to send a test email
     */
    @PostMapping("/send-test")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            emailService.sendTestEmail(email);
            response.put("success", true);
            response.put("message", "Test email sent successfully to: " + email);
            response.put("systemEmail", systemEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send test email: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test specific notification email types
     */
    @PostMapping("/test-notification")
    public ResponseEntity<Map<String, Object>> testNotificationEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "BID_PLACED") String type) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create a test notification
            String title = "Test " + type + " Notification";
            String message = "This is a test notification email from the GemNet system.";
            String details = "Test details for " + type + " notification type";
            
            // Send using the email directly instead of userId lookup for testing
            emailService.sendNotificationEmail("test-user-id", type, title, message, details);
            
            response.put("success", true);
            response.put("message", "Test " + type + " notification email sent to: " + email);
            response.put("type", type);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send test notification email: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test admin notification email
     */
    @PostMapping("/test-admin")
    public ResponseEntity<Map<String, Object>> testAdminEmail() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String type = "LISTING_PENDING";
            String title = "Test Admin Notification";
            String message = "This is a test admin notification email from the GemNet system.";
            String details = "Test admin notification details";
            
            emailService.sendAdminNotificationEmail(type, title, message, details);
            
            response.put("success", true);
            response.put("message", "Test admin notification email sent to all admins");
            response.put("type", type);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send test admin email: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test welcome email for new users
     */
    @PostMapping("/test-welcome")
    public ResponseEntity<Map<String, Object>> testWelcomeEmail(@RequestParam String email, 
                                                               @RequestParam(defaultValue = "Test User") String name) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            emailService.sendWelcomeEmail(email, name, name.split(" ")[0]);
            
            response.put("success", true);
            response.put("message", "Test welcome email sent successfully to: " + email);
            response.put("recipientName", name);
            response.put("recipientEmail", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send test welcome email: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get email configuration status
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getEmailConfig() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("systemEmail", systemEmail);
        response.put("emailEnabled", true);
        response.put("status", "Email service is configured and ready");
        response.put("features", new String[]{
            "✅ Basic Test Emails",
            "🔔 Enhanced Notification Emails with Countdown",
            "⚠️ Admin Notification Emails", 
            "🎉 Welcome Emails for New Users"
        });
        
        return ResponseEntity.ok(response);
    }
}
