package com.gemnet.util;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    // Sri Lankan mobile number patterns
    private static final Pattern SRI_LANKAN_MOBILE_PATTERN = 
        Pattern.compile("^(\\+94|0)[1-9][0-9]{8}$");
    
    // Sri Lankan NIC patterns
    private static final Pattern OLD_NIC_PATTERN = Pattern.compile("^[0-9]{9}[vVxX]$");
    private static final Pattern NEW_NIC_PATTERN = Pattern.compile("^[0-9]{12}$");
    
    // Email pattern (basic validation)
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    /**
     * Validate Sri Lankan mobile number
     */
    public static boolean isValidSriLankanMobile(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }
        return SRI_LANKAN_MOBILE_PATTERN.matcher(phoneNumber.trim()).matches();
    }
    
    /**
     * Validate Sri Lankan NIC number
     */
    public static boolean isValidSriLankanNIC(String nicNumber) {
        if (nicNumber == null || nicNumber.isEmpty()) {
            return false;
        }
        
        String cleanNic = nicNumber.trim().toUpperCase();
        return OLD_NIC_PATTERN.matcher(cleanNic).matches() || 
               NEW_NIC_PATTERN.matcher(cleanNic).matches();
    }
    
    /**
     * Validate email address
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim().toLowerCase()).matches();
    }
    
    /**
     * Validate password strength
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        // At least one digit, one lowercase, one uppercase letter
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        
        return hasDigit && hasLower && hasUpper;
    }
    
    /**
     * Validate image file type
     */
    public static boolean isValidImageType(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/gif");
    }
    
    /**
     * Normalize Sri Lankan NIC number
     */
    public static String normalizeSriLankanNIC(String nicNumber) {
        if (nicNumber == null) {
            return null;
        }
        
        return nicNumber.trim().toUpperCase();
    }
    
    /**
     * Normalize phone number
     */
    public static String normalizeSriLankanMobile(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        
        String cleaned = phoneNumber.trim().replaceAll("\\s+", "");
        
        // Convert 0771234567 to +94771234567
        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            return "+94" + cleaned.substring(1);
        }
        
        // Ensure +94 prefix
        if (cleaned.startsWith("94") && cleaned.length() == 11) {
            return "+" + cleaned;
        }
        
        return cleaned;
    }
}
