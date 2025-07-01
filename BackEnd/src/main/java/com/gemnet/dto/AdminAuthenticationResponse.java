package com.gemnet.dto;

public class AdminAuthenticationResponse {
    
    private String token;
    private String type = "Bearer";
    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String department;
    private String employeeId;
    private String accessLevel;
    private Boolean isActive;
    
    // Constructors
    public AdminAuthenticationResponse() {}
    
    public AdminAuthenticationResponse(String token, String userId, String username, String email, 
                                      String firstName, String lastName, String role, String department,
                                      String employeeId, String accessLevel, Boolean isActive) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.department = department;
        this.employeeId = employeeId;
        this.accessLevel = accessLevel;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}