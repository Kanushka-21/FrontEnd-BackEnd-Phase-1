package com.gemnet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for CSL (Colored Stone Laboratory) certificate data extracted from certificate images
 */
public class GemCertificateDataDto {
    
    // Basic Certificate Information
    @JsonProperty("cslMemoNo")
    private String cslMemoNo; // Changed from reportNumber to match CSL format
    
    @JsonProperty("issueDate")
    private String issueDate;
    
    @JsonProperty("authority")
    private String authority; // CSL (Colored Stone Laboratory)
    
    @JsonProperty("giaAlumniMember")
    private boolean giaAlumniMember; // New field for GIA Alumni status
    
    // Gem Identification Details (CSL Format)
    @JsonProperty("color")
    private String color;
    
    @JsonProperty("shape")
    private String shape;
    
    @JsonProperty("weight")
    private String weight;
    
    @JsonProperty("measurements")
    private String measurements;
    
    @JsonProperty("variety")
    private String variety; // Usually highlighted in red on CSL certificates
    
    @JsonProperty("species")
    private String species;
    
    @JsonProperty("treatment")
    private String treatment; // New field: "Heated", "Unheated", etc.
    
    // Additional Information
    @JsonProperty("comments")
    private String comments;
    
    @JsonProperty("qrCode")
    private String qrCode; // CSL certificates have QR codes
    
    // Extraction Metadata
    @JsonProperty("extractedAt")
    private LocalDateTime extractedAt;
    
    @JsonProperty("extractionMethod")
    private String extractionMethod;
    
    @JsonProperty("confidence")
    private Double confidence;
    
    @JsonProperty("rawOcrText")
    private String rawOcrText;
    
    @JsonProperty("additionalFields")
    private Map<String, String> additionalFields;
    
    // Constructors
    public GemCertificateDataDto() {
        this.extractedAt = LocalDateTime.now();
    }
    
    public GemCertificateDataDto(String cslMemoNo, String authority) {
        this();
        this.cslMemoNo = cslMemoNo;
        this.authority = authority;
    }
    
    // Getters and Setters
    public String getCslMemoNo() {
        return cslMemoNo;
    }
    
    public void setCslMemoNo(String cslMemoNo) {
        this.cslMemoNo = cslMemoNo;
    }
    
    public String getIssueDate() {
        return issueDate;
    }
    
    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }
    
    public String getAuthority() {
        return authority;
    }
    
    public void setAuthority(String authority) {
        this.authority = authority;
    }
    
    public boolean isGiaAlumniMember() {
        return giaAlumniMember;
    }
    
    public void setGiaAlumniMember(boolean giaAlumniMember) {
        this.giaAlumniMember = giaAlumniMember;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getShape() {
        return shape;
    }
    
    public void setShape(String shape) {
        this.shape = shape;
    }
    
    public String getWeight() {
        return weight;
    }
    
    public void setWeight(String weight) {
        this.weight = weight;
    }
    
    public String getMeasurements() {
        return measurements;
    }
    
    public void setMeasurements(String measurements) {
        this.measurements = measurements;
    }
    
    public String getVariety() {
        return variety;
    }
    
    public void setVariety(String variety) {
        this.variety = variety;
    }
    
    public String getSpecies() {
        return species;
    }
    
    public void setSpecies(String species) {
        this.species = species;
    }
    
    public String getTreatment() {
        return treatment;
    }
    
    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }
    
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
    
    public LocalDateTime getExtractedAt() {
        return extractedAt;
    }
    
    public void setExtractedAt(LocalDateTime extractedAt) {
        this.extractedAt = extractedAt;
    }
    
    public String getExtractionMethod() {
        return extractionMethod;
    }
    
    public void setExtractionMethod(String extractionMethod) {
        this.extractionMethod = extractionMethod;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public String getRawOcrText() {
        return rawOcrText;
    }
    
    public void setRawOcrText(String rawOcrText) {
        this.rawOcrText = rawOcrText;
    }
    
    public Map<String, String> getAdditionalFields() {
        return additionalFields;
    }
    
    public void setAdditionalFields(Map<String, String> additionalFields) {
        this.additionalFields = additionalFields;
    }
    
    // Helper methods
    public boolean hasValidData() {
        return cslMemoNo != null && !cslMemoNo.trim().isEmpty() &&
               (variety != null && !variety.trim().isEmpty() || 
                species != null && !species.trim().isEmpty());
    }
    
    public void addAdditionalField(String key, String value) {
        if (additionalFields == null) {
            additionalFields = new java.util.HashMap<>();
        }
        additionalFields.put(key, value);
    }
    
    // CSL-specific helper methods
    public boolean isHeated() {
        return treatment != null && treatment.toLowerCase().contains("heated") && 
               !treatment.toLowerCase().contains("unheated");
    }
    
    public boolean isUnheated() {
        return treatment != null && treatment.toLowerCase().contains("unheated");
    }
    
    public boolean isNaturalStone() {
        return (variety != null && variety.toLowerCase().contains("natural")) ||
               (species != null && species.toLowerCase().contains("natural"));
    }
    
    @Override
    public String toString() {
        return "GemCertificateDataDto{" +
                "cslMemoNo='" + cslMemoNo + '\'' +
                ", issueDate='" + issueDate + '\'' +
                ", authority='" + authority + '\'' +
                ", variety='" + variety + '\'' +
                ", species='" + species + '\'' +
                ", color='" + color + '\'' +
                ", weight='" + weight + '\'' +
                ", treatment='" + treatment + '\'' +
                ", giaAlumniMember=" + giaAlumniMember +
                ", confidence=" + confidence +
                ", extractedAt=" + extractedAt +
                '}';
    }
}
