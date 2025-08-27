package com.gemnet.service;

import com.gemnet.dto.AdvertisementRequestDto;
import com.gemnet.model.Advertisement;
import com.gemnet.model.User;
import com.gemnet.repository.AdvertisementRepository;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdvertisementService {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${server.port:9092}")
    private String serverPort;
    
    @Value("${app.base-url:http://localhost}")
    private String baseUrl;

    /**
     * Create new advertisement
     */
    public Advertisement createAdvertisement(AdvertisementRequestDto requestDto, List<MultipartFile> images) throws IOException {
        // Validate required fields
        validateAdvertisementRequest(requestDto);
        
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required");
        }

        // Store images
        List<String> imagePaths = fileStorageService.storeAdvertisementImages(images, requestDto.getUserId());

        // Create advertisement entity
        Advertisement advertisement = new Advertisement();
        advertisement.setTitle(requestDto.getTitle().trim());
        advertisement.setCategory(requestDto.getCategory().trim());
        advertisement.setDescription(requestDto.getDescription() != null ? requestDto.getDescription().trim() : "");
        advertisement.setPrice(requestDto.getPrice().trim());
        advertisement.setMobileNo(requestDto.getMobileNo().trim());
        advertisement.setEmail(requestDto.getEmail().trim());
        advertisement.setUserId(requestDto.getUserId().trim());
        advertisement.setImages(imagePaths);
        advertisement.setApproved("pending");


        Advertisement webImageURLs = transformImagePathsToUrls(advertisement);
        advertisement.setImages(webImageURLs.getImages());
        Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
        
        // Notify admin of new advertisement if status is pending
        if ("pending".equals(savedAdvertisement.getApproved())) {
            try {
                // Get user details for the notification
                Optional<User> advertiserOpt = userRepository.findById(savedAdvertisement.getUserId());
                String advertiserName = advertiserOpt.map(user -> user.getFirstName() + " " + user.getLastName())
                                                  .orElse("Unknown User");
                
                notificationService.notifyAdminOfNewAdvertisement(
                    savedAdvertisement.getId(),
                    savedAdvertisement.getTitle(),
                    advertiserName,
                    savedAdvertisement.getUserId()
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to notify admin of new advertisement: " + e.getMessage());
                // Don't fail the advertisement creation if notification fails
            }
        }
        
        return transformImagePathsToUrls(savedAdvertisement);
    }

    /**
     * Get all advertisements with optional approved filter
     */
    public List<Advertisement> getAllAdvertisements(String approved) {
        List<Advertisement> advertisements;
        if (approved != null) {
            advertisements = advertisementRepository.findByApproved(approved);
        } else {
            advertisements = advertisementRepository.findAll();
        }
        
        // Transform image paths to web URLs
        return advertisements.stream()
                .map(this::transformImagePathsToUrls)
                .collect(Collectors.toList());
    }

    /**
     * Get advertisement by ID
     */
    public Optional<Advertisement> getAdvertisementById(String id) {
        Optional<Advertisement> advertisement = advertisementRepository.findById(id);
        return advertisement.map(this::transformImagePathsToUrls);
    }

    /**
     * Delete advertisement
     */
    public boolean deleteAdvertisement(String id) {
        Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
        
        if (advertisementOptional.isPresent()) {
            Advertisement advertisement = advertisementOptional.get();
            
            // Delete associated images
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (String imagePath : advertisement.getImages()) {
                    fileStorageService.deleteFile(imagePath);
                }
            }
            
            // Delete advertisement from database
            advertisementRepository.deleteById(id);
            return true;
        }
        
        return false;
    }

    /**
     * Update advertisement
     */
    public Optional<Advertisement> updateAdvertisement(String id, AdvertisementRequestDto requestDto) throws IOException {
        Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
        
        if (!advertisementOptional.isPresent()) {
            return Optional.empty();
        }
        
        Advertisement advertisement = advertisementOptional.get();
        
        // Update fields if provided
        if (requestDto.getTitle() != null && !requestDto.getTitle().trim().isEmpty()) {
            advertisement.setTitle(requestDto.getTitle().trim());
        }
        if (requestDto.getCategory() != null && !requestDto.getCategory().trim().isEmpty()) {
            advertisement.setCategory(requestDto.getCategory().trim());
        }
        if (requestDto.getDescription() != null) {
            advertisement.setDescription(requestDto.getDescription().trim());
        }
        if (requestDto.getPrice() != null && !requestDto.getPrice().trim().isEmpty()) {
            advertisement.setPrice(requestDto.getPrice().trim());
        }
        if (requestDto.getMobileNo() != null && !requestDto.getMobileNo().trim().isEmpty()) {
            advertisement.setMobileNo(requestDto.getMobileNo().trim());
        }
        if (requestDto.getEmail() != null && !requestDto.getEmail().trim().isEmpty()) {
            advertisement.setEmail(requestDto.getEmail().trim());
        }
        if (requestDto.getApproved() != null) {
            advertisement.setApproved(requestDto.getApproved());
        }
        
        // Handle image updates - only if new images are provided
        if (requestDto.getImages() != null && !requestDto.getImages().isEmpty()) {
            // Delete old images only if we're replacing them with new ones
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (String imagePath : advertisement.getImages()) {
                    fileStorageService.deleteFile(imagePath);
                }
            }
            
            // Store new images
            List<String> imagePaths = fileStorageService.storeAdvertisementImages(requestDto.getImages(), advertisement.getUserId());
            advertisement.setImages(imagePaths);
        }
        // If no new images provided, keep existing images unchanged
        
        // Update timestamp
        advertisement.updateTimestamp();

        Advertisement webImageURLs = transformImagePathsToUrls(advertisement);
        advertisement.setImages(webImageURLs.getImages());
        Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
        return Optional.of(transformImagePathsToUrls(savedAdvertisement));
    }

    /**
     * Get advertisements by user ID
     */
    public List<Advertisement> getAdvertisementsByUserId(String userId) {
        List<Advertisement> advertisements = advertisementRepository.findByUserId(userId);
        return advertisements.stream()
                .map(this::transformImagePathsToUrls)
                .collect(Collectors.toList());
    }

    /**
     * Get advertisements by category
     */
    public List<Advertisement> getAdvertisementsByCategory(String category) {
        List<Advertisement> advertisements = advertisementRepository.findByCategory(category);
        return advertisements.stream()
                .map(this::transformImagePathsToUrls)
                .collect(Collectors.toList());
    }

    /**
     * Transform file system paths to web-accessible URLs
     */
    private Advertisement transformImagePathsToUrls(Advertisement advertisement) {
        if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
            List<String> webUrls = advertisement.getImages().stream()
                    .map(this::convertFilePathToUrl)
                    .collect(Collectors.toList());
            advertisement.setImages(webUrls);
        }
        return advertisement;
    }
    
    /**
     * Convert file system path to web-accessible URL
     */
    private String convertFilePathToUrl(String filePath) {
        try {
            // Extract filename from the full path
            String fileName = Paths.get(filePath).getFileName().toString();
            
            // Determine the directory based on the file path
            String directory = "advertisement-images"; // Default
            
            // Construct web URL
            return String.format("%s:%s/uploads/%s/%s", baseUrl, serverPort, directory, fileName);
        } catch (Exception e) {
            System.err.println("❌ Error converting file path to URL: " + filePath + " - " + e.getMessage());
            // Return the original path as fallback
            return filePath;
        }
    }

    /**
     * Validate advertisement request
     */
    private void validateAdvertisementRequest(AdvertisementRequestDto requestDto) {
        if (requestDto.getTitle() == null || requestDto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (requestDto.getCategory() == null || requestDto.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (requestDto.getPrice() == null || requestDto.getPrice().trim().isEmpty()) {
            throw new IllegalArgumentException("Price is required");
        }
        if (requestDto.getEmail() == null || requestDto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (requestDto.getMobileNo() == null || requestDto.getMobileNo().trim().isEmpty()) {
            throw new IllegalArgumentException("Mobile number is required");
        }
        if (requestDto.getUserId() == null || requestDto.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
    }
}
