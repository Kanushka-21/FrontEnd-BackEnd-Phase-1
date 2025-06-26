package com.gemnet.controller;

import com.gemnet.dto.*;
import com.gemnet.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and user registration APIs")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private com.gemnet.repository.UserRepository userRepository;    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Register a new user with personal information")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            System.out.println("🔐 User registration attempt for email: " + request.getEmail());
            System.out.println("🔐 Request details: " + request.getFirstName() + " " + request.getLastName() + ", NIC: " + request.getNicNumber());
            
            // Log headers for debugging
            System.out.println("📋 Request received from origin: " + 
                            ((HttpServletRequest) RequestContextHolder.getRequestAttributes().resolveReference(RequestAttributes.REFERENCE_REQUEST))
                            .getHeader("Origin"));
            
            // Enhanced validation
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Password is required"));
            }
            if (request.getNicNumber() == null || request.getNicNumber().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("NIC number is required"));
            }
            if (request.getFirstName() == null || request.getFirstName().isEmpty() ||
                request.getLastName() == null || request.getLastName().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("First name and last name are required"));
            }
            
            // Improved MongoDB connection check with retry
            int retryAttempts = 3;
            for (int i = 0; i < retryAttempts; i++) {
                try {
                    long userCount = userRepository.count();
                    System.out.println("✅ MongoDB connection verified - Current user count: " + userCount);
                    break; // Connection successful, exit the retry loop
                } catch (Exception dbEx) {
                    if (i == retryAttempts - 1) {  // If this was the last attempt
                        System.err.println("❌ MongoDB connection error after " + retryAttempts + " attempts: " + dbEx.getMessage());
                        dbEx.printStackTrace();
                        Map<String, Object> errorDetails = new HashMap<>();
                        errorDetails.put("email", request.getEmail());
                        errorDetails.put("dbError", dbEx.getMessage());
                        errorDetails.put("attempts", retryAttempts);
                        return ResponseEntity.status(503)
                            .body(ApiResponse.error("Database connection failed. Please try again later.", 
                                                   dbEx.getMessage()));
                    }
                    System.out.println("⚠️ MongoDB connection attempt " + (i+1) + " failed. Retrying...");
                    Thread.sleep(1000); // Wait before retrying
                }
            }
            
            ApiResponse<String> response = userService.registerUser(request);
            
            if (response.isSuccess()) {
                System.out.println("✅ User registered successfully: " + response.getData());
                // Return 201 Created status for successful creation
                return ResponseEntity.status(201).body(response);
            } else {
                System.out.println("❌ User registration failed: " + response.getMessage());
                // Return 400 Bad Request for validation errors
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            // Return 500 Internal Server Error for unexpected errors
            return ResponseEntity.status(500).body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }
    
    @PostMapping(value = "/verify-face/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify user face", description = "Upload and verify user's face image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyFace(
            @PathVariable String userId,
            @RequestParam("faceImage") MultipartFile faceImage) {
        
        System.out.println("📷 Face verification request for user: " + userId);
        System.out.println("📁 Image details: " + faceImage.getOriginalFilename() + 
                          " (" + faceImage.getSize() + " bytes)");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Validate input
            if (faceImage.isEmpty()) {
                System.err.println("❌ Face image is empty");
                result.put("error", "Face image is required");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Face image is required", result));
            }
            
            // Check file size (max 5MB)
            if (faceImage.getSize() > 5 * 1024 * 1024) {
                System.err.println("❌ Face image too large: " + faceImage.getSize() + " bytes");
                result.put("error", "Image too large");
                result.put("maxSize", "5MB");
                result.put("actualSize", faceImage.getSize());
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Image too large. Maximum size is 5MB", result));
            }
            
            // Check file type
            String contentType = faceImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.err.println("❌ Invalid file type: " + contentType);
                result.put("error", "Invalid file type");
                result.put("contentType", contentType);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid file type. Please upload an image", result));
            }
            
            // Process face verification
            ApiResponse<Map<String, Object>> response = userService.processFaceVerification(userId, faceImage);
            
            if (response.isSuccess()) {
                System.out.println("✅ Face verification successful for user: " + userId);
            } else {
                System.out.println("❌ Face verification failed for user: " + userId + 
                                 " - " + response.getMessage());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Face verification error for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            
            result.put("error", e.getMessage());
            result.put("userId", userId);
            return ResponseEntity.ok(ApiResponse.error("Face verification failed: " + e.getMessage(), result));
        }
    }
    
    @PostMapping(value = "/verify-nic/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify NIC", description = "Upload and verify user's NIC image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyNic(
            @PathVariable String userId,
            @RequestParam("nicImage") MultipartFile nicImage) {
        
        System.out.println("🆔 NIC verification request for user: " + userId);
        System.out.println("📁 Image details: " + nicImage.getOriginalFilename() + 
                          " (" + nicImage.getSize() + " bytes)");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Validate input
            if (nicImage.isEmpty()) {
                System.err.println("❌ NIC image is empty");
                result.put("error", "NIC image is required");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("NIC image is required", result));
            }
            
            // Check file size (max 10MB for NIC images)
            if (nicImage.getSize() > 10 * 1024 * 1024) {
                System.err.println("❌ NIC image too large: " + nicImage.getSize() + " bytes");
                result.put("error", "Image too large");
                result.put("maxSize", "10MB");
                result.put("actualSize", nicImage.getSize());
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Image too large. Maximum size is 10MB", result));
            }
            
            // Check file type
            String contentType = nicImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.err.println("❌ Invalid file type: " + contentType);
                result.put("error", "Invalid file type");
                result.put("contentType", contentType);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid file type. Please upload an image", result));
            }
            
            // Process NIC verification
            ApiResponse<Map<String, Object>> response = userService.processNicVerification(userId, nicImage);
            
            if (response.isSuccess()) {
                System.out.println("✅ NIC verification successful for user: " + userId);
            } else {
                System.out.println("❌ NIC verification failed for user: " + userId + 
                                 " - " + response.getMessage());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ NIC verification error for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            
            result.put("error", e.getMessage());
            result.put("userId", userId);
            return ResponseEntity.ok(ApiResponse.error("NIC verification failed: " + e.getMessage(), result));
        }
    }
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("🔑 Login attempt for email: " + request.getEmail());
            ApiResponse<AuthenticationResponse> response = userService.loginUser(request);
            
            if (response.isSuccess()) {
                System.out.println("✅ Login successful for: " + request.getEmail());
            } else {
                System.out.println("❌ Login failed for: " + request.getEmail() + " - " + response.getMessage());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Login error for " + request.getEmail() + ": " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user-status/{userId}")
    @Operation(summary = "Get user verification status", description = "Check the current verification status of a user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatus(@PathVariable String userId) {
        try {
            System.out.println("📊 Status check for user: " + userId);
            ApiResponse<Map<String, Object>> response = userService.getUserVerificationStatus(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Status check error for user " + userId + ": " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Failed to get user status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the authentication service is running")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "Authentication Service");
        status.put("status", "Running");
        status.put("timestamp", System.currentTimeMillis());
        status.put("version", "1.0.0");
        
        return ResponseEntity.ok(ApiResponse.success("Authentication service is running", status));
    }
}
