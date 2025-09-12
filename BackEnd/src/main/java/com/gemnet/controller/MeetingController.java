package com.gemnet.controller;

import com.gemnet.model.Meeting;
import com.gemnet.service.MeetingService;
import com.gemnet.service.NoShowManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    
    @Autowired
    private MeetingService meetingService;
    
    @Autowired
    private NoShowManagementService noShowManagementService;
    
    /**
     * Create a new meeting request
     */
    @PostMapping("/create")
    public ResponseEntity<?> createMeeting(@RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("📥 Received meeting creation request:");
            System.out.println("   - Request data: " + requestData);
            
            String purchaseId = (String) requestData.get("purchaseId");
            String buyerId = (String) requestData.get("buyerId");
            String proposedDateTimeStr = (String) requestData.get("proposedDateTime");
            String location = (String) requestData.get("location");
            String meetingType = (String) requestData.get("meetingType");
            String buyerNotes = (String) requestData.get("buyerNotes");
            
            System.out.println("   - Purchase ID: " + purchaseId);
            System.out.println("   - Buyer ID: " + buyerId);
            System.out.println("   - Proposed Date/Time: " + proposedDateTimeStr);
            System.out.println("   - Location: " + location);
            System.out.println("   - Meeting Type: " + meetingType);
            
            // Validate required fields
            if (purchaseId == null || purchaseId.trim().isEmpty()) {
                System.out.println("❌ Validation failed: purchaseId is null or empty");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Purchase ID is required");
                errorResponse.put("error", "VALIDATION_ERROR");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (buyerId == null || buyerId.trim().isEmpty()) {
                System.out.println("❌ Validation failed: buyerId is null or empty");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Buyer ID is required");
                errorResponse.put("error", "VALIDATION_ERROR");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (proposedDateTimeStr == null || proposedDateTimeStr.trim().isEmpty()) {
                System.out.println("❌ Validation failed: proposedDateTime is null or empty");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Proposed date/time is required");
                errorResponse.put("error", "VALIDATION_ERROR");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Parse date time
            LocalDateTime proposedDateTime;
            try {
                proposedDateTime = LocalDateTime.parse(proposedDateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                System.out.println("✅ Successfully parsed date/time: " + proposedDateTime);
            } catch (Exception e) {
                System.out.println("❌ Failed to parse date/time: " + proposedDateTimeStr + " - " + e.getMessage());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid date/time format: " + proposedDateTimeStr);
                errorResponse.put("error", "DATE_PARSING_ERROR");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            System.out.println("🔄 Calling meetingService.createMeeting...");
            Map<String, Object> result = meetingService.createMeeting(
                purchaseId, buyerId, proposedDateTime, location, meetingType, buyerNotes
            );
            
            System.out.println("📤 Service result: " + result);
            
            if ((Boolean) result.get("success")) {
                System.out.println("✅ Meeting created successfully");
                return ResponseEntity.ok(result);
            } else {
                System.out.println("❌ Meeting creation failed: " + result.get("message"));
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            System.out.println("❌ Exception in createMeeting: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating meeting: " + e.getMessage());
            errorResponse.put("error", "INTERNAL_ERROR");
            errorResponse.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get meetings for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMeetingsForUser(@PathVariable String userId) {
        try {
            List<Meeting> meetings = meetingService.getMeetingsForUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching meetings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get meeting by ID
     */
    @GetMapping("/{meetingId}")
    public ResponseEntity<?> getMeetingById(@PathVariable String meetingId) {
        try {
            Optional<Meeting> meetingOpt = meetingService.getMeetingById(meetingId);
            
            if (meetingOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("meeting", meetingOpt.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Meeting not found");
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Confirm a meeting (seller confirms)
     */
    @PutMapping("/{meetingId}/confirm")
    public ResponseEntity<?> confirmMeeting(@PathVariable String meetingId, @RequestBody Map<String, String> requestData) {
        try {
            String sellerId = requestData.get("sellerId");
            String sellerNotes = requestData.get("sellerNotes");
            
            Map<String, Object> result = meetingService.confirmMeeting(meetingId, sellerId, sellerNotes);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error confirming meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Reschedule a meeting
     */
    @PutMapping("/{meetingId}/reschedule")
    public ResponseEntity<?> rescheduleMeeting(@PathVariable String meetingId, @RequestBody Map<String, Object> requestData) {
        try {
            String userId = (String) requestData.get("userId");
            String newDateTimeStr = (String) requestData.get("newDateTime");
            String notes = (String) requestData.get("notes");
            
            LocalDateTime newDateTime = LocalDateTime.parse(newDateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            Map<String, Object> result = meetingService.rescheduleMeeting(meetingId, userId, newDateTime, notes);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error rescheduling meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Complete a meeting
     */
    @PutMapping("/{meetingId}/complete")
    public ResponseEntity<?> completeMeeting(@PathVariable String meetingId, @RequestBody Map<String, String> requestData) {
        try {
            String userId = requestData.get("userId");
            
            Map<String, Object> result = meetingService.completeMeeting(meetingId, userId);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error completing meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Cancel a meeting
     */
    @PutMapping("/{meetingId}/cancel")
    public ResponseEntity<?> cancelMeeting(@PathVariable String meetingId, @RequestBody Map<String, String> requestData) {
        try {
            String userId = requestData.get("userId");
            String reason = requestData.get("reason");
            
            Map<String, Object> result = meetingService.cancelMeeting(meetingId, userId, reason);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error cancelling meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all meetings (admin only) with detailed information
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllMeetings() {
        try {
            System.out.println("🔄 [Admin] Getting all meetings with details...");
            List<Map<String, Object>> meetings = meetingService.getAllMeetingsWithDetails();
            System.out.println("✅ [Admin] Successfully retrieved " + meetings.size() + " meetings");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ [Admin] Error fetching meetings: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching meetings: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Admin mark meeting as completed and send notifications to both parties
     */
    @PutMapping("/admin/{meetingId}/complete")
    public ResponseEntity<?> adminCompleteMeeting(@PathVariable String meetingId) {
        try {
            System.out.println("🔄 [Admin] Marking meeting as completed: " + meetingId);
            
            Map<String, Object> result = meetingService.adminCompleteMeeting(meetingId);
            
            if ((Boolean) result.get("success")) {
                System.out.println("✅ [Admin] Meeting marked as completed successfully: " + meetingId);
                return ResponseEntity.ok(result);
            } else {
                System.out.println("❌ [Admin] Failed to mark meeting as completed: " + result.get("message"));
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            System.err.println("❌ [Admin] Error marking meeting as completed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error marking meeting as completed: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all meetings summary (admin only) - legacy endpoint
     */
    @GetMapping("/admin/summary")
    public ResponseEntity<?> getAllMeetingsSummary() {
        try {
            List<Meeting> meetings = meetingService.getAllMeetings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching meetings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get upcoming meetings
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingMeetings() {
        try {
            List<Meeting> meetings = meetingService.getUpcomingMeetings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching upcoming meetings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get meetings by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getMeetingsByStatus(@PathVariable String status) {
        try {
            List<Meeting> meetings = meetingService.getMeetingsByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching meetings by status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ============ NO-SHOW MANAGEMENT ENDPOINTS ============
    
    /**
     * Admin mark attendance for a meeting
     */
    @PostMapping("/admin/{meetingId}/mark-attendance")
    public ResponseEntity<?> markAttendance(@PathVariable String meetingId, @RequestBody Map<String, Object> requestData) {
        try {
            String adminId = (String) requestData.get("adminId");
            Boolean buyerAttended = (Boolean) requestData.get("buyerAttended");
            Boolean sellerAttended = (Boolean) requestData.get("sellerAttended");
            String adminNotes = (String) requestData.get("adminNotes");
            
            Map<String, Object> result = noShowManagementService.markAttendance(
                meetingId, adminId, buyerAttended, sellerAttended, adminNotes);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error marking attendance: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * User submit reason for absence
     */
    @PostMapping("/{meetingId}/submit-absence-reason")
    public ResponseEntity<?> submitAbsenceReason(@PathVariable String meetingId, @RequestBody Map<String, String> requestData) {
        try {
            String userId = requestData.get("userId");
            String reason = requestData.get("reason");
            
            Map<String, Object> result = noShowManagementService.submitAbsenceReason(meetingId, userId, reason);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error submitting absence reason: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Admin review absence reason
     */
    @PostMapping("/admin/{meetingId}/review-absence-reason")
    public ResponseEntity<?> reviewAbsenceReason(@PathVariable String meetingId, @RequestBody Map<String, Object> requestData) {
        try {
            String userId = (String) requestData.get("userId");
            Boolean accepted = (Boolean) requestData.get("accepted");
            String adminNotes = (String) requestData.get("adminNotes");
            
            Map<String, Object> result = noShowManagementService.reviewAbsenceReason(
                meetingId, userId, accepted, adminNotes);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error reviewing absence reason: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get user no-show statistics
     */
    @GetMapping("/user/{userId}/no-show-stats")
    public ResponseEntity<?> getUserNoShowStats(@PathVariable String userId) {
        try {
            Map<String, Object> stats = noShowManagementService.getUserNoShowStats(userId);
            
            if ((Boolean) stats.get("success")) {
                return ResponseEntity.ok(stats);
            } else {
                return ResponseEntity.badRequest().body(stats);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching no-show stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Admin search meeting by display ID
     */
    @GetMapping("/admin/search/{displayId}")
    public ResponseEntity<?> searchMeetingByDisplayId(@PathVariable String displayId) {
        try {
            Optional<Meeting> meetingOpt = meetingService.getMeetingByDisplayId(displayId);
            
            if (meetingOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("meeting", meetingOpt.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Meeting not found with display ID: " + displayId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error searching meeting: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Download meeting info for users
     */
    @GetMapping("/{meetingId}/download-info")
    public ResponseEntity<?> downloadMeetingInfo(@PathVariable String meetingId, @RequestParam String userId) {
        try {
            Optional<Meeting> meetingOpt = meetingService.getMeetingById(meetingId);
            
            if (!meetingOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Meeting not found");
                return ResponseEntity.notFound().build();
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify user is part of this meeting
            if (!meeting.getBuyerId().equals(userId) && !meeting.getSellerId().equals(userId)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Not authorized to download this meeting info");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }
            
            // Prepare meeting info for download
            Map<String, Object> meetingInfo = new HashMap<>();
            meetingInfo.put("meetingId", meeting.getMeetingDisplayId() != null ? 
                meeting.getMeetingDisplayId() : meeting.getId());
            meetingInfo.put("gemName", meeting.getGemName());
            meetingInfo.put("gemType", meeting.getGemType());
            meetingInfo.put("finalPrice", meeting.getFinalPrice());
            meetingInfo.put("confirmedDateTime", meeting.getConfirmedDateTime());
            meetingInfo.put("location", meeting.getLocation());
            meetingInfo.put("status", meeting.getStatus());
            meetingInfo.put("buyerName", meeting.getBuyerEmail());
            meetingInfo.put("sellerName", meeting.getSellerEmail());
            meetingInfo.put("buyerPhone", meeting.getBuyerPhone());
            meetingInfo.put("sellerPhone", meeting.getSellerPhone());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("meetingInfo", meetingInfo);
            response.put("downloadFormat", "json");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error downloading meeting info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
