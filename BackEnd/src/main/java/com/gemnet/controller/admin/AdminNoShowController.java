package com.gemnet.controller.admin;

import com.gemnet.model.Meeting;
import com.gemnet.service.NoShowManagementService;
import com.gemnet.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/api/admin/no-show")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminNoShowController {

    private static final Logger logger = LoggerFactory.getLogger(AdminNoShowController.class);

    @Autowired
    private NoShowManagementService noShowManagementService;
    
    @Autowired
    private MeetingService meetingService;

    /**
     * Get all confirmed meetings for no-show management with search capability
     */
    @GetMapping("/meetings")
    public ResponseEntity<Map<String, Object>> getConfirmedMeetings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting confirmed meetings for no-show management - Page: {}, Size: {}, Search: {}", page, size, search);
            
            // Get all confirmed meetings with optional search
            List<Meeting> allMeetings = meetingService.getAllMeetings();
            List<Meeting> confirmedMeetings = new ArrayList<>();
            
            for (Meeting meeting : allMeetings) {
                if ("CONFIRMED".equals(meeting.getStatus())) {
                    // Apply search filter if provided
                    if (search == null || search.trim().isEmpty() || 
                        (meeting.getId() != null && meeting.getId().toLowerCase().contains(search.toLowerCase())) ||
                        (meeting.getMeetingDisplayId() != null && meeting.getMeetingDisplayId().toLowerCase().contains(search.toLowerCase())) ||
                        (meeting.getGemName() != null && meeting.getGemName().toLowerCase().contains(search.toLowerCase()))) {
                        confirmedMeetings.add(meeting);
                    }
                }
            }
            
            // Manual pagination
            int start = page * size;
            int end = Math.min(start + size, confirmedMeetings.size());
            List<Meeting> paginatedMeetings = start < confirmedMeetings.size() ? 
                confirmedMeetings.subList(start, end) : new ArrayList<>();
            
            response.put("success", true);
            response.put("meetings", paginatedMeetings);
            response.put("totalElements", confirmedMeetings.size());
            response.put("totalPages", (int) Math.ceil((double) confirmedMeetings.size() / size));
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("message", "Confirmed meetings retrieved successfully");
            
            logger.info("✅ Retrieved {} confirmed meetings out of {} total", paginatedMeetings.size(), confirmedMeetings.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving confirmed meetings: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to retrieve meetings: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all no-show records for admin dashboard
     */
    @GetMapping("/records")
    public ResponseEntity<Map<String, Object>> getNoShowRecords() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting no-show records for admin dashboard");
            
            List<Map<String, Object>> records = noShowManagementService.getNoShowRecords();
            
            response.put("success", true);
            response.put("records", records);
            response.put("totalRecords", records.size());
            response.put("message", "No-show records retrieved successfully");
            
            logger.info("✅ Retrieved {} no-show records", records.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving no-show records: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to retrieve no-show records: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get no-show statistics for admin dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNoShowStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting no-show statistics for admin dashboard");
            
            Map<String, Object> stats = noShowManagementService.getNoShowStatistics();
            
            response.put("success", true);
            response.put("stats", stats);
            response.put("message", "No-show statistics retrieved successfully");
            
            logger.info("✅ Retrieved no-show statistics");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving no-show statistics: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to retrieve no-show statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Mark attendance for a meeting
     */
    @PostMapping("/mark-attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String meetingId = (String) request.get("meetingId");
            String adminId = (String) request.get("adminId");
            Boolean buyerAttended = (Boolean) request.get("buyerAttended");
            Boolean sellerAttended = (Boolean) request.get("sellerAttended");
            String adminNotes = (String) request.get("adminNotes");
            
            logger.info("🔄 Admin {} marking attendance for meeting: {}", adminId, meetingId);
            
            if (meetingId == null || meetingId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Meeting ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (adminId == null || adminId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Admin ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Map<String, Object> result = noShowManagementService.markAttendance(
                meetingId, adminId, buyerAttended, sellerAttended, adminNotes);
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ Attendance marked successfully for meeting: {}", meetingId);
            } else {
                logger.warn("⚠️ Failed to mark attendance: {}", result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error marking attendance: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to mark attendance: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Submit absence reason (from user dashboard)
     */
    @PostMapping("/submit-reason")
    public ResponseEntity<Map<String, Object>> submitAbsenceReason(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String meetingId = (String) request.get("meetingId");
            String userId = (String) request.get("userId");
            String reason = (String) request.get("reason");
            
            logger.info("🔄 User {} submitting absence reason for meeting: {}", userId, meetingId);
            
            if (meetingId == null || userId == null || reason == null || reason.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Meeting ID, User ID, and reason are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Map<String, Object> result = noShowManagementService.submitAbsenceReason(meetingId, userId, reason);
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ Absence reason submitted successfully for meeting: {}", meetingId);
            } else {
                logger.warn("⚠️ Failed to submit absence reason: {}", result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error submitting absence reason: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to submit reason: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Admin review and accept/reject absence reason
     */
    @PostMapping("/review-reason")
    public ResponseEntity<Map<String, Object>> reviewAbsenceReason(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String meetingId = (String) request.get("meetingId");
            String userId = (String) request.get("userId");
            Boolean accepted = (Boolean) request.get("accepted");
            String adminNotes = (String) request.get("adminNotes");
            
            logger.info("🔄 Admin reviewing absence reason for user {} in meeting: {}", userId, meetingId);
            
            if (meetingId == null || userId == null || accepted == null) {
                response.put("success", false);
                response.put("message", "Meeting ID, User ID, and decision are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Map<String, Object> result = noShowManagementService.reviewAbsenceReason(
                meetingId, userId, accepted, adminNotes);
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ Absence reason {} for user {} in meeting: {}", 
                    accepted ? "accepted" : "rejected", userId, meetingId);
            } else {
                logger.warn("⚠️ Failed to review absence reason: {}", result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error reviewing absence reason: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to review reason: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get meetings requiring verification (past confirmed meetings without attendance marked)
     */
    @GetMapping("/requiring-verification")
    public ResponseEntity<Map<String, Object>> getMeetingsRequiringVerification() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting meetings requiring verification");
            
            List<Meeting> meetings = noShowManagementService.getMeetingsRequiringVerification();
            
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("totalCount", meetings.size());
            response.put("message", "Meetings requiring verification retrieved successfully");
            
            logger.info("✅ Retrieved {} meetings requiring verification", meetings.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving meetings requiring verification: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to retrieve meetings: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user no-show statistics
     */
    @GetMapping("/user-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserNoShowStats(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting no-show stats for user: {}", userId);
            
            Map<String, Object> stats = noShowManagementService.getUserNoShowStats(userId);
            
            if ((Boolean) stats.get("success")) {
                logger.info("✅ Retrieved no-show stats for user: {}", userId);
            } else {
                logger.warn("⚠️ Failed to get user stats: {}", stats.get("message"));
            }
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("❌ Error getting user no-show stats: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to get user stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all blocked users for admin management
     */
    @GetMapping("/blocked-users")
    public ResponseEntity<Map<String, Object>> getBlockedUsers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("🔄 Getting blocked users for admin management");
            
            Map<String, Object> result = noShowManagementService.getBlockedUsers();
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ Retrieved blocked users list");
            } else {
                logger.warn("⚠️ Failed to get blocked users: {}", result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error getting blocked users: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to get blocked users: " + e.getMessage());
            response.put("blockedUsers", new ArrayList<>());
            response.put("totalBlocked", 0);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Admin unblock a blocked user
     */
    @PostMapping("/unblock-user")
    public ResponseEntity<Map<String, Object>> unblockUser(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) request.get("userId");
            String adminId = (String) request.get("adminId");
            String reason = (String) request.get("reason");
            
            logger.info("🔓 Admin {} attempting to unblock user: {}", adminId, userId);
            
            if (userId == null || userId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "User ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (adminId == null || adminId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Admin ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Map<String, Object> result = noShowManagementService.unblockUser(userId, adminId, reason);
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ User {} successfully unblocked by admin {}", userId, adminId);
            } else {
                logger.warn("⚠️ Failed to unblock user {}: {}", userId, result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error unblocking user: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to unblock user: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
