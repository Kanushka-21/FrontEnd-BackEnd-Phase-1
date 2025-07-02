package com.gemnet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for gem certificate data extracted from certificate images
 */
public class GemCertificateDataDto {
    
    // Basic Certificate Information
    @JsonProperty("reportNumber")
    private String reportNumber;
    
    @JsonProperty("issueDate")
    private String issueDate;
    
    @JsonProperty("authority")
    private String authority;
    
    // Gem Identification Details
    @JsonProperty("species")
    private String species;
    
    @JsonProperty("variety")
    private String variety;
    
    @JsonProperty("weight")
    private String weight;
    
    @JsonProperty("dimensions")
    private String dimensions;
    
    @JsonProperty("colour")
    private String colour;
    
    @JsonProperty("transparency")
    private String transparency;
    
    @JsonProperty("cut")
    private String cut;
    
    @JsonProperty("shape")
    private String shape;
    
    // Test Results
    @JsonProperty("refractiveIndex")
    private String refractiveIndex;
    
    @JsonProperty("specificGravity")
    private String specificGravity;
    
    @JsonProperty("polariscopeTest")
    private String polariscopeTest;
    
    @JsonProperty("absorptionSpectrum")
    private String absorptionSpectrum;
    
    @JsonProperty("microscopeExamination")
    private String microscopeExamination;
    
    @JsonProperty("fluorescenceLongWave")
    private String fluorescenceLongWave;
    
    @JsonProperty("fluorescenceShortWave")
    private String fluorescenceShortWave;
    
    @JsonProperty("pleochroism")
    private String pleochroism;
    
    // Additional Information
    @JsonProperty("comments")
    private String comments;
    
    @JsonProperty("gemologists")
    private String gemologists;
    
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
    
    public GemCertificateDataDto(String reportNumber, String authority) {
        this();
        this.reportNumber = reportNumber;
        this.authority = authority;
    }
    
    // Getters and Setters
    public String getReportNumber() {
        return reportNumber;
    }
    
    public void setReportNumber(String reportNumber) {
        this.reportNumber = reportNumber;
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
    
    public String getSpecies() {
        return species;
    }
    
    public void setSpecies(String species) {
        this.species = species;
    }
    
    public String getVariety() {
        return variety;
    }
    
    public void setVariety(String variety) {
        this.variety = variety;
    }
    
    public String getWeight() {
        return weight;
    }
    
    public void setWeight(String weight) {
        this.weight = weight;
    }
    
    public String getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
    
    public String getColour() {
        return colour;
    }
    
    public void setColour(String colour) {
        this.colour = colour;
    }
    
    public String getTransparency() {
        return transparency;
    }
    
    public void setTransparency(String transparency) {
        this.transparency = transparency;
    }
    
    public String getCut() {
        return cut;
    }
    
    public void setCut(String cut) {
        this.cut = cut;
    }
    
    public String getShape() {
        return shape;
    }
    
    public void setShape(String shape) {
        this.shape = shape;
    }
    
    public String getRefractiveIndex() {
        return refractiveIndex;
    }
    
    public void setRefractiveIndex(String refractiveIndex) {
        this.refractiveIndex = refractiveIndex;
    }
    
    public String getSpecificGravity() {
        return specificGravity;
    }
    
    public void setSpecificGravity(String specificGravity) {
        this.specificGravity = specificGravity;
    }
    
    public String getPolariscopeTest() {
        return polariscopeTest;
    }
    
    public void setPolariscopeTest(String polariscopeTest) {
        this.polariscopeTest = polariscopeTest;
    }
    
    public String getAbsorptionSpectrum() {
        return absorptionSpectrum;
    }
    
    public void setAbsorptionSpectrum(String absorptionSpectrum) {
        this.absorptionSpectrum = absorptionSpectrum;
    }
    
    public String getMicroscopeExamination() {
        return microscopeExamination;
    }
    
    public void setMicroscopeExamination(String microscopeExamination) {
        this.microscopeExamination = microscopeExamination;
    }
    
    public String getFluorescenceLongWave() {
        return fluorescenceLongWave;
    }
    
    public void setFluorescenceLongWave(String fluorescenceLongWave) {
        this.fluorescenceLongWave = fluorescenceLongWave;
    }
    
    public String getFluorescenceShortWave() {
        return fluorescenceShortWave;
    }
    
    public void setFluorescenceShortWave(String fluorescenceShortWave) {
        this.fluorescenceShortWave = fluorescenceShortWave;
    }
    
    public String getPleochroism() {
        return pleochroism;
    }
    
    public void setPleochroism(String pleochroism) {
        this.pleochroism = pleochroism;
    }
    
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public String getGemologists() {
        return gemologists;
    }
    
    public void setGemologists(String gemologists) {
        this.gemologists = gemologists;
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
        return reportNumber != null && !reportNumber.trim().isEmpty() &&
               (species != null && !species.trim().isEmpty() || 
                variety != null && !variety.trim().isEmpty());
    }
    
    public void addAdditionalField(String key, String value) {
        if (additionalFields == null) {
            additionalFields = new java.util.HashMap<>();
        }
        additionalFields.put(key, value);
    }
    
    @Override
    public String toString() {
        return "GemCertificateDataDto{" +
                "reportNumber='" + reportNumber + '\'' +
                ", issueDate='" + issueDate + '\'' +
                ", authority='" + authority + '\'' +
                ", species='" + species + '\'' +
                ", variety='" + variety + '\'' +
                ", weight='" + weight + '\'' +
                ", colour='" + colour + '\'' +
                ", extractedAt=" + extractedAt +
                ", extractionMethod='" + extractionMethod + '\'' +
                '}';
    }
}
