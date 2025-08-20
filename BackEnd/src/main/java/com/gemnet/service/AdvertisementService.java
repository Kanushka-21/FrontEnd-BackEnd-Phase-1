package com.gemnet.service;

import com.gemnet.dto.AdvertisementRequestDto;
import com.gemnet.model.Advertisement;
import com.gemnet.repository.AdvertisementRepository;
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
        
        // Set sellerId for frontend compatibility
        advertisement.setSellerId(requestDto.getUserId().trim());
        // You can set sellerName from user service if available
        advertisement.setSellerName("Seller"); // Default name, can be improved
        
        advertisement.setImages(imagePaths);
        advertisement.setApproved("pending");
        advertisement.setStatus("pending"); // Set status for frontend compatibility


        Advertisement webImageURLs = transformImagePathsToUrls(advertisement);
        advertisement.setImages(webImageURLs.getImages());
        Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
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
        System.out.println("🗑️ Starting deleteAdvertisement - ID: " + id);
        
        Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
        
        if (advertisementOptional.isPresent()) {
            Advertisement advertisement = advertisementOptional.get();
            System.out.println("✅ Found advertisement to delete: " + advertisement.getId());
            
            // Delete associated images
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                System.out.println("🖼️ Deleting " + advertisement.getImages().size() + " associated images");
                
                for (String imagePath : advertisement.getImages()) {
                    try {
                        // Extract filename from URL using the helper method
                        String fileName = extractFilenameFromUrl(imagePath);
                        System.out.println("🔍 Extracted filename: '" + fileName + "' from URL: '" + imagePath + "'");
                        
                        if (fileName != null && !fileName.isEmpty()) {
                            fileStorageService.deleteFile(fileName);
                            System.out.println("✅ Deleted image file: " + fileName);
                        } else {
                            System.out.println("⚠️ Could not extract filename from: " + imagePath);
                        }
                    } catch (Exception e) {
                        System.err.println("❌ Failed to delete image: " + imagePath + " - " + e.getMessage());
                        e.printStackTrace();
                        // Continue with other images even if one fails
                    }
                }
            }
            
            // Delete advertisement from database
            advertisementRepository.deleteById(id);
            System.out.println("✅ Advertisement deleted from database: " + id);
            return true;
        } else {
            System.out.println("❌ Advertisement not found for deletion: " + id);
        }
        
        return false;
    }

    /**
     * Update advertisement
     */
    public Optional<Advertisement> updateAdvertisement(String id, AdvertisementRequestDto requestDto) throws IOException {
        System.out.println("🔄 Starting updateAdvertisement - ID: " + id + ", DTO: " + requestDto);
        
        Optional<Advertisement> advertisementOptional = advertisementRepository.findById(id);
        
        if (!advertisementOptional.isPresent()) {
            System.out.println("❌ Advertisement not found for update: " + id);
            return Optional.empty();
        }
        
        Advertisement advertisement = advertisementOptional.get();
        System.out.println("✅ Found advertisement for update: " + advertisement.getId());
        
        // Update fields if provided
        if (requestDto.getTitle() != null && !requestDto.getTitle().trim().isEmpty()) {
            advertisement.setTitle(requestDto.getTitle().trim());
            System.out.println("📝 Updated title: " + requestDto.getTitle().trim());
        }
        if (requestDto.getCategory() != null && !requestDto.getCategory().trim().isEmpty()) {
            advertisement.setCategory(requestDto.getCategory().trim());
            System.out.println("📝 Updated category: " + requestDto.getCategory().trim());
        }
        if (requestDto.getDescription() != null) {
            advertisement.setDescription(requestDto.getDescription().trim());
            System.out.println("📝 Updated description");
        }
        if (requestDto.getPrice() != null && !requestDto.getPrice().trim().isEmpty()) {
            advertisement.setPrice(requestDto.getPrice().trim());
            System.out.println("📝 Updated price: " + requestDto.getPrice().trim());
        }
        if (requestDto.getMobileNo() != null && !requestDto.getMobileNo().trim().isEmpty()) {
            advertisement.setMobileNo(requestDto.getMobileNo().trim());
            System.out.println("📝 Updated mobile: " + requestDto.getMobileNo().trim());
        }
        if (requestDto.getEmail() != null && !requestDto.getEmail().trim().isEmpty()) {
            advertisement.setEmail(requestDto.getEmail().trim());
            System.out.println("📝 Updated email: " + requestDto.getEmail().trim());
        }
        if (requestDto.getApproved() != null) {
            advertisement.setApproved(requestDto.getApproved());
            System.out.println("📝 Updated approval status: " + requestDto.getApproved());
        }
        
        // Set compatibility fields for frontend
        advertisement.setSellerId(advertisement.getUserId());
        advertisement.setSellerName(advertisement.getEmail());
        advertisement.setStatus("active");
        System.out.println("✅ Set compatibility fields - sellerId: " + advertisement.getSellerId() + ", sellerName: " + advertisement.getSellerName());
        
        // Handle image updates
        if (requestDto.getImages() != null && !requestDto.getImages().isEmpty()) {
            // Delete old images
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (String imagePath : advertisement.getImages()) {
                    try {
                        // Extract filename from URL if it's a full URL
                        String fileName = imagePath;
                        if (imagePath.contains("/")) {
                            fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                        }
                        fileStorageService.deleteFile(fileName);
                    } catch (Exception e) {
                        System.err.println("Failed to delete old image: " + imagePath + " - " + e.getMessage());
                        // Continue with other images even if one fails
                    }
                }
            }
            
            // Store new images
            List<String> imagePaths = fileStorageService.storeAdvertisementImages(requestDto.getImages(), advertisement.getUserId());
            advertisement.setImages(imagePaths);
        }
        
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
