package com.gemnet.dto;

public class AuthenticationResponse {
    
    private String token;
    private String type = "Bearer";
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean isVerified;
    private String verificationStatus;
    
    // Constructors
    public AuthenticationResponse() {}
    
    public AuthenticationResponse(String token, String userId, String email, String firstName, 
                                  String lastName, Boolean isVerified, String verificationStatus) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isVerified = isVerified;
        this.verificationStatus = verificationStatus;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
}
