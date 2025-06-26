package com.gemnet.enums;

public enum UserRole {
    BUYER("buyer"),
    SELLER("seller"),
    ADMIN("admin");
    
    private final String value;
    
    UserRole(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static UserRole fromString(String role) {
        if (role == null) {
            return BUYER; // Default role
        }
        
        for (UserRole userRole : UserRole.values()) {
            if (userRole.name().equalsIgnoreCase(role) || userRole.getValue().equalsIgnoreCase(role)) {
                return userRole;
            }
        }
        return BUYER; // Default role if not found
    }
    
    @Override
    public String toString() {
        return this.value;
    }
}
