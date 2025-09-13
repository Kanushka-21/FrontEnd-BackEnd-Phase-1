package com.gemnet.controller;

import com.gemnet.service.NoShowManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/api/no-show")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NoShowController {

    private static final Logger logger = LoggerFactory.getLogger(NoShowController.class);

    @Autowired
    private NoShowManagementService noShowManagementService;

    /**
     * User report no-show attendance
     */
    @PostMapping("/mark-attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String meetingId = (String) request.get("meetingId");
            String userId = (String) request.get("userId");
            String userType = (String) request.get("userType");
            Boolean attended = (Boolean) request.get("attended");
            String reason = (String) request.get("reason");
            
            logger.info("🔄 User {} ({}) reporting attendance for meeting: {} - Attended: {}", userId, userType, meetingId, attended);
            
            if (meetingId == null || meetingId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Meeting ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (userId == null || userId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "User ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (userType == null || userType.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "User type is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (attended == null) {
                response.put("success", false);
                response.put("message", "Attendance status is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Call service to record the attendance report
            Map<String, Object> result = noShowManagementService.recordUserAttendanceReport(
                meetingId, userId, userType, attended, reason);
            
            if ((Boolean) result.get("success")) {
                logger.info("✅ Attendance report recorded successfully for meeting: {}", meetingId);
            } else {
                logger.warn("⚠️ Failed to record attendance report: {}", result.get("message"));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ Error recording attendance report: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Failed to record attendance report: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Submit absence reason
     */
    @PostMapping("/submit-reason")
    public ResponseEntity<Map<String, Object>> submitAbsenceReason(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String meetingId = (String) request.get("meetingId");
            String userId = (String) request.get("userId");
            String userType = (String) request.get("userType");
            String reason = (String) request.get("reason");
            
            logger.info("🔄 User {} ({}) submitting absence reason for meeting: {}", userId, userType, meetingId);
            
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
}