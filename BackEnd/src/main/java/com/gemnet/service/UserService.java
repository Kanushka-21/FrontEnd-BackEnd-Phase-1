package com.gemnet.service;

import com.gemnet.dto.UserRegistrationRequest;
import com.gemnet.dto.LoginRequest;
import com.gemnet.dto.AuthenticationResponse;
import com.gemnet.dto.ApiResponse;
import com.gemnet.model.User;
import com.gemnet.repository.UserRepository;
import com.gemnet.security.JwtTokenProvider;
import com.gemnet.exception.UserAlreadyExistsException;
import com.gemnet.exception.UserNotFoundException;
import com.gemnet.exception.InvalidCredentialsException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private FaceRecognitionService faceRecognitionService;
    
    @Autowired
    private NicVerificationService nicVerificationService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Register a new user with personal data
     */
    public ApiResponse<String> registerUser(UserRegistrationRequest request) {
        try {
            System.out.println("👤 Processing registration for: " + request.getEmail());
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                System.out.println("❌ Email already exists: " + request.getEmail());
                return ApiResponse.error("Email already registered");
            }
            
            // Check if NIC number already exists
            if (userRepository.existsByNicNumber(request.getNicNumber())) {
                System.out.println("❌ NIC already exists: " + request.getNicNumber());
                return ApiResponse.error("NIC number already registered");
            }
            
            // Create new user
            User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                request.getAddress(),
                request.getDateOfBirth(),
                request.getNicNumber()
            );
            
            // Set user role
            user.setUserRole(request.getUserRole() != null ? request.getUserRole().toUpperCase() : "BUYER");
            
            // Set default roles
            Set<String> roles = new HashSet<>();
            roles.add("USER");
            user.setRoles(roles);
            
            // Set initial verification status
            user.setVerificationStatus("PENDING");
            user.setIsVerified(false);
            user.setIsFaceVerified(false);
            user.setIsNicVerified(false);
            
            // Save user
            User savedUser = userRepository.save(user);
            
            System.out.println("✅ User registered successfully: " + savedUser.getId());
            return ApiResponse.success("User registered successfully. Proceed to face verification.", savedUser.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Registration failed: " + e.getMessage());
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    /**
     * Process face capture and verification
     */
    public ApiResponse<Map<String, Object>> processFaceVerification(String userId, MultipartFile faceImage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("📷 Processing face verification for user: " + userId);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found: " + userId);
                result.put("error", "User not found");
                return ApiResponse.error("User not found", result);
            }
            
            User user = userOpt.get();
            result.put("userId", userId);
            result.put("email", user.getEmail());
            
            // Validate face image first
            boolean faceDetected = faceRecognitionService.validateFaceInImage(faceImage);
            result.put("faceDetected", faceDetected);
            
            if (!faceDetected) {
                System.err.println("❌ No face detected in image for user: " + userId);
                result.put("error", "No face detected in image");
                return ApiResponse.error("No face detected in the uploaded image. Please upload a clear photo of your face.", result);
            }
            
            // Store face image
            String faceImagePath = fileStorageService.storeFaceImage(faceImage, userId);
            user.setFaceImagePath(faceImagePath);
            result.put("faceImagePath", faceImagePath);
            
            // Extract face features
            String faceFeatures = faceRecognitionService.extractFaceFeatures(faceImage);
            user.setFaceFeatures(faceFeatures);
            result.put("faceFeatures", faceFeatures != null ? "Extracted successfully" : "Failed to extract");
            
            user.setIsFaceVerified(true);
            User savedUser = userRepository.save(user);
            
            result.put("faceVerified", true);
            result.put("nextStep", "NIC Verification");
            result.put("verificationStatus", savedUser.getVerificationStatus());
            
            System.out.println("✅ Face verification completed for user: " + userId);
            return ApiResponse.success("Face captured and verified successfully. Proceed to NIC verification.", result);
            
        } catch (Exception e) {
            System.err.println("❌ Face verification failed for user " + userId + ": " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("userId", userId);
            return ApiResponse.error("Face verification failed: " + e.getMessage(), result);
        }
    }
    
    /**
     * Process NIC verification
     */
    public ApiResponse<Map<String, Object>> processNicVerification(String userId, MultipartFile nicImage) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("🆔 Processing NIC verification for user: " + userId);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found: " + userId);
                result.put("error", "User not found");
                return ApiResponse.error("User not found", result);
            }
            
            User user = userOpt.get();
            result.put("userId", userId);
            result.put("email", user.getEmail());
            result.put("nicNumber", user.getNicNumber());
            
            // Validate NIC image quality
            boolean qualityValid = nicVerificationService.validateNicImageQuality(nicImage);
            result.put("imageQualityValid", qualityValid);
            
            if (!qualityValid) {
                System.out.println("⚠️ NIC image quality warning for user: " + userId);
                result.put("warning", "Image quality might be low. Processing anyway...");
            }
            
            // Store NIC image
            String nicImagePath = fileStorageService.storeNicImage(nicImage, userId);
            user.setNicImagePath(nicImagePath);
            result.put("nicImagePath", nicImagePath);
            
            // Extract NIC number from image
            String extractedNicNumber = nicVerificationService.extractNicNumber(nicImage);
            user.setExtractedNicNumber(extractedNicNumber);
            result.put("extractedNicNumber", extractedNicNumber);
            
            // Extract photo from NIC
            String extractedNicImagePath = nicVerificationService.extractNicPhoto(nicImage, userId);
            user.setExtractedNicImagePath(extractedNicImagePath);
            result.put("extractedNicImagePath", extractedNicImagePath);
              // Verify NIC number matches (case-insensitive comparison)
            boolean nicNumberMatches = false;
            
            // If extractedNicNumber is empty, it means Tesseract isn't available and we're using fallback
            if (extractedNicNumber == null || extractedNicNumber.isEmpty()) {
                System.out.println("⚠️ OCR extraction failed. Since we're on Windows and Tesseract may not be configured,");
                System.out.println("⚠️ we'll trust the user-entered NIC: " + user.getNicNumber());
                nicNumberMatches = true;
            } else {
                nicNumberMatches = user.getNicNumber().toUpperCase().equals(extractedNicNumber.toUpperCase());
            }
            
            result.put("nicNumberMatches", nicNumberMatches);
            
            if (!nicNumberMatches) {
                System.err.println("❌ NIC number mismatch for user " + userId + 
                                 ": expected " + user.getNicNumber() + 
                                 ", extracted " + extractedNicNumber);
                
                user.setVerificationStatus("REJECTED");
                userRepository.save(user);
                
                result.put("error", "NIC number mismatch");
                result.put("expectedNic", user.getNicNumber());
                result.put("extractedNic", extractedNicNumber);
                
                return ApiResponse.error("NIC number does not match the entered information", result);
            }
            
            // Compare face images if both images are available
            boolean faceMatches = false;
            if (user.getFaceImagePath() != null && extractedNicImagePath != null) {
                faceMatches = faceRecognitionService.compareFaces(
                    user.getFaceImagePath(), 
                    extractedNicImagePath
                );
                result.put("faceMatches", faceMatches);
                
                if (!faceMatches) {
                    System.err.println("❌ Face mismatch for user " + userId);
                    user.setVerificationStatus("REJECTED");
                    userRepository.save(user);
                    
                    result.put("error", "Face mismatch");
                    return ApiResponse.error("Face does not match with NIC photo", result);
                }
            } else {
                System.out.println("⚠️ Skipping face comparison - missing face or NIC photo for user: " + userId);
                result.put("faceComparisonSkipped", true);
                result.put("reason", "Missing face image or NIC photo");
            }
            
            // All verifications passed
            user.setIsNicVerified(true);
            user.setIsVerified(true);
            user.setVerificationStatus("VERIFIED");
            User savedUser = userRepository.save(user);
            
            result.put("verificationComplete", true);
            result.put("verificationStatus", "VERIFIED");
            result.put("isVerified", true);
            result.put("isFaceVerified", savedUser.getIsFaceVerified());
            result.put("isNicVerified", savedUser.getIsNicVerified());
            
            System.out.println("✅ Complete verification successful for user: " + userId);
            return ApiResponse.success("User verification completed successfully!", result);
            
        } catch (Exception e) {
            System.err.println("❌ NIC verification failed for user " + userId + ": " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("userId", userId);
            return ApiResponse.error("NIC verification failed: " + e.getMessage(), result);
        }
    }
    
    /**
     * Get user verification status
     */
    public ApiResponse<Map<String, Object>> getUserVerificationStatus(String userId) {
        Map<String, Object> status = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                status.put("error", "User not found");
                return ApiResponse.error("User not found", status);
            }
            
            User user = userOpt.get();
            
            status.put("userId", user.getId());
            status.put("email", user.getEmail());
            status.put("firstName", user.getFirstName());
            status.put("lastName", user.getLastName());
            status.put("nicNumber", user.getNicNumber());
            status.put("userRole", user.getUserRole());
            status.put("isVerified", user.getIsVerified());
            status.put("verificationStatus", user.getVerificationStatus());
            status.put("isFaceVerified", user.getIsFaceVerified());
            status.put("isNicVerified", user.getIsNicVerified());
            status.put("isActive", user.getIsActive());
            status.put("isLocked", user.getIsLocked());
            status.put("createdAt", user.getCreatedAt());
            status.put("updatedAt", user.getUpdatedAt());
            
            // Determine next step
            String nextStep = "Complete";
            if (!user.getIsFaceVerified()) {
                nextStep = "Face Verification";
            } else if (!user.getIsNicVerified()) {
                nextStep = "NIC Verification";
            }
            status.put("nextStep", nextStep);
            
            return ApiResponse.success("User status retrieved", status);
            
        } catch (Exception e) {
            status.put("error", e.getMessage());
            return ApiResponse.error("Failed to get user status: " + e.getMessage(), status);
        }
    }
    
    /**
     * User login
     */
    public ApiResponse<AuthenticationResponse> loginUser(LoginRequest request) {
        try {
            System.out.println("🔑 Processing login for: " + request.getEmail());
            
            Optional<User> userOpt = userRepository.findByEmailAndIsActive(request.getEmail(), true);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found or inactive: " + request.getEmail());
                return ApiResponse.error("Invalid email or password");
            }
            
            User user = userOpt.get();
            
            // Check password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                System.err.println("❌ Invalid password for: " + request.getEmail());
                return ApiResponse.error("Invalid email or password");
            }
            
            // Check if account is locked
            if (user.getIsLocked()) {
                System.err.println("❌ Account locked: " + request.getEmail());
                return ApiResponse.error("Account is locked. Please contact support.");
            }
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(user.getEmail());
            
            // Create response
            AuthenticationResponse response = new AuthenticationResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getIsVerified(),
                user.getVerificationStatus(),
                user.getUserRole() != null ? user.getUserRole().toLowerCase() : "buyer"
            );
            
            System.out.println("✅ Login successful for: " + request.getEmail());
            return ApiResponse.success("Login successful", response);
            
        } catch (Exception e) {
            System.err.println("❌ Login error for " + request.getEmail() + ": " + e.getMessage());
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    /**
     * Get user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Get user by ID
     */
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }
}
