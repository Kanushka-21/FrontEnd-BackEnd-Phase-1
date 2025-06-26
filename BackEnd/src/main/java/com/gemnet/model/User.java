package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Set;

@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Date of birth is required")
    private String dateOfBirth;
    
    @NotBlank(message = "NIC number is required")
    @Indexed(unique = true)
    private String nicNumber;
    
    // Face verification data
    private String faceImagePath;
    private String faceFeatures; // Encoded face features for comparison
    
    // Identity card verification data
    private String nicImagePath;
    private String extractedNicNumber;
    private String extractedNicImagePath; // Extracted photo from NIC
    
    // Verification status
    private Boolean isVerified = false;
    private Boolean isFaceVerified = false;
    private Boolean isNicVerified = false;
    private String verificationStatus; // PENDING, VERIFIED, REJECTED
    
    // User roles
    private Set<String> roles;
    
    // User role (BUYER, SELLER, ADMIN)
    private String userRole;
    
    // Account status
    private Boolean isActive = true;
    private Boolean isLocked = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Constructors
    public User() {}
    
    public User(String firstName, String lastName, String email, String password, 
                String phoneNumber, String address, String dateOfBirth, String nicNumber) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.nicNumber = nicNumber;
        this.verificationStatus = "PENDING";
        this.userRole = "BUYER"; // Default role
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }
    
    public String getFaceImagePath() { return faceImagePath; }
    public void setFaceImagePath(String faceImagePath) { this.faceImagePath = faceImagePath; }
    
    public String getFaceFeatures() { return faceFeatures; }
    public void setFaceFeatures(String faceFeatures) { this.faceFeatures = faceFeatures; }
    
    public String getNicImagePath() { return nicImagePath; }
    public void setNicImagePath(String nicImagePath) { this.nicImagePath = nicImagePath; }
    
    public String getExtractedNicNumber() { return extractedNicNumber; }
    public void setExtractedNicNumber(String extractedNicNumber) { this.extractedNicNumber = extractedNicNumber; }
    
    public String getExtractedNicImagePath() { return extractedNicImagePath; }
    public void setExtractedNicImagePath(String extractedNicImagePath) { this.extractedNicImagePath = extractedNicImagePath; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public Boolean getIsFaceVerified() { return isFaceVerified; }
    public void setIsFaceVerified(Boolean isFaceVerified) { this.isFaceVerified = isFaceVerified; }
    
    public Boolean getIsNicVerified() { return isNicVerified; }
    public void setIsNicVerified(Boolean isNicVerified) { this.isNicVerified = isNicVerified; }
    
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
