package com.gemnet.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

/**
 * Request DTO for gem certificate data extraction
 */
public class GemCertificateRequestDto {
    
    @NotNull(message = "Certificate image is required")
    private MultipartFile certificate;
    
    private String userId; // Optional: to track who uploaded the certificate
    
    private String certificateType; // Optional: type of certificate (e.g., "gem_identification", "origin_report")
    
    private boolean enableDetailedLogging = false; // Optional: for debugging purposes
    
    private String expectedAuthority; // Optional: expected issuing authority for validation
    
    // Constructors
    public GemCertificateRequestDto() {
    }
    
    public GemCertificateRequestDto(MultipartFile certificate) {
        this.certificate = certificate;
    }
    
    public GemCertificateRequestDto(MultipartFile certificate, String userId) {
        this.certificate = certificate;
        this.userId = userId;
    }
    
    // Getters and Setters
    public MultipartFile getCertificate() {
        return certificate;
    }
    
    public void setCertificate(MultipartFile certificate) {
        this.certificate = certificate;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getCertificateType() {
        return certificateType;
    }
    
    public void setCertificateType(String certificateType) {
        this.certificateType = certificateType;
    }
    
    public boolean isEnableDetailedLogging() {
        return enableDetailedLogging;
    }
    
    public void setEnableDetailedLogging(boolean enableDetailedLogging) {
        this.enableDetailedLogging = enableDetailedLogging;
    }
    
    public String getExpectedAuthority() {
        return expectedAuthority;
    }
    
    public void setExpectedAuthority(String expectedAuthority) {
        this.expectedAuthority = expectedAuthority;
    }
    
    // Helper methods
    public boolean hasValidFile() {
        return certificate != null && !certificate.isEmpty();
    }
    
    public String getOriginalFilename() {
        return certificate != null ? certificate.getOriginalFilename() : null;
    }
    
    public long getFileSize() {
        return certificate != null ? certificate.getSize() : 0;
    }
    
    public String getContentType() {
        return certificate != null ? certificate.getContentType() : null;
    }
    
    @Override
    public String toString() {
        return "GemCertificateRequestDto{" +
                "certificate=" + (certificate != null ? certificate.getOriginalFilename() : "null") +
                ", userId='" + userId + '\'' +
                ", certificateType='" + certificateType + '\'' +
                ", enableDetailedLogging=" + enableDetailedLogging +
                ", expectedAuthority='" + expectedAuthority + '\'' +
                '}';
    }
}
