package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.GemCertificateDataDto;
import com.gemnet.dto.GemListingDataDto;
import com.gemnet.service.GemCertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling CSL (Colored Stone Laboratory) certificate processing and data extraction
 */
@RestController
@RequestMapping("/api/gemsData")
@Tag(name = "CSL Gem Certificate", description = "CSL certificate processing and data extraction APIs")
@CrossOrigin(origins = "*")
public class GemCertificateController {
    
    @Autowired
    private GemCertificateService gemCertificateService;
    
    /**
     * Extract data from CSL gem certificate image
     */
    @PostMapping(value = "/extract-certificate-data", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Extract CSL certificate data", 
               description = "Upload a CSL gem certificate image and extract structured data using OCR")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<GemCertificateDataDto>> extractCertificateData(
            @RequestParam("certificate") MultipartFile certificateImage) {
        
        System.out.println("💎 CSL certificate data extraction request received");
        System.out.println("📁 Image details: " + certificateImage.getOriginalFilename() + 
                          " (" + certificateImage.getSize() + " bytes)");
        
        try {
            // Validate input
            if (certificateImage.isEmpty()) {
                System.err.println("❌ Certificate image is empty");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Certificate image is required"));
            }
            
            // Check file size (max 10MB)
            if (certificateImage.getSize() > 10 * 1024 * 1024) {
                System.err.println("❌ Certificate image too large: " + certificateImage.getSize() + " bytes");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Image too large. Maximum size is 10MB"));
            }
            
            // Check file type
            String contentType = certificateImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.err.println("❌ Invalid file type: " + contentType);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid file type. Please upload an image"));
            }
            
            // Process the CSL certificate
            ApiResponse<GemCertificateDataDto> response = 
                gemCertificateService.extractCertificateData(certificateImage);
            
            if (response.isSuccess()) {
                System.out.println("✅ CSL certificate data extraction successful");
                System.out.println("📋 Extracted CSL Memo No: " + 
                    (response.getData() != null ? response.getData().getCslMemoNo() : "N/A"));
                System.out.println("📋 Extracted Variety: " + 
                    (response.getData() != null ? response.getData().getVariety() : "N/A"));
                System.out.println("📋 Treatment: " + 
                    (response.getData() != null ? response.getData().getTreatment() : "N/A"));
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ CSL certificate data extraction failed: " + response.getMessage());
                return ResponseEntity.ok(response); // Return 200 with error details in response
            }
            
        } catch (Exception e) {
            System.err.println("❌ CSL certificate extraction error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("CSL certificate extraction failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get sample CSL certificate data for testing
     */
    @GetMapping("/sample-csl-data")
    @Operation(summary = "Get sample CSL data", 
               description = "Get sample CSL certificate data for testing purposes")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<GemCertificateDataDto>> getSampleCSLData() {
        try {
            System.out.println("📋 Sample CSL data requested");
            GemCertificateDataDto sampleData = gemCertificateService.getSampleCSLData();
            
            return ResponseEntity.ok(ApiResponse.success("Sample CSL certificate data", sampleData));
            
        } catch (Exception e) {
            System.err.println("❌ Sample CSL data error: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get sample CSL data: " + e.getMessage()));
        }
    }
    
    /**
     * Validate if uploaded image is a CSL certificate
     */
    @PostMapping(value = "/validate-csl-certificate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Validate CSL certificate", 
               description = "Check if uploaded image appears to be a CSL certificate")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCSLCertificate(
            @RequestParam("certificate") MultipartFile certificateImage) {
        
        System.out.println("🔍 CSL certificate validation request received");
        
        Map<String, Object> validationResult = new HashMap<>();
        
        try {
            // Basic file validation
            validationResult.put("fileValidation", validateFileForTest(certificateImage));
            
            // Quick OCR to check if it's a CSL certificate
            if (!certificateImage.isEmpty()) {
                // This is a simplified check - in practice you might want to do basic OCR
                String filename = certificateImage.getOriginalFilename();
                String contentType = certificateImage.getContentType();
                
                validationResult.put("fileName", filename);
                validationResult.put("contentType", contentType);
                validationResult.put("fileSize", certificateImage.getSize());
                
                // For now, assume it's valid if it's an image
                boolean isValidFormat = contentType != null && contentType.startsWith("image/");
                validationResult.put("isValidCSLCandidate", isValidFormat);
                validationResult.put("validationMessage", 
                    isValidFormat ? "File appears to be a valid image for CSL processing" : 
                                  "File does not appear to be a valid image");
            } else {
                validationResult.put("isValidCSLCandidate", false);
                validationResult.put("validationMessage", "Empty file provided");
            }
            
            return ResponseEntity.ok(ApiResponse.success("CSL certificate validation completed", validationResult));
            
        } catch (Exception e) {
            System.err.println("❌ CSL certificate validation error: " + e.getMessage());
            validationResult.put("error", e.getMessage());
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("CSL certificate validation failed", validationResult));
        }
    }
    
    /**
     * Get Tesseract OCR status for CSL processing diagnostics
     */
    @GetMapping("/certificate-ocr-status")
    @Operation(summary = "Get OCR status for CSL processing", 
               description = "Check the status of Tesseract OCR engine for CSL certificate processing")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOcrStatus() {
        try {
            System.out.println("🔍 CSL OCR status check requested");
            Map<String, Object> status = gemCertificateService.getTesseractStatus();
            
            return ResponseEntity.ok(ApiResponse.success("CSL OCR status retrieved", status));
            
        } catch (Exception e) {
            System.err.println("❌ CSL OCR status check error: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get CSL OCR status: " + e.getMessage()));
        }
    }
    
    /**
     * Get all gem listings with pagination and filtering
     */
    @GetMapping("/get-all-listings")
    @Operation(summary = "Get all gem listings", 
               description = "Retrieve all gem listings with optional pagination and filtering")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllGemListings(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "isCertified", required = false) Boolean isCertified,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        System.out.println("💎 Get all gem listings request received");
        System.out.println("📄 Page: " + page + ", Size: " + size);
        System.out.println("🔍 Filters - Status: " + status + ", Certified: " + isCertified + ", UserId: " + userId);
        
        try {
            // Call service to get listings with pagination
            ApiResponse<Map<String, Object>> serviceResponse = 
                gemCertificateService.getAllGemListings(page, size, status, isCertified, userId);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved gem listings");
                Map<String, Object> data = serviceResponse.getData();
                System.out.println("📊 Total listings: " + data.get("totalElements"));
                System.out.println("📄 Total pages: " + data.get("totalPages"));
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get all listings error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve gem listings: " + e.getMessage()));
        }
    }
    
    /**
     * Get gem listings by user ID (for seller dashboard)
     */
    @GetMapping("/get-user-listings/{userId}")
    @Operation(summary = "Get gem listings by user", 
               description = "Retrieve gem listings for a specific user/seller")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserGemListings(
            @PathVariable Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status) {
        
        System.out.println("👤 Get user gem listings request for userId: " + userId);
        System.out.println("📄 Page: " + page + ", Size: " + size + ", Status: " + status);
        
        try {
            // Call service to get user-specific listings
            ApiResponse<Map<String, Object>> serviceResponse = 
                gemCertificateService.getAllGemListings(page, size, status, null, userId);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved user gem listings");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get user listings error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve user gem listings: " + e.getMessage()));
        }
    }
    
    /**
     * Save gem listing data with images submitted by seller
     */
    @PostMapping(value = "/list-gem-data", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save gem listing data with images", 
               description = "Save gem listing data and images submitted by seller (both certified and non-certified gems)")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveGemListingData(
            @RequestParam("gemListingData") String gemListingDataJson,
            @RequestParam(value = "gemImages", required = false) MultipartFile[] gemImages) {
        
        System.out.println("💎 Gem listing data with images save request received");
        System.out.println("📁 Number of images: " + (gemImages != null ? gemImages.length : 0));
        
        try {
            // Parse JSON data
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            GemListingDataDto gemListingData = objectMapper.readValue(gemListingDataJson, GemListingDataDto.class);
            
            System.out.println("👤 User: " + gemListingData.getUserName() + " (ID: " + gemListingData.getUserId() + ")");
            System.out.println("🔖 Certification Status: " + (gemListingData.getIsCertified() ? "Certified" : "Non-Certified"));
            System.out.println("💎 Gem Details: " + gemListingData.getGemName() + " - " + gemListingData.getVariety());
            
            // Validate required data
            if (!gemListingData.isValidForSave()) {
                System.err.println("❌ Invalid gem listing data provided");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid gem listing data. Please check all required fields."));
            }
            
            // Validate user role
            if (!"SELLER".equals(gemListingData.getUserRole())) {
                System.err.println("❌ Invalid user role: " + gemListingData.getUserRole());
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only sellers can create gem listings"));
            }
            
            // No additional validation for non-certified stones
            // Non-certified stones don't require any certificate information
            
            // Additional validation for certified stones
            if (gemListingData.isCertifiedStone()) {
                if (gemListingData.getCertificateNumber() == null || gemListingData.getCertificateNumber().trim().isEmpty()) {
                    System.err.println("❌ Certificate number required for certified stones");
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Certificate number is required for certified stones"));
                }
            }
            
            // Call service to save to database with images
            ApiResponse<Map<String, Object>> serviceResponse = 
                gemCertificateService.saveGemListingData(gemListingData, gemImages);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Gem listing data and images saved successfully via service");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service save failed: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            System.err.println("❌ JSON parsing error: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid JSON data format: " + e.getMessage()));
            
        } catch (Exception e) {
            System.err.println("❌ Gem listing data save error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to save gem listing data: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a gem listing by ID
     */
    @DeleteMapping("/delete-listing/{listingId}")
    @Operation(summary = "Delete gem listing", 
               description = "Delete a gem listing from the database by its ID")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.DELETE})
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteGemListing(
            @PathVariable String listingId) {
        
        System.out.println("🗑️ Delete gem listing request received for ID: " + listingId);
        
        try {
            // Call service to delete the listing
            ApiResponse<Map<String, Object>> deleteResult = gemCertificateService.deleteGemListing(listingId);
            
            if (deleteResult.isSuccess()) {
                System.out.println("✅ Listing deleted successfully: " + listingId);
                return ResponseEntity.ok(deleteResult);
            } else {
                System.err.println("❌ Failed to delete listing: " + deleteResult.getMessage());
                return ResponseEntity.badRequest()
                    .body(deleteResult);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error deleting listing: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to delete listing: " + e.getMessage()));
        }
    }

    /**
     * Update a gem listing by ID
     */
    @PutMapping("/update-listing/{listingId}")
    @Operation(summary = "Update gem listing", 
               description = "Update an existing gem listing in the database")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.PUT})
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateGemListing(
            @PathVariable String listingId,
            @RequestBody Map<String, Object> updateData) {
        
        System.out.println("✏️ Update gem listing request received for ID: " + listingId);
        System.out.println("📝 Update data: " + updateData);
        
        try {
            // Call service to update the listing
            ApiResponse<String> updateResult = gemCertificateService.updateGemListing(listingId, updateData);
            
            if (updateResult.isSuccess()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Listing updated successfully");
                response.put("updatedListingId", listingId);
                
                System.out.println("✅ Listing updated successfully: " + listingId);
                return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", response));
            } else {
                System.err.println("❌ Failed to update listing: " + updateResult.getMessage());
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(updateResult.getMessage()));
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error updating listing: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to update listing: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
    
    /**
     * Health check for CSL certificate processing service
     */
    @GetMapping("/certificate-health")
    @Operation(summary = "CSL certificate service health check", 
               description = "Check if the CSL certificate processing service is running")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("service", "CSL Gem Certificate Processing Service");
        healthInfo.put("certificateType", "CSL (Colored Stone Laboratory)");
        healthInfo.put("status", "Running");
        healthInfo.put("timestamp", System.currentTimeMillis());
        healthInfo.put("version", "1.0.0");
        healthInfo.put("supportedFormats", new String[]{"JPG", "JPEG", "PNG", "TIFF"});
        healthInfo.put("maxFileSize", "10MB");
        
        // Include OCR status in health check
        try {
            Map<String, Object> ocrStatus = gemCertificateService.getTesseractStatus();
            healthInfo.put("ocrEngine", ocrStatus);
        } catch (Exception e) {
            healthInfo.put("ocrEngine", "Error: " + e.getMessage());
        }
        
        System.out.println("💎 CSL certificate service health check - Status: Running");
        return ResponseEntity.ok(ApiResponse.success("CSL certificate processing service is running", healthInfo));
    }
    
    /**
     * Test endpoint for CSL certificate processing with detailed logging
     */
    @PostMapping(value = "/test-certificate-extraction", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Test CSL certificate extraction", 
               description = "Test CSL certificate data extraction with detailed logging and diagnostics")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<Map<String, Object>>> testCertificateExtraction(
            @RequestParam("certificate") MultipartFile certificateImage) {
        
        System.out.println("🧪 CSL certificate extraction test request received");
        
        Map<String, Object> testResult = new HashMap<>();
        testResult.put("testStartTime", System.currentTimeMillis());
        testResult.put("certificateType", "CSL (Colored Stone Laboratory)");
        
        try {
            // Basic validations
            testResult.put("fileValidation", validateFileForTest(certificateImage));
            
            // Process the CSL certificate
            ApiResponse<GemCertificateDataDto> extractionResult = 
                gemCertificateService.extractCertificateData(certificateImage);
            
            testResult.put("extractionSuccess", extractionResult.isSuccess());
            testResult.put("extractionMessage", extractionResult.getMessage());
            testResult.put("extractedData", extractionResult.getData());
            
            // Additional CSL-specific test information
            if (extractionResult.getData() != null) {
                GemCertificateDataDto data = extractionResult.getData();
                testResult.put("cslMemoNo", data.getCslMemoNo());
                testResult.put("giaAlumniStatus", data.isGiaAlumniMember());
                testResult.put("treatment", data.getTreatment());
                testResult.put("isHeated", data.isHeated());
                testResult.put("isUnheated", data.isUnheated());
                testResult.put("isNaturalStone", data.isNaturalStone());
            }
            
            // OCR status
            testResult.put("ocrStatus", gemCertificateService.getTesseractStatus());
            
            testResult.put("testEndTime", System.currentTimeMillis());
            testResult.put("testDuration", 
                (Long) testResult.get("testEndTime") - (Long) testResult.get("testStartTime"));
            
            System.out.println("✅ CSL certificate extraction test completed");
            return ResponseEntity.ok(ApiResponse.success("CSL certificate extraction test completed", testResult));
            
        } catch (Exception e) {
            System.err.println("❌ CSL certificate extraction test error: " + e.getMessage());
            testResult.put("error", e.getMessage());
            testResult.put("testEndTime", System.currentTimeMillis());
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("CSL certificate extraction test failed", testResult));
        }
    }
    
    /**
     * Validate file for testing purposes
     */
    private Map<String, Object> validateFileForTest(MultipartFile file) {
        Map<String, Object> validation = new HashMap<>();
        validation.put("fileName", file.getOriginalFilename());
        validation.put("fileSize", file.getSize());
        validation.put("contentType", file.getContentType());
        validation.put("isEmpty", file.isEmpty());
        validation.put("sizeValidation", file.getSize() <= 10 * 1024 * 1024 ? "PASS" : "FAIL");
        validation.put("typeValidation", 
            file.getContentType() != null && file.getContentType().startsWith("image/") ? "PASS" : "FAIL");
        
        return validation;
    }
}
