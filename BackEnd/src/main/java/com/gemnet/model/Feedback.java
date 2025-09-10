package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Feedback entity for user-to-user feedback system
 * Allows buyers and sellers to leave feedback about each other
 */
@Document(collection = "feedbacks")
public class Feedback {
    
    @Id
    private String id;
    
    @NotNull(message = "From user ID is required")
    @Field("from_user_id")
    @Indexed
    private String fromUserId;
    
    @NotNull(message = "To user ID is required")
    @Field("to_user_id")
    @Indexed
    private String toUserId;
    
    @NotBlank(message = "From role is required")
    @Field("from_role")
    private String fromRole; // SELLER or BUYER
    
    @NotBlank(message = "To role is required")
    @Field("to_role")
    private String toRole; // SELLER or BUYER
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;
    
    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 1000, message = "Message must be between 10 and 1000 characters")
    private String message;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;
    
    @Field("created_at")
    @Indexed
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    // Flag to indicate if feedback is approved for public display
    @Field("is_approved")
    private Boolean isApproved = true;
    
    // Optional: Reference to transaction/meeting that this feedback is about
    @Field("transaction_id")
    private String transactionId;
    
    public Feedback() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Feedback(String fromUserId, String toUserId, String fromRole, String toRole, 
                   String name, String title, String message, Integer rating) {
        this();
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.fromRole = fromRole;
        this.toRole = toRole;
        this.name = name;
        this.title = title;
        this.message = message;
        this.rating = rating;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFromUserId() {
        return fromUserId;
    }
    
    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }
    
    public String getToUserId() {
        return toUserId;
    }
    
    public void setToUserId(String toUserId) {
        this.toUserId = toUserId;
    }
    
    public String getFromRole() {
        return fromRole;
    }
    
    public void setFromRole(String fromRole) {
        this.fromRole = fromRole;
    }
    
    public String getToRole() {
        return toRole;
    }
    
    public void setToRole(String toRole) {
        this.toRole = toRole;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
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
    
    public Boolean getIsApproved() {
        return isApproved;
    }
    
    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    // Helper methods
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Feedback{" +
                "id='" + id + '\'' +
                ", fromUserId='" + fromUserId + '\'' +
                ", toUserId='" + toUserId + '\'' +
                ", fromRole='" + fromRole + '\'' +
                ", toRole='" + toRole + '\'' +
                ", name='" + name + '\'' +
                ", title='" + title + '\'' +
                ", rating=" + rating +
                ", createdAt=" + createdAt +
                ", isApproved=" + isApproved +
                '}';
    }
}
