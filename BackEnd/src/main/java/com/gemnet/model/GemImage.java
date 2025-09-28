package com.gemnet.model;

import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

/**
 * Embedded document for gem images and videos within GemListing
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
    
    // Video support fields
    private String mediaType; // "IMAGE" or "VIDEO"
    private String videoUrl; // For video files
    private String videoThumbnailUrl; // Thumbnail for video files
    private Long videoDurationSeconds; // Duration of video in seconds
    private String videoFormat; // Video format (mp4, webm, etc.)
    
    @CreatedDate
    private LocalDateTime uploadedAt;
    
    // Constructors
    public GemImage() {
        this.uploadedAt = LocalDateTime.now();
        this.mediaType = "IMAGE"; // Default to image
    }
    
    public GemImage(String imageId, String originalName, String contentType, Long size, String imageUrl) {
        this();
        this.imageId = imageId;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.imageUrl = imageUrl;
        this.imageType = "GEMSTONE"; // Default to gemstone image
        this.mediaType = "IMAGE";
    }
    
    public GemImage(String imageId, String originalName, String contentType, Long size, String imageUrl, String imageType) {
        this();
        this.imageId = imageId;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.imageUrl = imageUrl;
        this.imageType = imageType;
        this.mediaType = "IMAGE";
    }
    
    // Constructor for video files
    public GemImage(String imageId, String originalName, String contentType, Long size, String videoUrl, String imageType, String mediaType, Long videoDurationSeconds, String videoFormat) {
        this();
        this.imageId = imageId;
        this.originalName = originalName;
        this.contentType = contentType;
        this.size = size;
        this.videoUrl = videoUrl;
        this.imageType = imageType;
        this.mediaType = mediaType;
        this.videoDurationSeconds = videoDurationSeconds;
        this.videoFormat = videoFormat;
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
    
    public String getMediaType() {
        return mediaType;
    }
    
    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getVideoThumbnailUrl() {
        return videoThumbnailUrl;
    }
    
    public void setVideoThumbnailUrl(String videoThumbnailUrl) {
        this.videoThumbnailUrl = videoThumbnailUrl;
    }
    
    public Long getVideoDurationSeconds() {
        return videoDurationSeconds;
    }
    
    public void setVideoDurationSeconds(Long videoDurationSeconds) {
        this.videoDurationSeconds = videoDurationSeconds;
    }
    
    public String getVideoFormat() {
        return videoFormat;
    }
    
    public void setVideoFormat(String videoFormat) {
        this.videoFormat = videoFormat;
    }
    
    // Helper methods
    public boolean isGemstoneImage() {
        return "GEMSTONE".equals(imageType);
    }
    
    public boolean isCertificateImage() {
        return "CERTIFICATE".equals(imageType);
    }
    
    public boolean isVideo() {
        return "VIDEO".equals(mediaType);
    }
    
    public boolean isImage() {
        return "IMAGE".equals(mediaType);
    }
    
    public boolean isVideoContentType() {
        return contentType != null && contentType.startsWith("video/");
    }
    
    public boolean isImageContentType() {
        return contentType != null && contentType.startsWith("image/");
    }
    
    public String getDisplayUrl() {
        if (isVideo()) {
            return videoUrl != null ? videoUrl : imageUrl;
        }
        return imageUrl;
    }
    
    public String getDisplayThumbnailUrl() {
        if (isVideo()) {
            return videoThumbnailUrl != null ? videoThumbnailUrl : thumbnailUrl;
        }
        return thumbnailUrl;
    }
    
    @Override
    public String toString() {
        return "GemImage{" +
                "imageId='" + imageId + '\'' +
                ", originalName='" + originalName + '\'' +
                ", contentType='" + contentType + '\'' +
                ", size=" + size +
                ", imageUrl='" + imageUrl + '\'' +
                ", videoUrl='" + videoUrl + '\'' +
                ", imageType='" + imageType + '\'' +
                ", mediaType='" + mediaType + '\'' +
                ", isPrimary=" + isPrimary +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
