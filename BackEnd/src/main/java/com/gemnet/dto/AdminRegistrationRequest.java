package com.gemnet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class AdminRegistrationRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username can only contain letters, numbers, underscores, and hyphens")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", 
             message = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Please provide a valid contact number")
    private String contactNumber;
    
    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;    
    @NotBlank(message = "Employee ID is required")
    @Size(min = 3, max = 20, message = "Employee ID must be between 3 and 20 characters")
    private String employeeId;
    
    @Size(max = 200, message = "Admin notes must not exceed 200 characters")
    private String adminNotes;
    
    // Role is fixed as ADMIN
    private String role = "ADMIN";
    
    // Admin-specific access levels
    private String accessLevel = "FULL"; // FULL, LIMITED, READ_ONLY
    
    // Constructors
    public AdminRegistrationRequest() {}
    
    public AdminRegistrationRequest(String username, String email, String password, 
                                   String firstName, String lastName, String contactNumber,
                                   String department, String employeeId) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contactNumber = contactNumber;
        this.department = department;
        this.employeeId = employeeId;
    }
    
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
}