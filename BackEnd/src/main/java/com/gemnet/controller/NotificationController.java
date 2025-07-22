package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.service.BiddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling notification-related requests
 * Provides endpoints for users to view and manage their notifications
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private BiddingService biddingService;

    /**
     * Get notifications for a specific user with pagination
     * @param userId The user ID to fetch notifications for
     * @param page Page number (0-based)
     * @param size Number of notifications per page
     * @return Paginated list of notifications
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getUserNotifications(userId, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to fetch notifications: " + e.getMessage(), null));
        }
    }

    /**
     * Get unread notification count for a user
     * @param userId The user ID to get unread count for
     * @return Count of unread notifications
     */
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String userId) {
        try {
            ApiResponse<Map<String, Object>> response = biddingService.getUnreadNotificationCount(userId);
            if (response.isSuccess()) {
                Long count = (Long) response.getData().get("unreadCount");
                return ResponseEntity.ok(new ApiResponse<>(true, "Unread count retrieved", count));
            } else {
                return ResponseEntity.ok(new ApiResponse<>(false, response.getMessage(), 0L));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to fetch unread count: " + e.getMessage(), 0L));
        }
    }

    /**
     * Mark a notification as read
     * @param notificationId The notification ID to mark as read
     * @return Success response
     */
    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable String notificationId) {
        try {
            ApiResponse<String> response = biddingService.markNotificationAsRead(notificationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to mark notification as read: " + e.getMessage(), null));
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param userId The user ID to mark all notifications as read
     * @return Success response
     */
    @PutMapping("/{userId}/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsAsRead(@PathVariable String userId) {
        try {
            ApiResponse<String> response = biddingService.markAllNotificationsAsRead(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to mark all notifications as read: " + e.getMessage(), null));
        }
    }

    /**
     * Delete a notification
     * @param notificationId The notification ID to delete
     * @return Success response
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable String notificationId) {
        try {
            ApiResponse<String> response = biddingService.deleteNotification(notificationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Failed to delete notification: " + e.getMessage(), null));
        }
    }
}
