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
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "video", required = false) MultipartFile video) {

        try {
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
            // Validate that at least one media (image OR video) is provided
            if ((images == null || images.isEmpty()) && (video == null || video.isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one image or video is required"));
            }

            AdvertisementRequestDto advertisementRequestDto = new AdvertisementRequestDto();
            advertisementRequestDto.setTitle(title);
            advertisementRequestDto.setCategory(category);
            advertisementRequestDto.setDescription(description);
            advertisementRequestDto.setPrice(price);
            advertisementRequestDto.setEmail(email);
            advertisementRequestDto.setMobileNo(mobileNo);
            advertisementRequestDto.setUserId(userId);
            advertisementRequestDto.setImages(images);
            advertisementRequestDto.setVideo(video);

            Advertisement savedAdvertisement = advertisementService.createAdvertisement(advertisementRequestDto, advertisementRequestDto.getImages(), advertisementRequestDto.getVideo());

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
     * For approved advertisements, orders by priority (highest first) then by creation date
     */
    @GetMapping
    public ResponseEntity<List<Advertisement>> getAllAdvertisements(
            @RequestParam(required = false) String approved) {
        
        try {
            List<Advertisement> advertisements;
            
            if (approved != null) {
                // Get approved advertisements ordered by priority (highest first), then by creation date (newest first)
                advertisements = advertisementRepository.findByApprovedOrderByPriorityDescCreatedOnDesc(approved);
                System.out.println("📢 Fetched " + advertisements.size() + " approved advertisements ordered by priority");
            } else {
                advertisements = advertisementRepository.findAll();
            }
            
            return ResponseEntity.ok(advertisements);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching advertisements: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
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
            // Validate id parameter
            if (id == null || id.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Advertisement ID is required"));
            }
            
            Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
            
            if (!advertisementOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Advertisement not found"));
            }
            
            Advertisement advertisement = advertisementOptional.get();
            
            // Delete associated images
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (String imagePath : advertisement.getImages()) {
                    fileStorageService.deleteFile(imagePath);
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
            @RequestParam(value = "images", required = false) List<MultipartFile> image,
            @RequestParam(value = "video", required = false) MultipartFile video) {

        try {

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

            AdvertisementRequestDto advertisementRequestDto = new AdvertisementRequestDto();
            advertisementRequestDto.setTitle(title);
            advertisementRequestDto.setCategory(category);
            advertisementRequestDto.setDescription(description);
            advertisementRequestDto.setPrice(price);
            advertisementRequestDto.setEmail(email);
            advertisementRequestDto.setMobileNo(mobileNo);
            advertisementRequestDto.setUserId(userId);
            // Only set images if they are provided
            if (image != null && !image.isEmpty()) {
                advertisementRequestDto.setImages(image);
            }
            // Only set video if it is provided
            if (video != null && !video.isEmpty()) {
                advertisementRequestDto.setVideo(video);
            }
            
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

    /**
     * Update advertisement priority (Admin functionality)
     */
    @PutMapping("/{id}/priority")
    public ResponseEntity<ApiResponse<Advertisement>> updateAdvertisementPriority(
            @PathVariable String id, 
            @RequestBody java.util.Map<String, Object> request) {
        try {
            System.out.println("🔄 Updating advertisement priority for ID: " + id);
            
            Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
            
            if (!advertisementOptional.isPresent()) {
                return ResponseEntity.notFound()
                        .body(ApiResponse.error("Advertisement not found"));
            }
            
            Advertisement advertisement = advertisementOptional.get();
            
            // Extract priority from request
            Object priorityObj = request.get("priority");
            Integer priority = 0;
            
            if (priorityObj instanceof Integer) {
                priority = (Integer) priorityObj;
            } else if (priorityObj instanceof String) {
                try {
                    priority = Integer.parseInt((String) priorityObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid priority value"));
                }
            }
            
            // Validate priority range
            if (priority < 0 || priority > 100) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Priority must be between 0 and 100"));
            }
            
            advertisement.setPriority(priority);
            advertisement.updateTimestamp();
            
            Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
            
            System.out.println("✅ Advertisement priority updated successfully: " + savedAdvertisement.getId() + 
                             " -> Priority: " + savedAdvertisement.getPriority());
            
            return ResponseEntity.ok(ApiResponse.success("Priority updated successfully", savedAdvertisement));
            
        } catch (Exception e) {
            System.err.println("❌ Error updating advertisement priority: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating advertisement priority: " + e.getMessage()));
        }
    }
}
