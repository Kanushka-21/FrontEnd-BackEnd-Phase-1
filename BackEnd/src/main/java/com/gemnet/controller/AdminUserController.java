package com.gemnet.controller;

import com.gemnet.model.User;
import com.gemnet.service.NoShowManagementService;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NoShowManagementService noShowManagementService;
    
    /**
     * Get all users with no-show statistics
     */
    @GetMapping("/with-no-show-stats")
    public ResponseEntity<?> getAllUsersWithNoShowStats() {
        try {
            List<User> users = userRepository.findAll();
            
            // Enhance users with no-show statistics
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get users by account status (ACTIVE, WARNED, BLOCKED)
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<?> getUsersByAccountStatus(@PathVariable String status) {
        try {
            List<User> users = userRepository.findByAccountStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            response.put("status", status);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching users by status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get no-show statistics for all users
     */
    @GetMapping("/no-show-statistics")
    public ResponseEntity<?> getNoShowStatistics() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            // Calculate statistics
            long totalUsers = allUsers.size();
            long activeUsers = allUsers.stream().filter(u -> "ACTIVE".equals(u.getAccountStatus())).count();
            long warnedUsers = allUsers.stream().filter(u -> "WARNED".equals(u.getAccountStatus())).count();
            long blockedUsers = allUsers.stream().filter(u -> "BLOCKED".equals(u.getAccountStatus())).count();
            
            // Total no-shows across all users
            int totalNoShows = allUsers.stream()
                .mapToInt(u -> u.getNoShowCount() != null ? u.getNoShowCount() : 0)
                .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("success", true);
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("warnedUsers", warnedUsers);
            stats.put("blockedUsers", blockedUsers);
            stats.put("totalNoShows", totalNoShows);
            
            // Users with most no-shows
            List<User> topNoShowUsers = allUsers.stream()
                .filter(u -> u.getNoShowCount() != null && u.getNoShowCount() > 0)
                .sorted((u1, u2) -> Integer.compare(
                    u2.getNoShowCount() != null ? u2.getNoShowCount() : 0,
                    u1.getNoShowCount() != null ? u1.getNoShowCount() : 0
                ))
                .limit(10)
                .toList();
            
            stats.put("topNoShowUsers", topNoShowUsers);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error calculating no-show statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Admin unblock user (reset no-show count and reactivate)
     */
    @PostMapping("/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable String userId, @RequestBody Map<String, String> requestData) {
        try {
            String adminNotes = requestData.get("adminNotes");
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Reset user status
            user.setAccountStatus("ACTIVE");
            user.setIsActive(true);
            user.setNoShowCount(0);
            user.setBlockingReason(null);
            user.setBlockedAt(null);
            user.setLastNoShowDate(null);
            
            // Add admin notes
            if (adminNotes != null && !adminNotes.trim().isEmpty()) {
                String currentNotes = user.getAdminNotes() != null ? user.getAdminNotes() : "";
                user.setAdminNotes(currentNotes + "\n[UNBLOCKED] " + adminNotes);
            }
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User unblocked successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error unblocking user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Admin reset user no-show count
     */
    @PostMapping("/{userId}/reset-no-shows")
    public ResponseEntity<?> resetUserNoShows(@PathVariable String userId, @RequestBody Map<String, String> requestData) {
        try {
            String adminNotes = requestData.get("adminNotes");
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Reset no-show count but keep user status
            int previousCount = user.getNoShowCount() != null ? user.getNoShowCount() : 0;
            user.setNoShowCount(0);
            user.setLastNoShowDate(null);
            
            // If user was warned but not blocked, reset to active
            if ("WARNED".equals(user.getAccountStatus())) {
                user.setAccountStatus("ACTIVE");
            }
            
            // Add admin notes
            if (adminNotes != null && !adminNotes.trim().isEmpty()) {
                String currentNotes = user.getAdminNotes() != null ? user.getAdminNotes() : "";
                user.setAdminNotes(currentNotes + "\n[NO-SHOW RESET] Previous count: " + previousCount + ". " + adminNotes);
            }
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "No-show count reset successfully");
            response.put("previousCount", previousCount);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error resetting no-show count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Search users by name, email, or phone
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        try {
            // Simple search across name fields, email, and phone
            List<User> users = userRepository.findAll().stream()
                .filter(user -> {
                    String searchText = query.toLowerCase();
                    String fullName = (user.getFirstName() + " " + user.getLastName()).toLowerCase();
                    String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                    String phone = user.getPhoneNumber() != null ? user.getPhoneNumber() : "";
                    
                    return fullName.contains(searchText) || 
                           email.contains(searchText) || 
                           phone.contains(searchText);
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("count", users.size());
            response.put("query", query);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error searching users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get detailed user profile with no-show history
     */
    @GetMapping("/{userId}/detailed-profile")
    public ResponseEntity<?> getDetailedUserProfile(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Get no-show statistics
            Map<String, Object> noShowStats = noShowManagementService.getUserNoShowStats(userId);
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("success", true);
            profile.put("user", user);
            profile.put("noShowStats", noShowStats);
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching user profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
