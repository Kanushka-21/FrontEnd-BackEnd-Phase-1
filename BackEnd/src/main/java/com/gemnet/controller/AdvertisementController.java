package com.gemnet.controller;

import com.gemnet.dto.AdvertisementRequestDto;
import com.gemnet.dto.ApiResponse;
import com.gemnet.model.Advertisement;
import com.gemnet.repository.AdvertisementRepository;
import com.gemnet.service.AdvertisementService;
import com.gemnet.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin(origins = "*")
public class AdvertisementController {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AdvertisementService advertisementService;

    /**
     * Create new advertisement
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Advertisement>> createAdvertisement(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam("email") String email,
            @RequestParam("mobileNo") String mobileNo,
            @RequestParam("userId") String userId,
            @RequestParam("images") List<MultipartFile> images) {

        try {
            // Debug logging
            System.out.println("🆕 CREATE Advertisement request received:");
            System.out.println("Title: " + title);
            System.out.println("Category: " + category);
            System.out.println("Description: " + description);
            System.out.println("Price: " + price);
            System.out.println("Email: " + email);
            System.out.println("Mobile: " + mobileNo);
            System.out.println("User ID: " + userId);
            System.out.println("Images count: " + (images != null ? images.size() : 0));
            
            // Validate required parameters
            if (title == null || title.trim().isEmpty()) {
                System.out.println("❌ Title validation failed");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Title is required"));
            }
            if (category == null || category.trim().isEmpty()) {
                System.out.println("❌ Category validation failed");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Category is required"));
            }
            if (userId == null || userId.trim().isEmpty()) {
                System.out.println("❌ User ID validation failed");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User ID is required"));
            }
            if (images == null || images.isEmpty()) {
                System.out.println("❌ Images validation failed");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one image is required"));
            }

            System.out.println("✅ All validations passed, creating advertisement...");

            AdvertisementRequestDto advertisementRequestDto = new AdvertisementRequestDto();
            advertisementRequestDto.setTitle(title.trim());
            advertisementRequestDto.setCategory(category.trim());
            advertisementRequestDto.setDescription(description != null ? description.trim() : "");
            advertisementRequestDto.setPrice(price != null ? price.trim() : "");
            advertisementRequestDto.setEmail(email != null ? email.trim() : "");
            advertisementRequestDto.setMobileNo(mobileNo != null ? mobileNo.trim() : "");
            advertisementRequestDto.setUserId(userId.trim());
            advertisementRequestDto.setImages(images);

            Advertisement savedAdvertisement = advertisementService.createAdvertisement(advertisementRequestDto, advertisementRequestDto.getImages());
            
            System.out.println("🎉 Advertisement created successfully with ID: " + savedAdvertisement.getId());

            return ResponseEntity.ok(
                    ApiResponse.success("Advertisement created successfully", savedAdvertisement));

        } catch (IOException e) {
            System.err.println("❌ Error saving images: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error saving images: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error creating advertisement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating advertisement: " + e.getMessage()));
        }
    }

    /**
     * Get all advertisements with optional approved filter
     */
    @GetMapping
    public ResponseEntity<List<Advertisement>> getAllAdvertisements(
            @RequestParam(required = false) String approved) {
        
        try {
            List<Advertisement> advertisements;
            
            if (approved != null) {
                advertisements = advertisementRepository.findByApproved(approved);
            } else {
                advertisements = advertisementRepository.findAll();
            }
            
            return ResponseEntity.ok(advertisements);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get approved advertisements for homepage
     */
    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<Advertisement>>> getApprovedAdvertisements() {
        try {
            List<Advertisement> approvedAdvertisements = advertisementRepository.findByApproved("true");
            
            return ResponseEntity.ok(
                ApiResponse.success("Approved advertisements retrieved successfully", approvedAdvertisements)
            );
            
        } catch (Exception e) {
            System.err.println("❌ Error retrieving approved advertisements: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve approved advertisements"));
        }
    }

    /**
     * Get advertisement by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdvertisementById(@PathVariable String id) {
        try {
            Optional<Advertisement> advertisement = advertisementRepository.findById(id);
            
            if (advertisement.isPresent()) {
                return ResponseEntity.ok(advertisement.get());
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving advertisement: " + e.getMessage());
        }
    }

    /**
     * Delete advertisement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAdvertisement(@PathVariable String id) {
        try {
            // Debug logging
            System.out.println("🗑️ DELETE request received for advertisement ID: " + id);
            System.out.println("ID length: " + (id != null ? id.length() : "null"));
            System.out.println("ID trimmed: '" + (id != null ? id.trim() : "null") + "'");
            
            // Validate id parameter
            if (id == null || id.trim().isEmpty()) {
                System.out.println("❌ Invalid ID: null or empty");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Advertisement ID is required"));
            }
            
            System.out.println("🔍 Searching for advertisement with ID: " + id);
            Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
            
            if (!advertisementOptional.isPresent()) {
                System.out.println("❌ Advertisement not found in database with ID: " + id);
                System.out.println("Checking all advertisements in database:");
                
                // Debug: List all advertisements
                var allAds = advertisementRepository.findAll();
                System.out.println("Total advertisements in DB: " + allAds.size());
                allAds.forEach(ad -> {
                    System.out.println("  - ID: '" + ad.getId() + "', Title: '" + ad.getTitle() + "'");
                });
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Advertisement not found"));
            }
            
            Advertisement advertisement = advertisementOptional.get();
            System.out.println("✅ Found advertisement: " + advertisement.getTitle());
            
            // Delete associated images
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                System.out.println("🗑️ Deleting associated images: " + advertisement.getImages().size());
                for (String imagePath : advertisement.getImages()) {
                    System.out.println("Processing image path: " + imagePath);
                    try {
                        // Extract filename from URL if it's a full URL
                        String fileName = imagePath;
                        if (imagePath.contains("/")) {
                            fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                        }
                        System.out.println("Extracted filename: " + fileName);
                        fileStorageService.deleteFile(fileName);
                        System.out.println("✅ Deleted image: " + fileName);
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to delete image: " + imagePath + " - " + e.getMessage());
                        // Continue with other images even if one fails
                    }
                }
            }
            
            // Delete advertisement from database
            advertisementRepository.deleteById(id);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Advertisement deleted successfully", "Advertisement with ID " + id + " has been deleted"));
                    
        } catch (Exception e) {
            System.err.println("❌ Error deleting advertisement " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting advertisement: " + e.getMessage()));
        }
    }

    /**
     * Update advertisement
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdvertisement(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam("email") String email,
            @RequestParam("mobileNo") String mobileNo,
            @RequestParam("userId") String userId,
            @RequestParam("images") List<MultipartFile> image) {

        try {
            // Debug logging
            System.out.println("✏️ PUT request received for advertisement ID: " + id);
            System.out.println("Title: " + title);
            System.out.println("User ID: " + userId);
            System.out.println("ID length: " + (id != null ? id.length() : "null"));
            System.out.println("ID trimmed: '" + (id != null ? id.trim() : "null") + "'");

            // Validate required parameters
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Title is required"));
            }
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Category is required"));
            }
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User ID is required"));
            }
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one image is required"));
            }

            // Validate that the advertisement exists and user owns it
            Optional<Advertisement> existingAdOptional = advertisementRepository.findById(id);
            if (!existingAdOptional.isPresent()) {
                System.out.println("❌ Advertisement not found for update: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Advertisement existingAd = existingAdOptional.get();
            if (!existingAd.getUserId().equals(userId)) {
                System.out.println("❌ User does not own advertisement: " + existingAd.getUserId() + " vs " + userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only update your own advertisements"));
            }
            
            System.out.println("✅ Ownership validated, proceeding with update");

            AdvertisementRequestDto advertisementRequestDto = new AdvertisementRequestDto();
            advertisementRequestDto.setTitle(title.trim());
            advertisementRequestDto.setCategory(category.trim());
            advertisementRequestDto.setDescription(description != null ? description.trim() : "");
            advertisementRequestDto.setPrice(price != null ? price.trim() : "");
            advertisementRequestDto.setEmail(email != null ? email.trim() : "");
            advertisementRequestDto.setMobileNo(mobileNo != null ? mobileNo.trim() : "");
            advertisementRequestDto.setUserId(userId.trim());
            advertisementRequestDto.setImages(image);
            // Update advertisement using service
            Optional<Advertisement> updatedAdvertisement = advertisementService.updateAdvertisement(id, advertisementRequestDto);

            if (updatedAdvertisement.isPresent()) {
                return ResponseEntity.ok(updatedAdvertisement.get());
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating images: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating advertisement: " + e.getMessage());
        }
    }
    
    /**
     * Get advertisements by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Advertisement>>> getAdvertisementsByUserId(@PathVariable String userId) {
        try {
            // Validate userId parameter
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User ID is required"));
            }
            
            List<Advertisement> advertisements = advertisementRepository.findByUserId(userId);
            
            if (advertisements.isEmpty()) {
                return ResponseEntity.ok(
                        ApiResponse.success("No advertisements found for this user", advertisements));
            }
            
            return ResponseEntity.ok(
                    ApiResponse.success("Advertisements retrieved successfully", advertisements));
                    
        } catch (Exception e) {
            System.err.println("❌ Error retrieving advertisements for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving advertisements: " + e.getMessage()));
        }
    }
    
    /**
     * Get advertisements by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Advertisement>> getAdvertisementsByCategory(@PathVariable String category) {
        try {
            List<Advertisement> advertisements = advertisementRepository.findByCategory(category);
            return ResponseEntity.ok(advertisements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    /**
     * Approve/Reject advertisement (Admin functionality)
     */
    @PatchMapping("/{id}/approval")
    public ResponseEntity<?> updateAdvertisementApproval(@PathVariable String id, 
                                                        @RequestParam String approve) {
        try {
            Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
            
            if (!advertisementOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Advertisement advertisement = advertisementOptional.get();
            advertisement.setApproved(approve);
            advertisement.updateTimestamp();
            
            Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
            return ResponseEntity.ok(savedAdvertisement);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating advertisement approval: " + e.getMessage());
        }
    }
}
