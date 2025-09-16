package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "advertisements")
public class Advertisement {
    
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Category is required")
    @Indexed
    private String category;
    
    private String description;
    
    @NotBlank(message = "Price is required")
    private String price;
    
    @NotBlank(message = "Mobile number is required")
    private String mobileNo;

    @NotBlank(message = "Email is required")
    private String email;
    
    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;
    
    private List<String> images;
    
    private String video; // Field to store video file path/URL
    
    @Indexed
    private String approved;
    
    @CreatedDate
    private LocalDateTime createdOn;
    
    @LastModifiedDate
    private LocalDateTime modifiedOn;
    
    // Constructors
    public Advertisement() {
        this.createdOn = LocalDateTime.now();
        this.modifiedOn = LocalDateTime.now();
    }
    
    public Advertisement(String title, String category, String description, String price, 
                        String mobileNo, String email, String userId, List<String> images, String video) {
        this();
        this.title = title;
        this.category = category;
        this.description = description;
        this.price = price;
        this.mobileNo = mobileNo;
        this.email = email;
        this.userId = userId;
        this.images = images;
        this.video = video;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(String mobileNo) {
        this.mobileNo = mobileNo;
    }
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getVideo() {
        return video;
    }

    public void setVideo(String video) {
        this.video = video;
    }

    public String getApproved() {
        return approved;
    }

    public void setApproved(String approved) {
        this.approved = approved;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDateTime createdOn) {
        this.createdOn = createdOn;
    }

    public LocalDateTime getModifiedOn() {
        return modifiedOn;
    }

    public void setModifiedOn(LocalDateTime modifiedOn) {
        this.modifiedOn = modifiedOn;
    }

    // Helper methods
    public void updateTimestamp() {
        this.modifiedOn = LocalDateTime.now();
    }

    public boolean isValidForSave() {
        return title != null && !title.trim().isEmpty() &&
               category != null && !category.trim().isEmpty() &&
               price != null && !price.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() &&
                mobileNo != null && !mobileNo.trim().isEmpty() &&
               userId != null && !userId.trim().isEmpty() &&
               images != null && !images.isEmpty();
    }
    
    @Override
    public String toString() {
        return "Advertisement{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", category='" + category + '\'' +
                ", price='" + price + '\'' +
                ", userId='" + userId + '\'' +
                ", approved=" + approved +
                ", createdOn=" + createdOn +
                '}';
    }
}
