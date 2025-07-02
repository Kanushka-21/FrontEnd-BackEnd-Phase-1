package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.GemCertificateDataDto;
import com.gemnet.service.GemCertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling gem certificate processing and data extraction
 */
@RestController
@RequestMapping("/api/certificate")
@Tag(name = "Gem Certificate", description = "Gem certificate processing and data extraction APIs")
@CrossOrigin(origins = "*")
public class GemCertificateController {
    
    @Autowired
    private GemCertificateService gemCertificateService;
    
    /**
     * Extract data from gem certificate image
     */
    @PostMapping(value = "/extract-certificate-data", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Extract certificate data", 
               description = "Upload a gem certificate image and extract structured data using OCR")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<GemCertificateDataDto>> extractCertificateData(
            @RequestParam("certificate") MultipartFile certificateImage) {
        
        System.out.println("💎 Certificate data extraction request received");
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
            
            // Process the certificate
            ApiResponse<GemCertificateDataDto> response = 
                gemCertificateService.extractCertificateData(certificateImage);
            
            if (response.isSuccess()) {
                System.out.println("✅ Certificate data extraction successful");
                System.out.println("📋 Extracted report number: " + 
                    (response.getData() != null ? response.getData().getReportNumber() : "N/A"));
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Certificate data extraction failed: " + response.getMessage());
                return ResponseEntity.ok(response); // Return 200 with error details in response
            }
            
        } catch (Exception e) {
            System.err.println("❌ Certificate extraction error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Certificate extraction failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get Tesseract OCR status for diagnostics
     */
    @GetMapping("/certificate-ocr-status")
    @Operation(summary = "Get OCR status", 
               description = "Check the status of Tesseract OCR engine for certificate processing")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOcrStatus() {
        try {
            System.out.println("🔍 OCR status check requested");
            Map<String, Object> status = gemCertificateService.getTesseractStatus();
            
            return ResponseEntity.ok(ApiResponse.success("OCR status retrieved", status));
            
        } catch (Exception e) {
            System.err.println("❌ OCR status check error: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get OCR status: " + e.getMessage()));
        }
    }
    
    /**
     * Health check for certificate processing service
     */
    @GetMapping("/certificate-health")
    @Operation(summary = "Certificate service health check", 
               description = "Check if the certificate processing service is running")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("service", "Gem Certificate Processing Service");
        healthInfo.put("status", "Running");
        healthInfo.put("timestamp", System.currentTimeMillis());
        healthInfo.put("version", "1.0.0");
        
        // Include OCR status in health check
        try {
            Map<String, Object> ocrStatus = gemCertificateService.getTesseractStatus();
            healthInfo.put("ocrEngine", ocrStatus);
        } catch (Exception e) {
            healthInfo.put("ocrEngine", "Error: " + e.getMessage());
        }
        
        System.out.println("💎 Certificate service health check - Status: Running");
        return ResponseEntity.ok(ApiResponse.success("Certificate processing service is running", healthInfo));
    }
    
    /**
     * Test endpoint for certificate processing
     */
    @PostMapping(value = "/test-certificate-extraction", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Test certificate extraction", 
               description = "Test certificate data extraction with detailed logging")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.POST})
    public ResponseEntity<ApiResponse<Map<String, Object>>> testCertificateExtraction(
            @RequestParam("certificate") MultipartFile certificateImage) {
        
        System.out.println("🧪 Certificate extraction test request received");
        
        Map<String, Object> testResult = new HashMap<>();
        testResult.put("testStartTime", System.currentTimeMillis());
        
        try {
            // Basic validations
            testResult.put("fileValidation", validateFileForTest(certificateImage));
            
            // Process the certificate
            ApiResponse<GemCertificateDataDto> extractionResult = 
                gemCertificateService.extractCertificateData(certificateImage);
            
            testResult.put("extractionSuccess", extractionResult.isSuccess());
            testResult.put("extractionMessage", extractionResult.getMessage());
            testResult.put("extractedData", extractionResult.getData());
            
            // OCR status
            testResult.put("ocrStatus", gemCertificateService.getTesseractStatus());
            
            testResult.put("testEndTime", System.currentTimeMillis());
            testResult.put("testDuration", 
                (Long) testResult.get("testEndTime") - (Long) testResult.get("testStartTime"));
            
            System.out.println("✅ Certificate extraction test completed");
            return ResponseEntity.ok(ApiResponse.success("Certificate extraction test completed", testResult));
            
        } catch (Exception e) {
            System.err.println("❌ Certificate extraction test error: " + e.getMessage());
            testResult.put("error", e.getMessage());
            testResult.put("testEndTime", System.currentTimeMillis());
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Certificate extraction test failed", testResult));
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
