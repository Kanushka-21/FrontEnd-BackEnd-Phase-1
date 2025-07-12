package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "gem_listings")
public class GemListing {
    
    @Id
    private String id;
    
    // User Information
    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;
    
    @NotBlank(message = "User name is required")
    private String userName;
    
    @NotBlank(message = "User role is required")
    private String userRole = "SELLER";
    
    // Certification Status
    @NotNull(message = "Certification status is required")
    private Boolean isCertified;
    
    // CSL Certificate Information (ONLY for certified stones)
    // These fields should be null for non-certified gemstones
    private String cslMemoNo;
    private String issueDate;
    private String authority;
    private Boolean giaAlumniMember;
    
    // Gem Identification Details (CSL Format)
    @NotBlank(message = "Color is required")
    private String color;
    
    @NotBlank(message = "Shape is required")
    private String shape;
    
    @NotBlank(message = "Weight is required")
    private String weight;
    
    @NotBlank(message = "Measurements are required")
    private String measurements;
    
    @NotBlank(message = "Variety is required")
    private String variety;
    
    @NotBlank(message = "Species is required")
    private String species;
    
    @NotBlank(message = "Treatment is required")
    private String treatment;
    
    // Additional Information
    private String comments;
    
    // Listing Specific Information
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    private String currency = "LKR";
    
    @NotBlank(message = "Gem name is required")
    @Indexed
    private String gemName;
    
    @NotBlank(message = "Category is required")
    @Indexed
    private String category;
    
    private String description;
    
    // For certified gemstones - additional fields
    private String certificateNumber;
    private String certifyingAuthority;
    private String clarity;
    private String cut;
    private String origin;
    
    // Images
    private List<GemImage> images;
    private String primaryImageUrl;
    
    // Metadata
    @Indexed
    private String listingStatus = "PENDING"; // PENDING, APPROVED, REJECTED, ACTIVE, SOLD
    
    @Indexed
    private Boolean isActive = true;
    
    // Analytics
    private Integer views = 0;
    private Integer favorites = 0;
    private Integer inquiries = 0;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Constructors
    public GemListing() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public GemListing(String userId, String userName, Boolean isCertified) {
        this();
        this.userId = userId;
        this.userName = userName;
        this.isCertified = isCertified;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
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
    
    public List<GemImage> getImages() {
        return images;
    }
    
    public void setImages(List<GemImage> images) {
        this.images = images;
    }
    
    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }
    
    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }
    
    public String getListingStatus() {
        return listingStatus;
    }
    
    public void setListingStatus(String listingStatus) {
        this.listingStatus = listingStatus;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getViews() {
        return views;
    }
    
    public void setViews(Integer views) {
        this.views = views;
    }
    
    public Integer getFavorites() {
        return favorites;
    }
    
    public void setFavorites(Integer favorites) {
        this.favorites = favorites;
    }
    
    public Integer getInquiries() {
        return inquiries;
    }
    
    public void setInquiries(Integer inquiries) {
        this.inquiries = inquiries;
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
    
    public void incrementViews() {
        this.views = (this.views == null) ? 1 : this.views + 1;
        updateTimestamp();
    }
    
    public void incrementFavorites() {
        this.favorites = (this.favorites == null) ? 1 : this.favorites + 1;
        updateTimestamp();
    }
    
    public void incrementInquiries() {
        this.inquiries = (this.inquiries == null) ? 1 : this.inquiries + 1;
        updateTimestamp();
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
        return "GemListing{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", userName='" + userName + '\'' +
                ", gemName='" + gemName + '\'' +
                ", variety='" + variety + '\'' +
                ", price=" + price +
                ", currency='" + currency + '\'' +
                ", isCertified=" + isCertified +
                ", listingStatus='" + listingStatus + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
