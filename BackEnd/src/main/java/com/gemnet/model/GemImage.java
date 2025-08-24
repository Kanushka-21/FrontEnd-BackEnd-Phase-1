package com.gemnet.model;

import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * Embedded document for gem images within GemListing
 */
public class GemImage {
    
    private String imageId;
    private String originalName;
    private String contentType;
    private Long size;
    private String imageUrl;
    private String thumbnailUrl;
    private Boolean isPrimary = false;
    private Integer displayOrder;
    private String description;
    
    // New field to distinguish between gem images and certificate images
    private String imageType; // "GEMSTONE" or "CERTIFICATE"
    
    @CreatedDate
    private LocalDateTime uploadedAt;
    
    // Constructors
    public GemImage() {
        this.uploadedAt = LocalDateTime.now();
    }
    
    public GemImage(String imageId, String originalName, String contentType, Long size, String imageUrl) {
        this();
        this.imageId = imageId;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.imageUrl = imageUrl;
        this.imageType = "GEMSTONE"; // Default to gemstone image
    }
    
    public GemImage(String imageId, String originalName, String contentType, Long size, String imageUrl, String imageType) {
        this();
        this.imageId = imageId;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.imageUrl = imageUrl;
        this.imageType = imageType;
    }
    
    // Getters and Setters
    public String getImageId() {
        return imageId;
    }
    
    public void setImageId(String imageId) {
        this.imageId = imageId;
    }
    
    public String getOriginalName() {
        return originalName;
    }
    
    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public Long getSize() {
        return size;
    }
    
    public void setSize(Long size) {
        this.size = size;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public Boolean getIsPrimary() {
        return isPrimary;
    }
    
    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
    
    public String getImageType() {
        return imageType;
    }
    
    public void setImageType(String imageType) {
        this.imageType = imageType;
    }
    
    // Helper methods
    public boolean isGemstoneImage() {
        return "GEMSTONE".equals(imageType);
    }
    
    public boolean isCertificateImage() {
        return "CERTIFICATE".equals(imageType);
    }
    
    @Override
    public String toString() {
        return "GemImage{" +
                "imageId='" + imageId + '\'' +
                ", originalName='" + originalName + '\'' +
                ", contentType='" + contentType + '\'' +
                ", size=" + size +
                ", imageUrl='" + imageUrl + '\'' +
                ", imageType='" + imageType + '\'' +
                ", isPrimary=" + isPrimary +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
