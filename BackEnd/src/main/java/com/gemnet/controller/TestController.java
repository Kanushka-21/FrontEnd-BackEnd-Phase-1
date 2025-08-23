package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.Meeting;
import com.gemnet.service.FaceRecognitionService;
import com.gemnet.service.NicVerificationService;
import com.gemnet.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Test", description = "Test APIs for verification functionality")
@CrossOrigin(origins = "*")
public class TestController {
    
    @Autowired
    private NicVerificationService nicVerificationService;
    
    @Autowired
    private FaceRecognitionService faceRecognitionService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @PostMapping("/verify-nic-full")
    @Operation(summary = "Complete NIC verification test", description = "Test complete NIC verification with face comparison")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testNicVerification(
            @RequestParam("nicImage") MultipartFile nicImage,
            @RequestParam("faceImage") MultipartFile faceImage) {
        
        Map<String, Object> results = new HashMap<>();
        
        try {
            // Test 1: Validate NIC image quality
            boolean nicQualityValid = nicVerificationService.validateNicImageQuality(nicImage);
            results.put("nicImageQualityValid", nicQualityValid);
            
            // Test 2: Extract NIC number using OCR
            String extractedNicNumber = null;
            try {
                extractedNicNumber = nicVerificationService.extractNicNumber(nicImage);
                results.put("extractedNicNumber", extractedNicNumber);
                results.put("nicNumberExtractionSuccess", true);
            } catch (Exception e) {
                results.put("nicNumberExtractionSuccess", false);
                results.put("nicNumberExtractionError", e.getMessage());
            }
            
            // Test 3: Validate face image
            boolean faceValid = faceRecognitionService.validateFaceInImage(faceImage);
            results.put("faceImageValid", faceValid);
            
            // Test 4: Extract face features
            String faceFeatures = null;
            try {
                faceFeatures = faceRecognitionService.extractFaceFeatures(faceImage);
                results.put("faceFeatureExtractionSuccess", true);
                results.put("faceFeatures", faceFeatures != null ? "Generated successfully" : "Failed");
            } catch (Exception e) {
                results.put("faceFeatureExtractionSuccess", false);
                results.put("faceFeatureExtractionError", e.getMessage());
            }
            
            // Test 5: Store files temporarily
            String testUserId = "test-user-" + System.currentTimeMillis();
            try {
                String nicImagePath = fileStorageService.storeNicImage(nicImage, testUserId);
                String faceImagePath = fileStorageService.storeFaceImage(faceImage, testUserId);
                
                results.put("fileStorageSuccess", true);
                results.put("nicImagePath", nicImagePath);
                results.put("faceImagePath", faceImagePath);
                
                // Test 6: Extract photo from NIC
                try {
                    String extractedPhotoPath = nicVerificationService.extractNicPhoto(nicImage, testUserId);
                    results.put("nicPhotoExtractionSuccess", true);
                    results.put("extractedPhotoPath", extractedPhotoPath);
                    
                    // Test 7: Compare faces
                    try {
                        boolean facesMatch = faceRecognitionService.compareFaces(faceImagePath, extractedPhotoPath);
                        results.put("faceComparisonSuccess", true);
                        results.put("facesMatch", facesMatch);
                    } catch (Exception e) {
                        results.put("faceComparisonSuccess", false);
                        results.put("faceComparisonError", e.getMessage());
                    }
                    
                } catch (Exception e) {
                    results.put("nicPhotoExtractionSuccess", false);
                    results.put("nicPhotoExtractionError", e.getMessage());
                }
                
            } catch (Exception e) {
                results.put("fileStorageSuccess", false);
                results.put("fileStorageError", e.getMessage());
            }
            
            // Overall assessment
            boolean overallSuccess = nicQualityValid && faceValid && 
                                   (extractedNicNumber != null) && 
                                   (faceFeatures != null);
            results.put("overallSuccess", overallSuccess);
            
            if (overallSuccess) {
                return ResponseEntity.ok(ApiResponse.success("NIC verification test completed successfully", results));
            } else {
                return ResponseEntity.ok(ApiResponse.error("Some verification steps failed", results));
            }
            
        } catch (Exception e) {
            results.put("unexpectedError", e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Unexpected error during verification", results));
        }
    }
    
    @PostMapping("/extract-nic-number")
    @Operation(summary = "Test NIC number extraction", description = "Test OCR extraction from NIC image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testNicNumberExtraction(
            @RequestParam("nicImage") MultipartFile nicImage) {
        
        Map<String, Object> results = new HashMap<>();
        
        try {
            String extractedNumber = nicVerificationService.extractNicNumber(nicImage);
            results.put("extractedNumber", extractedNumber);
            results.put("success", true);
            
            return ResponseEntity.ok(ApiResponse.success("NIC number extracted successfully", results));
            
        } catch (Exception e) {
            results.put("success", false);
            results.put("error", e.getMessage());
            
            return ResponseEntity.ok(ApiResponse.error("Failed to extract NIC number", results));
        }
    }
    
    @PostMapping("/validate-face")
    @Operation(summary = "Test face validation", description = "Test face detection in uploaded image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testFaceValidation(
            @RequestParam("faceImage") MultipartFile faceImage) {
        
        Map<String, Object> results = new HashMap<>();
        
        try {
            boolean isValid = faceRecognitionService.validateFaceInImage(faceImage);
            results.put("faceDetected", isValid);
            
            if (isValid) {
                String features = faceRecognitionService.extractFaceFeatures(faceImage);
                results.put("featuresExtracted", features != null);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Face validation completed", results));
            
        } catch (Exception e) {
            results.put("error", e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Face validation failed", results));
        }
    }
    
    @GetMapping("/service-status")
    @Operation(summary = "Get service status", description = "Check the status of all verification services")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getServiceStatus() {
        
        Map<String, Object> status = new HashMap<>();
        
        try {
            // NIC Verification Service Status
            Map<String, Object> nicService = new HashMap<>();
            nicService.put("initialized", nicVerificationService.isInitialized());
            nicService.put("status", nicService.get("initialized"));
            nicService.put("details", nicVerificationService.getServiceStatus());
            if (!(Boolean) nicService.get("initialized")) {
                nicService.put("installationInstructions", nicVerificationService.getInstallationInstructions());
            }
            status.put("nicVerificationService", nicService);
            
            // Face Recognition Service Status
            Map<String, Object> faceService = new HashMap<>();
            faceService.put("status", "Available");
            faceService.put("details", "OpenCV face recognition is available");
            status.put("faceRecognitionService", faceService);
            
            // File Storage Service Status
            Map<String, Object> fileService = new HashMap<>();
            fileService.put("status", "Available");
            fileService.put("details", "File storage service is available");
            status.put("fileStorageService", fileService);
            
            // Overall System Status
            boolean allServicesOk = nicVerificationService.isInitialized();
            status.put("overallStatus", allServicesOk ? "All Services Operational" : "Some Services Using Fallback");
            status.put("readyForProduction", allServicesOk);
            
            if (!allServicesOk) {
                status.put("recommendedAction", "Install missing dependencies (see installationInstructions)");
            }
            
            return ResponseEntity.ok(ApiResponse.success("Service status retrieved", status));
            
        } catch (Exception e) {
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("error", e.getMessage());
            errorStatus.put("overallStatus", "Error checking service status");
            
            return ResponseEntity.ok(ApiResponse.error("Failed to get service status", errorStatus));
        }
    }
    
    @PostMapping("/meetings")
    @Operation(summary = "Test meeting creation", description = "Test meeting model creation")
    public ResponseEntity<ApiResponse<Meeting>> testMeetingCreation(@RequestBody Meeting meeting) {
        try {
            System.out.println("📅 Testing meeting creation: " + meeting.getBuyerId() + " -> " + meeting.getSellerId());
            
            // Just echo back the meeting data for testing
            meeting.setId("test-meeting-" + System.currentTimeMillis());
            meeting.setStatus("PENDING");
            
            Map<String, Object> response = new HashMap<>();
            response.put("meeting", meeting);
            response.put("message", "Meeting test endpoint working");
            
            return ResponseEntity.ok(ApiResponse.success("Meeting test successful", meeting));
        } catch (Exception e) {
            System.err.println("❌ Error in meeting test: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Meeting test failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/meetings/user/{userId}")
    @Operation(summary = "Test get user meetings", description = "Test meetings retrieval for user")
    public ResponseEntity<ApiResponse<java.util.List<Meeting>>> testGetUserMeetings(@PathVariable String userId) {
        try {
            System.out.println("📅 Testing get meetings for user: " + userId);
            
            java.util.List<Meeting> meetings = new java.util.ArrayList<>();
            Meeting testMeeting = new Meeting();
            testMeeting.setId("test-meeting-1");
            testMeeting.setBuyerId(userId);
            testMeeting.setSellerId("test-seller");
            testMeeting.setStatus("PENDING");
            testMeeting.setProposedDateTime(java.time.LocalDateTime.parse("2025-08-23T14:00:00"));
            testMeeting.setLocation("Test Location");
            testMeeting.setMeetingType("IN_PERSON");
            meetings.add(testMeeting);
            
            return ResponseEntity.ok(ApiResponse.success("User meetings test successful", meetings));
        } catch (Exception e) {
            System.err.println("❌ Error in user meetings test: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("User meetings test failed: " + e.getMessage()));
        }
    }
}
