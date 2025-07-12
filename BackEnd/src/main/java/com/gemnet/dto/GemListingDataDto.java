package com.gemnet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for saving gem listing data submitted by sellers
 */
public class GemListingDataDto {
    
    // User Information
    @JsonProperty("userId")
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @JsonProperty("userName")
    @NotBlank(message = "User name is required")
    private String userName;
    
    @JsonProperty("userRole")
    private String userRole = "SELLER"; // Default to SELLER
    
    // Certification Status
    @JsonProperty("isCertified")
    @NotNull(message = "Certification status is required")
    private Boolean isCertified; // true for certified, false for non-certified
    
    // CSL Certificate Information (ONLY for certified stones)
    // These fields should be null for non-certified gemstones
    @JsonProperty("cslMemoNo")
    private String cslMemoNo;
    
    @JsonProperty("issueDate")
    private String issueDate;
    
    @JsonProperty("authority")
    private String authority; // CSL (Colored Stone Laboratory)
    
    @JsonProperty("giaAlumniMember")
    private Boolean giaAlumniMember;
    
    // Gem Identification Details (CSL Format)
    @JsonProperty("color")
    @NotBlank(message = "Color is required")
    private String color;
    
    @JsonProperty("shape")
    @NotBlank(message = "Shape is required")
    private String shape;
    
    @JsonProperty("weight")
    @NotBlank(message = "Weight is required")
    private String weight;
    
    @JsonProperty("measurements")
    @NotBlank(message = "Measurements are required")
    private String measurements;
    
    @JsonProperty("variety")
    @NotBlank(message = "Variety is required")
    private String variety; // Usually highlighted in red on CSL certificates
    
    @JsonProperty("species")
    @NotBlank(message = "Species is required")
    private String species;
    
    @JsonProperty("treatment")
    @NotBlank(message = "Treatment is required")
    private String treatment; // "Heated", "Unheated", etc.
    
    // Additional Information
    @JsonProperty("comments")
    private String comments;
    
    // Listing Specific Information
    @JsonProperty("price")
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @JsonProperty("currency")
    private String currency = "LKR"; // Default to LKR
    
    @JsonProperty("gemName")
    @NotBlank(message = "Gem name is required")
    private String gemName;
    
    @JsonProperty("category")
    @NotBlank(message = "Category is required")
    private String category;
    
    @JsonProperty("description")
    private String description;
    
    // For certified gemstones - additional fields
    @JsonProperty("certificateNumber")
    private String certificateNumber; // For certified stones
    
    @JsonProperty("certifyingAuthority")
    private String certifyingAuthority; // For certified stones (GIA, SSEF, etc.)
    
    @JsonProperty("clarity")
    private String clarity; // For certified stones
    
    @JsonProperty("cut")
    private String cut; // For certified stones
    
    @JsonProperty("origin")
    private String origin; // For certified stones
    
    // Metadata
    @JsonProperty("listingStatus")
    private String listingStatus = "PENDING"; // PENDING, APPROVED, REJECTED, ACTIVE, SOLD
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
    
    // Constructors
    public GemListingDataDto() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public GemListingDataDto(Long userId, String userName, Boolean isCertified) {
        this();
        this.userId = userId;
        this.userName = userName;
        this.isCertified = isCertified;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getUserRole() {
        return userRole;
    }
    
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
    
    public Boolean getIsCertified() {
        return isCertified;
    }
    
    public void setIsCertified(Boolean isCertified) {
        this.isCertified = isCertified;
    }
    
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
    
    public Boolean getGiaAlumniMember() {
        return giaAlumniMember;
    }
    
    public void setGiaAlumniMember(Boolean giaAlumniMember) {
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
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getGemName() {
        return gemName;
    }
    
    public void setGemName(String gemName) {
        this.gemName = gemName;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCertificateNumber() {
        return certificateNumber;
    }
    
    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }
    
    public String getCertifyingAuthority() {
        return certifyingAuthority;
    }
    
    public void setCertifyingAuthority(String certifyingAuthority) {
        this.certifyingAuthority = certifyingAuthority;
    }
    
    public String getClarity() {
        return clarity;
    }
    
    public void setClarity(String clarity) {
        this.clarity = clarity;
    }
    
    public String getCut() {
        return cut;
    }
    
    public void setCut(String cut) {
        this.cut = cut;
    }
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getListingStatus() {
        return listingStatus;
    }
    
    public void setListingStatus(String listingStatus) {
        this.listingStatus = listingStatus;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public boolean isValidForSave() {
        return userId != null && userName != null && !userName.trim().isEmpty() &&
               isCertified != null && color != null && shape != null &&
               weight != null && variety != null && species != null &&
               treatment != null && price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isNonCertifiedStone() {
        return Boolean.FALSE.equals(isCertified);
    }
    
    public boolean isCertifiedStone() {
        return Boolean.TRUE.equals(isCertified);
    }
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
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
        return "GemListingDataDto{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", userRole='" + userRole + '\'' +
                ", isCertified=" + isCertified +
                ", cslMemoNo='" + cslMemoNo + '\'' +
                ", variety='" + variety + '\'' +
                ", species='" + species + '\'' +
                ", color='" + color + '\'' +
                ", weight='" + weight + '\'' +
                ", treatment='" + treatment + '\'' +
                ", price=" + price +
                ", currency='" + currency + '\'' +
                ", gemName='" + gemName + '\'' +
                ", category='" + category + '\'' +
                ", listingStatus='" + listingStatus + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
