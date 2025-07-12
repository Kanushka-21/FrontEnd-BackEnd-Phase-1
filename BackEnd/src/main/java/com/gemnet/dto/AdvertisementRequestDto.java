package com.gemnet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public class AdvertisementRequestDto {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private String description;
    
    @NotBlank(message = "Price is required")
    private String price;


    @NotBlank(message = "MobileNo is required")
    private String mobileNo;

    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "User ID is required")
    private String userId;

    @NotNull(message = "Images required")
    private List<MultipartFile> images;

    private String approved;

    // Constructors
    public AdvertisementRequestDto() {}

    public AdvertisementRequestDto(String title, String category, String description,
                                  String price, String mobileNo, String email, String userId,
                                  List<MultipartFile> images, String approved) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.price = price;
        this.mobileNo = mobileNo;
        this.email = email;
        this.userId = userId;
        this.images = images;
        this.approved = approved;
    }
    
    // Getters and Setters
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
    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    
    public String getUserId() { 
        return userId; 
    }
    
    public void setUserId(String userId) { 
        this.userId = userId; 
    }
    
    public List<MultipartFile> getImages() {
        return images; 
    }
    
    public void setImages(List<MultipartFile> images) { 
        this.images = images; 
    }
    
    public String getApproved() {
        return approved; 
    }
    
    public void setApproved(String approved) {
        this.approved = approved; 
    }
}
