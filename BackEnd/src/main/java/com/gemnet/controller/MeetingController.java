package com.gemnet.controller;

import com.gemnet.model.Meeting;
import com.gemnet.service.MeetingService;
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
    
    /**
     * Create a new meeting request
     */
    @PostMapping("/create")
    public ResponseEntity<?> createMeeting(@RequestBody Map<String, Object> requestData) {
        try {
            String purchaseId = (String) requestData.get("purchaseId");
            String buyerId = (String) requestData.get("buyerId");
            String proposedDateTimeStr = (String) requestData.get("proposedDateTime");
            String location = (String) requestData.get("location");
            String meetingType = (String) requestData.get("meetingType");
            String buyerNotes = (String) requestData.get("buyerNotes");
            
            // Parse date time
            LocalDateTime proposedDateTime = LocalDateTime.parse(proposedDateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            Map<String, Object> result = meetingService.createMeeting(
                purchaseId, buyerId, proposedDateTime, location, meetingType, buyerNotes
            );
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating meeting: " + e.getMessage());
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
     * Get all meetings (admin only)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllMeetings() {
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
}
